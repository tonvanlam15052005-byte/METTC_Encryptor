const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const CONFIG = require('./config.js');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 820,
    title: CONFIG.APP_NAME,
    backgroundColor: '#11111b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: CONFIG.DEVTOOLS   // ← bật/tắt theo config
    },
    autoHideMenuBar: true
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // === BẢO MẬT PRODUCTION ===
  if (!CONFIG.DEVTOOLS) {
    // 1. Chặn phím tắt mở DevTools / view-source
    mainWindow.webContents.on('before-input-event', (event, input) => {
      const key = (input.key || '').toLowerCase();
      const ctrl = input.control || input.meta;

      const blocked =
        key === 'f12' ||
        (ctrl && input.shift && (key === 'i' || key === 'j' || key === 'c')) ||
        (ctrl && key === 'u');

      if (blocked) event.preventDefault();
    });

    // 2. Chặn chuột phải (Inspect Element)
    mainWindow.webContents.on('context-menu', (e) => {
      e.preventDefault();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Chặn global shortcut DevTools (nếu DEVTOOLS tắt)
  if (!CONFIG.DEVTOOLS) {
    globalShortcut.register('CommandOrControl+Shift+I', () => {});
    globalShortcut.register('F12', () => {});
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});