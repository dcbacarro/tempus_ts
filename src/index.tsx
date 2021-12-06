import ReactDOM from "react-dom";
import { App } from "./App";
import { syncLog } from "./utils/api";

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
