import dayjs from "dayjs";
import ReactDOM from "react-dom";
import { App } from "./App";
import { getTimesheetForDate, syncLog } from "./utils/api";

const tryResume = async (employee: string) => {
  const now = dayjs().format('YYYY-MM-DD');
  const info = await getTimesheetForDate(employee, now);

  window.Main.setResumeData(info?.timesheet ?? '', info?.time ?? 0);
}

window.Main.on('try-resume', (employee: string) => {
  tryResume(employee);
});

window.Main.on('sync-logs', async (n: any[]) => {
  const logs = n ?? [];
  const synchedIndexes: number[] = [];
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const status = await syncLog(log);

    if (status) synchedIndexes.push(i);
    else break;
  }

  if (synchedIndexes.length > 0) {
    const reduced = logs.reduce((acc, cur, i) => {
      if (!synchedIndexes.includes(i)) acc.push(cur);
      return acc;
    }, []);

    window.Main.updateToSyncLogs(reduced);
  }
});

ReactDOM.render(<App />, document.getElementById("root"));
