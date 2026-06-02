const { contextBridge, ipcRenderer } = require('electron');

// Expose safe, selected Electron capabilities to the React application
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Trigger native system printing dialogue
   */
  print: () => ipcRenderer.send('print'),

  /**
   * Triggers native high-fidelity vector PDF generation
   * @param {string} defaultFileName Suggested name for the save dialogue
   * @returns {Promise<{success: boolean, cancelled?: boolean, error?: string, filePath?: string}>}
   */
  printToPDF: (defaultFileName) => ipcRenderer.invoke('print-to-pdf', defaultFileName),

  /**
   * Opens an external link safely in the user's default browser
   * @param {string} url The URL to open
   */
  openExternal: (url) => ipcRenderer.send('open-external', url)
});
