// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'gitDiff'
  | 'updateRecord'
  | 'createNewStore'
  | 'openURL'
  | 'updateBoardList'
  | 'initProject'
  | 'fetchRecord'
  | 'getFonts'
  | 'gitShow'
  | 'updateRecords'
  | 'updateBoardPapers'
  | 'destroyStore'
  | 'boardChildren'
  | 'updatePosition'
  | 'droppedBoardBody'
  | 'openFolder'
  | 'switchMode'
  | 'bookmarking'
  | 'runUpdateTrashIndex'
  | 'importText'
  | 'deleteRecord'
  | 'getStores'
  | 'insertRecord'
  | 'commitPage'
  | 'mergeTextData'
  | 'softDelete'
  | 'hasGit?'
  | 'updatePageList'
  | 'storeGet'
  | 'findChildPage'
  | 'exportText'
  | 'gitLog'
  | 'storeSet'
  | 'eventReply'
  | 'fetchRecords'
  | 'gitCheckOut'
  | 'fetchAllPagesInFolder'
  | 'updateBoardBody';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: Channels, ...args: unknown[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

declare global {
  interface Window {
    electron: ElectronHandler;
  }
}
