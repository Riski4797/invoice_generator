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
