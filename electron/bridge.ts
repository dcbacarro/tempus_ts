import { contextBridge, ipcRenderer } from 'electron'
import store, { getLogs, setSynched } from './store'

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  sendMessage: (message: string) => {
    ipcRenderer.send('message', message)
  },

  triggerEvent: (event: string) => {
    ipcRenderer.send(event);
  },

  startTimer: () => {
    ipcRenderer.send('start-timer');
  },

  pauseTimer: () => {
    ipcRenderer.send('pause-timer');
  },

  setEmployeeData: (data: any) => {
    store.set('userData', data);
  },

  setLoginStatus: (status: boolean) => {
    store.set('isLoggedIn', status);
  },

  setResumeData: (ts: string, time: number) => {
    store.set('timeSheet', ts);
    store.set('tickCounter', time);
  },

  getToken: () => {
    return store.get('token', '');
  },

  setToken: (token: string) => {
    return store.set('token', token);
  },

  getLogsToSync: () => {
    return getLogs();
  },

  updateSynchedLog: (id: string) => {
    setSynched(id);
  },

  setSyncStatus: (status: boolean) => {
    store.set('isSyncing', status);
  },
  
  getTimerStatus: () => {
    return store.get('isTimerRunning', false);
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },

  unsubscribe: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
}

contextBridge.exposeInMainWorld('Main', api)
