import { app, BrowserWindow, ipcMain, powerMonitor } from 'electron';
import Timer from './timer';
import store from './store';
import TempusTray from './tray';
import { toTime } from '../src/utils/helpers';
import cron from 'node-cron';

let mainWindow: BrowserWindow | null
let tray: TempusTray | null;
let timer: Timer | null;
let isQuitting = false;

declare const APP_WEBPACK_ENTRY: string
declare const APP_PRELOAD_WEBPACK_ENTRY: string

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

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

const setQuit = (toQuit: boolean) => {
  isQuitting = toQuit;
};

function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
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

  store.onDidChange('timeLogsToSync', (n) => {
    mainWindow?.webContents.send('sync-logs', n);
  });
}

async function registerListeners () {
  cron.schedule('* * * * *', () => {
    const idleTime = store.get('idleCounter', 0);
    console.log(idleTime);
  });

  cron.schedule('0 0 * * *', () => {
    timer?.stop();
    store.set('tickCounter', 0);
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
