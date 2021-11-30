import Store, { Schema } from 'electron-store';

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
  }
};

const store = new Store<IStore>({ schema, configFileMode: 0o600, watch: true });

export default store;
