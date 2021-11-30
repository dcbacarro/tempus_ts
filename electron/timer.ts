/* eslint-disable camelcase */
import dayjs from "dayjs";
import { BrowserWindow } from "electron";
import AdjustingInterval from "../src/utils/adjusting_interval";
import { takeScreenshot } from "../src/utils/helpers";
import { saveLog } from "./main";
import store from "./store";

class Timer {
  timeout: AdjustingInterval;
  callback: () => void;
  interval: number = 100;
  win: BrowserWindow;

  constructor(callback: () => void, win: BrowserWindow) {
    this.callback = callback;
    this.timeout = new AdjustingInterval(callback, this.interval, () => {
      console.log('Interval drifted: Timer adjusted');
    });
    this.win = win;
  };

  private sendStatus = (status: boolean): void => {
    this.win.webContents.send('timer-status', status);
  }

  analyzeActivity = async () => {
    console.log('Checking normally');
    const startTime = store.get('lastSyncTimestamp', 0);
    const endTime = parseInt(`${Date.now() / 1000}`, 10);

    const diff = endTime - startTime;

    if (diff >= 540) this.analyzer(startTime, endTime);
  }

  analyzeRemnantActivity = async (reset = false) => {
    console.log('Checking remnant');
    const startTime = store.get('lastSyncTimestamp', 0);
    const endTime = store.get('lastActivityTimestamp', 0);

    const diff = endTime - startTime;
    if (diff > 0) {
      this.analyzer(startTime, endTime, reset);
    }
  }
  
  analyzer = async (fromTime: number, toTime: number, reset = true) => {
    const activityCounter = store.get('activityCounter', 0);
    const emp = store.get('userData', {});

    const timeDiff = toTime - fromTime;
    const activityPercentage = activityCounter / timeDiff * 100;

    let screenshot = null;

    const start = dayjs(fromTime * 1000);

    if (reset) {
      store.set('lastSyncTimestamp', toTime + 1);
      store.set('activityCounter', 0);
      screenshot = await takeScreenshot();
    }
    
    const payload: any = {
      employee: emp.name,
      date: start.format('YYYY-MM-DD'),
      activity: {
        from_time: start.format('YYYY-MM-DD HH:mm:ss'),
        to_time: dayjs(toTime * 1000).format('YYYY-MM-DD HH:mm:ss'),
        hours: timeDiff / 3600,
        company: 'Code Disruptors, Inc.',
        activity_type: 'Development',
        overall_activity: activityPercentage,
      },
      screenshot,
    };
    saveLog(payload);
  }

  start(): void {
    const now = parseInt(`${Date.now() / 1000}`, 10);
    store.set('lastSyncTimestamp', now);
    store.set('isTimerRunning', true);
    store.set('idleCounter', 0);
    this.sendStatus(true);
    this.timeout.start();
  };

  stop(analyze = true): void {
    store.set('isTimerRunning', false);
    this.timeout.stop();
    if (analyze) this.analyzeActivity();
    this.sendStatus(false);
  }
}

export default Timer;