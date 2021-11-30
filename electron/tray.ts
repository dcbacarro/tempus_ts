import { app, App, BrowserWindow, dialog, Menu, MenuItem, MenuItemConstructorOptions, NativeImage, nativeImage, Tray } from "electron";
import path from 'path';
import { cleanDB } from "./main";
import store from "./store";
import Timer from "./timer";

const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../renderer/assets');

export const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

class TempusTray {
  trayIcon: NativeImage = nativeImage.createFromPath(getAssetPath('icon.png'));
  tray: Tray;
  win: BrowserWindow;
  timer: Timer;
  app: App;
  setQuit: any;

  constructor(mainWindow: BrowserWindow, app: App, timer: Timer, setQuit: any) {
    this.tray = new Tray(this.trayIcon.resize({ width: 16, height: 16 }));
    this.win = mainWindow;
    this.timer = timer;
    this.app = app;
    this.setQuit = setQuit;

    this.initTray();
  }

  private initTray() {
    this.tray.setToolTip('Tempus');
    this.tray.setContextMenu(this.buildMenu());
  }

  public refresh() {
    this.initTray();
  }

  private buildMenu() {
    const that = this;
    const mainWindow = this.win;
    const icon = this.trayIcon;
    const menuItems: (MenuItem | MenuItemConstructorOptions)[] = [
      {
        label: 'Show App',
        click() {
          mainWindow.show();
        },
        enabled: !mainWindow.isVisible(),
      },
      {
        label: 'Quit',
        async click() {
          if (mainWindow) {
            const timerRunning = store.get('isTimerRunning', false);
            if (timerRunning) that.timer.stop();
            const empData: any = store.get('userData', null);
            const message = empData ? 'This will close the application and stop your timer if it is running.' : 'Do you really want to close the application?';
            const { response } = await dialog.showMessageBox(mainWindow, {
              message,
              title: 'Quit Application',
              buttons: ['Cancel', 'Quit'],
              defaultId: 1,
              icon,
            });

            if (response === 1) {
              that.setQuit(true);
              mainWindow.close();
            } else {
              if (timerRunning) that.timer.start();
            }
          }
        },
      },
    ];

    const empData: any = store.get('userData', null);

    if (empData) {
      menuItems.unshift({
        label: empData.employee_name,
        enabled: false,
      });
      menuItems.push({
        label: 'Sign out',
        async click() {
          if (mainWindow) {
            const timerRunning = store.get('isTimerRunning', false);
            if (timerRunning) that.timer.stop();
            const { response } = await dialog.showMessageBox(mainWindow, {
              message: 'This action will sign you out of the application.',
              title: 'Sign Out',
              buttons: ['Cancel', 'Sign out'],
              defaultId: 1,
              icon,
            });

            if (response === 1) {
              mainWindow?.webContents.send('logout', true);
              that.tray.setTitle('');
              store.clear();
              cleanDB();
            } else {
              if (timerRunning) that.timer.start();
            }
          }
        },
      });
    }

    return Menu.buildFromTemplate(menuItems);
  }
}

export default TempusTray;
