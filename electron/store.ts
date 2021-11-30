import Store, { Schema } from 'electron-store';
import DB from 'better-sqlite3';

const db = new DB('tempus.sqlite');

db.exec(`CREATE TABLE IF NOT EXISTS time_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity TEXT,
  synched INTEGER DEFAULT 0
);`);

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

export default store;
