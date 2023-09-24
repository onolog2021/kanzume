/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path, { resolve } from 'path';
import { app, BrowserWindow, shell, dialog, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import { error } from 'console';
import Store from 'electron-store';
import sqlite3 from 'sqlite3';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import './ipcMain';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    // アップデートが利用可能な場合
    autoUpdater.on('update-available', () => {
      dialog
        .showMessageBox({
          type: 'info',
          title: 'アップデートが利用可能です',
          message: '新しいバージョンが利用可能です。アップデートしますか？',
          buttons: ['はい', 'いいえ'],
        })
        .then((result) => {
          const buttonIndex = result.response;
          if (buttonIndex === 0) {
            autoUpdater.downloadUpdate();
          }
        });
    });

    // アップデートのダウンロードが完了した場合
    autoUpdater.on('update-downloaded', () => {
      dialog
        .showMessageBox({
          type: 'info',
          title: 'アップデートのダウンロードが完了しました',
          message:
            'アップデートをインストールしてアプリケーションを再起動しますか？',
          buttons: ['再起動', '後で'],
        })
        .then((result) => {
          const buttonIndex = result.response;
          if (buttonIndex === 0) {
            autoUpdater.quitAndInstall();
          }
        });
    });

    // エラーが発生した場合
    autoUpdater.on('error', (error) => {
      log.error('アップデートエラー:', error);
      dialog.showErrorBox(
        'アップデートエラー',
        'アップデート中にエラーが発生しました。詳細はログをご確認ください。'
      );
    });

    // アップデートの確認を開始
    autoUpdater.checkForUpdates();
  }
}

let mainWindow: BrowserWindow | null = null;
Menu.setApplicationMenu(null);
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  // crash error occurrence
  // if (isDebug) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const store = new Store();
  const beforeSize = store.get('windowSize');

  mainWindow = new BrowserWindow({
    show: false,
    width: beforeSize ? beforeSize.width : 600,
    height: beforeSize ? beforeSize.height : 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', () => {
    const windowSize = mainWindow?.getBounds();
    store.set('windowSize', windowSize);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDebug) {
    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();
  }

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
