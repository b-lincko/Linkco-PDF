import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Linkco PDF Reader',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    titleBarStyle: 'default',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// ─── IPC Handlers ──────────────────────────────────────────

ipcMain.handle('pdf:open', async () => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  const data = await fs.promises.readFile(filePath);
  const uint8Array = new Uint8Array(data);
  return {
    canceled: false,
    filePath,
    fileName: path.basename(filePath),
    data: Array.from(uint8Array),
  };
});

ipcMain.handle('pdf:save', async (_, data: number[], filePath?: string) => {
  if (!mainWindow) return { canceled: true };

  let targetPath = filePath;
  if (!targetPath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      defaultPath: 'document.pdf',
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    targetPath = result.filePath;
  }

  const buffer = Buffer.from(data);
  await fs.promises.writeFile(targetPath, buffer);
  return { canceled: false, filePath: targetPath };
});

ipcMain.handle('pdf:saveAs', async (_, data: number[]) => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    defaultPath: 'document.pdf',
  });
  if (result.canceled || !result.filePath) return { canceled: true };

  const buffer = Buffer.from(data);
  await fs.promises.writeFile(result.filePath, buffer);
  return { canceled: false, filePath: result.filePath };
});

ipcMain.handle('pdf:exportAs', async (_, data: number[], format: string) => {
  if (!mainWindow) return { canceled: true };
  const extensions: Record<string, string[]> = {
    png: ['png'],
    jpg: ['jpg', 'jpeg'],
    txt: ['txt'],
  };
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: `${format.toUpperCase()} Files`, extensions: extensions[format] || [format] },
    ],
  });
  return result;
});

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('shell:openExternal', async (_, url: string) => {
  await shell.openExternal(url);
});
