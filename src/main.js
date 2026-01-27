import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import axios from 'axios';
import { writeFileSync } from 'node:fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
  });

  mainWindow.setMenuBarVisibility(false)
  mainWindow.maximize()

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

ipcMain.handle('get_Backend_Address', () => {
  return process.env.VITE_BACK_ADDRESS
})

ipcMain.handle('getDailyReport', async() => {
  const res = await axios.get('http://localhost:3005/api/getDailyReport', {
    responseType: 'arraybuffer'
  })
  const currentDate = new Date
  const reportDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
  const pdfBuffer = Buffer.from(res.data)
  const filePath = path.join(app.getPath('downloads'), `Reporte del ${reportDate.toDateString()}.pdf`)
  writeFileSync(filePath, pdfBuffer)
  return {ok: true, path: filePath}
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
