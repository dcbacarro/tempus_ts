import Store, { Schema } from 'electron-store';
import short from 'short-uuid';

interface IStore {
  isLoggedIn: boolean;
  isTimerRunning: boolean;
  isSyncing: boolean;
  activityCounter: number;
  tickCounter: number;
  idleCounter: number;
  userData?: any;
  timeSheet?: string;
  lastActivityTimestamp?: number;
  lastSyncTimestamp?: number;
  timeLogsToSync: any[];
  waitList: any[];
}

const schema: Schema<IStore> = {
  isLoggedIn: {
    type: 'boolean',
    default: false,
  },
  tickCounter: {
    type: 'number',
    default: 0,
  },
  activityCounter: {
    type: 'number',
    default: 0,
  },
  userData: {
    type: ['object', 'null'],
    default: null,
  },
  timeSheet: {
    type: ['string', 'null'],
    default: null,
  },
  lastActivityTimestamp: {
    type: ['number', 'null'],
    default: null,
  },
  lastSyncTimestamp: {
    type: ['number', 'null'],
    default: null,
  },
  timeLogsToSync: {
    type: 'array',
    default: [],
  },
  isTimerRunning: {
    type: 'boolean',
    default: false,
  },
  idleCounter: {
    type: 'number',
    default: 0,
  },
  isSyncing: {
    type: 'boolean',
    default: false,
  },
  waitList: {
    type: 'array',
    default: [],
  }
};

const store = new Store<IStore>({ schema, configFileMode: 0o600, watch: true });

export const saveLog = (log: any) => {
  const payload = {
    id: short.generate(),
    activity: log,
  };

  const waitlist = store.get('waitList', []);
  waitlist.push(payload);
  store.set('waitList', waitlist);
};

export const getLogs = () => {
  const waitlist = store.get('waitList', []);
  const toSync = store.get('timeLogsToSync', []);

  const waitlistIds = waitlist.map(log => log.id);
  const toSyncIds = toSync.map(log => log.id);

  waitlistIds.forEach(id => {
    if (!toSyncIds.includes(id)) {
      toSync.push(waitlist.find(log => log.id === id));
    } else {
      waitlist.splice(waitlist.findIndex(log => log.id === id), 1);
    }
  });

  store.set('timeLogsToSync', toSync);
  store.set('waitList', waitlist);
  return toSync;
};

export const setSynched = (id: string) => {
  const logs = store.get('timeLogsToSync', []);
  // remove matched id from logs
  const newLogs = logs.filter(log => log.id !== id);
  store.set('timeLogsToSync', newLogs);
};

export const cleanDB = () => {
  store.set('timeLogsToSync', []);
  store.set('waitList', []);
}

export default store;
