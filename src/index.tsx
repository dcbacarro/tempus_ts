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

window.Main.on('sync-logs', async (_: any) => {
  const logs = window.Main.getLogsToSync();

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const activity = log.activity;

    const status = await syncLog(activity);
    if (status) {
      window.Main.updateSynchedLog(log.id);
    } else {
      break;
    }
  }
});

ReactDOM.render(<App />, document.getElementById("root"));
