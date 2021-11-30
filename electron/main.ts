import { app, BrowserWindow, ipcMain, powerMonitor } from 'electron';
import Timer from './timer';
import store from './store';
import TempusTray from './tray';
import { toTime } from '../src/utils/helpers';
import cron from 'node-cron';
import path from 'path';

import DB from 'better-sqlite3';

let mainWindow: BrowserWindow | null
let tray: TempusTray | null;
let timer: Timer | null;
let isQuitting = false;

declare const APP_WEBPACK_ENTRY: string
declare const APP_PRELOAD_WEBPACK_ENTRY: string

const db = new DB(path.join(app.getPath('userData'), 'db.sqlite'));

db.exec(`CREATE TABLE IF NOT EXISTS time_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity TEXT,
  synched INTEGER DEFAULT 0
);`);

export const saveLog = (log: any) => {
  const logStr = JSON.stringify(log);
  const insert = db.prepare('INSERT INTO time_logs (activity) VALUES (@log)');
  insert.run({ log: logStr });
};

export const getLogs = () => {
  const stmt = db.prepare('SELECT * FROM time_logs WHERE synched = 0');
  return stmt.get();
};

export const setSynched = (id: number) => {
  const stmt = db.prepare('UPDATE time_logs SET synched = 1 WHERE id = @id');
  const info = stmt.run({ id });

  return info.changes;
};

export const cleanUp = () => {
  const stmt = db.prepare('DELETE FROM time_logs WHERE synched = 1');
  const info = stmt.run();

  return info.changes;
};

export const cleanDB = () => {
  const stmt = db.prepare('DELETE FROM time_logs');
  const info = stmt.run();

  return info.changes;
}

const monitor = async (checkIdle = true) => {
  const time = store.get('tickCounter', 0) + (checkIdle ? 1 : 0);
  store.set('tickCounter', time);

  if (checkIdle) {
    const isIdle = powerMonitor.getSystemIdleTime() > 0;
    const idleTime = store.get('idleCounter', 0) + 1;

    if (!isIdle) {
      const count = store.get('activityCounter', 0);
      store.set('activityCounter', count + 1);
      store.set('lastActivityTimestamp', parseInt(`${Date.now() / 1000}`, 10));
      store.set('idleCounter', 0);
    } else {
      store.set('idleCounter', idleTime);
    }

    if (time % 600 === 0) timer?.analyzeActivity();
  }

  const t = toTime(time);

  if (process.platform === 'darwin') {
    tray?.tray.setTitle(t);
  }

  mainWindow?.webContents.send('tick', t);
}

const tryResume = () => {
  const employee = store.get('userData', null);
  if (employee)
    mainWindow?.webContents.send('try-resume', employee.name);
}

const assetsPath =
  process.env.NODE_ENV === 'production'
    ? process.resourcesPath
    : app.getAppPath()

const setQuit = (toQuit: boolean) => {
  isQuitting = toQuit;
};

function createWindow () {
  mainWindow = new BrowserWindow({
    icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 300,
    height: 310,
    backgroundColor: '#191622',
    webPreferences: {
      devTools: process.env.NODE_ENV !== 'production',
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: true,
      preload: APP_PRELOAD_WEBPACK_ENTRY
    }
  })

  mainWindow.loadURL(APP_WEBPACK_ENTRY).then(async () => {
    await timer?.analyzeRemnantActivity();
    tryResume();
  });

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('show', async () => {
    tray?.refresh();
    if (process.env.NODE_ENV !== 'production')
      mainWindow?.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.on('hide', async () => {
    tray?.refresh();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      event.returnValue = false;
    }
  });

  mainWindow.setMenu(null);

  timer = new Timer(monitor, mainWindow!);
  tray = new TempusTray(mainWindow!, app, timer, setQuit);
}

async function registerListeners () {
  // cron.schedule('* * * * *', () => {
  //   const idleTime = store.get('idleCounter', 0);
  // });

  cron.schedule('0 0 * * *', () => {
    timer?.stop(false);
    store.set('tickCounter', 0);
    cleanUp();
  });

  cron.schedule('*/10 * * * *', () => {
    mainWindow?.webContents.send('sync-logs', true);
  });

  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on('start-timer', (_, __) => {
    timer?.start();
  });

  ipcMain.on('pause-timer', (_, __) => {
    timer?.stop();
  });

  ipcMain.on('update-tray', (_, __) => {
    tray?.refresh();
  });

  ipcMain.on('request-time', (_, __) => {
    monitor(false);
  });
}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  app.quit();
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
