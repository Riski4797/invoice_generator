const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Pinarak Invoice Generator',
    backgroundColor: '#f1f5f9', // slate-100 fallback
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Load appropriate target based on environment
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Remove default menu for a premium standalone feel
  mainWindow.setMenuBarVisibility(false);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handler for Native Print
ipcMain.on('print', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  win.webContents.print({
    silent: false,
    printBackground: true,
    color: true,
    margins: { marginType: 'default' }
  }, (success, failureReason) => {
    if (!success) console.log(`Printing failed: ${failureReason}`);
  });
});

// IPC Handler to safely open external links in standard browser
ipcMain.on('open-external', (event, url) => {
  const { shell } = require('electron');
  shell.openExternal(url);
});

// IPC Handler for High-Fidelity Vector PDF Export
ipcMain.handle('print-to-pdf', async (event, defaultFileName) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { success: false, error: 'Window not found' };

  try {
    // Show OS Save Dialog
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Simpan Invoice sebagai PDF',
      defaultPath: defaultFileName || 'Invoice.pdf',
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, cancelled: true };
    }

    // Generate native vector PDF
    const pdfOptions = {
      margins: { marginType: 'none' }, // no margins to let HTML decide margins exactly
      pageSize: 'A4',
      printBackground: true,
      printSelectionOnly: false,
      landscape: false
    };

    const data = await win.webContents.printToPDF(pdfOptions);
    
    // Save to Disk
    await fs.promises.writeFile(filePath, data);
    return { success: true, filePath };

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler to download update installer and execute it
ipcMain.handle('download-update', async (event, { url, browserDownloadUrl, token }) => {
  const { spawn } = require('child_process');
  const { Readable } = require('stream');
  
  const tempDir = app.getPath('temp');
  const tempFilePath = path.join(tempDir, 'Pinarak_Invoice_Generator_Setup_Update.exe');
  
  // Clean up any old update files if they exist
  try {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  } catch (e) {
    console.error('Failed to delete old update file:', e);
  }
  
  const downloadUrl = token ? url : browserDownloadUrl;
  console.log(`Starting update download from: ${downloadUrl}`);
  
  try {
    const headers = {
      'User-Agent': 'pinarak-invoice-generator-updater'
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
      headers['Accept'] = 'application/octet-stream';
    }
    
    const response = await fetch(downloadUrl, { headers });
    if (!response.ok) {
      throw new Error(`Failed to download update: HTTP ${response.status} ${response.statusText}`);
    }
    
    const totalBytes = Number(response.headers.get('content-length')) || 0;
    let downloadedBytes = 0;
    
    const writer = fs.createWriteStream(tempFilePath);
    const nodeReadable = Readable.fromWeb(response.body);
    
    nodeReadable.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (totalBytes > 0) {
        const percent = Math.min(100, Math.round((downloadedBytes / totalBytes) * 100));
        event.sender.send('download-progress', percent);
      }
    });
    
    nodeReadable.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
      nodeReadable.on('error', reject);
    });
    
    console.log(`Download complete! Launching installer at: ${tempFilePath}`);
    
    // Execute the installer in a detached process and close this app
    const child = spawn(tempFilePath, [], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    
    // Quit application immediately so installer can overwrite active files
    app.quit();
    return { success: true };
    
  } catch (error) {
    console.error('Update download error:', error);
    return { success: false, error: error.message };
  }
});
