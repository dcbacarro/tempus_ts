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
  let log = window.Main.getLogsToSync();
  while (log) {
    const activity = JSON.parse(log.activity);
    const status = await syncLog(activity);

    if (status) {
      window.Main.updateSynchedLog(log.id);
      log = window.Main.getLogsToSync();
    } else 
      break;
  }
});

ReactDOM.render(<App />, document.getElementById("root"));
