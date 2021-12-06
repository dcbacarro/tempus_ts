/* eslint-disable camelcase */

import dayjs from "dayjs";

const BASE_URL = 'https://erp.codedisruptors.com';

export const requestLogin = async (username: string, password: string) => {
  const resp = await fetch(`${BASE_URL}/api/method/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usr: username,
      pwd: password,
    }),
  });

  const success = resp.status === 200;

  if (success) {
    window.Main.setLoginStatus(true);
    await getEmployee();
  }

  return success;
};

export const logout = async () => {
  await fetch(`${BASE_URL}/api/method/logout`);
};

export const getEmployee = async (): Promise<string | null> => {
  try {
    const resp = await fetch(`${BASE_URL}/api/resource/Employee?fields=["*"]`);
    const res = await resp.json();

    if (resp.status === 200) {
      window.Main.setEmployeeData(res.data[0]);
    } else {
      window.Main.setEmployeeData(null);
      window.Main.setLoginStatus(false);
    }

    return res.data[0].name;
  } catch (e) {}

  return null;
};

type GetTimesheetInfo = {
  timesheet: string;
  time: number;
};

export const getTimesheetForDate = async (employee: string, date: string): Promise<GetTimesheetInfo | null> => {
  try {
    const resp = await fetch(
      `${BASE_URL}/api/resource/Timesheet?filters=[["employee","=","${employee}"],["start_date","=","${date}"],["end_date","=","${date}"]]&fields=["name","start_date","end_date","total_hours"]`
    );

    const { data }: any = await resp.json();

    if (data.length === 1) {
      const { total_hours } = data[0];
      const ts_name = data[0].name;
      const time = Math.floor(total_hours * 60 * 60);

      return { timesheet: ts_name, time };
    }
  } catch (e) {
    console.log(e);
  }

  return null;
};

export const getTimesheet = async (name: string) => {
  try {
    const resp = await fetch(`${BASE_URL}/api/resource/Timesheet/${name}`);

    const { data } = await resp.json();

    return data;
  } catch (e) {
    return null;
  }
};

export const initTimesheet = async (employee: string, date: string, activity: any, screenshot: string) => {
  const start = dayjs(activity.from_time).subtract(1, 'second');

  const initPayload = {
    company: 'Code Disruptors, Inc.',
    employee,
    start_date: date,
    end_date: date,
    time_logs: [{
      from_time: start.format('YYYY-MM-DD HH:mm:ss'),
      to_time: start.format('YYYY-MM-DD HH:mm:ss'),
      hours: 0,
      company: 'Code Disruptors, Inc.',
      activity_type: 'Initialize Timesheet',
      overall_activity: 0,
    }],
  }

  const resp = await fetch(`${BASE_URL}/api/resource/Timesheet`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(initPayload),
  });

  if (resp.status === 200) {
    const data = await resp.json();
    const timesheet = data.data.name;

    const status = await updateTimesheet(timesheet, activity, screenshot);
    return status;
  }

  return false;
};

export const updateTimesheet = async (timesheet: string, activity: any, screenshot: string) => {
  const ts = await getTimesheet(timesheet);
  const time_logs: [] = (ts as any).time_logs;

  const file_url = await syncScreenshot(timesheet, activity.from_time, screenshot);
  activity.screenshot = file_url;

  let resp = await fetch(`${BASE_URL}/api/resource/Timesheet/${timesheet}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      time_logs: [...time_logs, activity],
    }),
  });

  if (resp.status === 417) {
    activity.from_time = dayjs(activity.from_time).add(1, 'second').format('YYYY-MM-DD HH:mm:ss');
    resp = await fetch(`${BASE_URL}/api/resource/Timesheet/${timesheet}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time_logs: [...time_logs, activity],
      }),
    });
  }

  return resp.status === 200 || resp.status === 417;
};

const syncScreenshot = async (name: string, filename: string, screenshot: string) => {
  const payload = {
    cmd: 'uploadfile',
    doctype: 'Timesheet',
    docname: name,
    filename: `${filename}.png`,
    filedata: screenshot,
    from_form: 1,
  };

  try {
    const resp = await fetch(`${BASE_URL}/api/method/uploadfile`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const res = await resp.json();

    return res.message.file_url;    
  } catch (e) {
    console.log('Screenshot sync error.');
    console.log(e);
  }

  return null;
};

export const syncLog = async (payload: any): Promise<boolean> => {
  const { date, activity, screenshot, employee } = payload;
  const timesheet = await getTimesheetForDate(employee, date);

  let status = false;

  if (timesheet) {
    status = await updateTimesheet(timesheet.timesheet, activity, screenshot);
  } else {
    status = await initTimesheet(employee, date, activity, screenshot);
  }

  return status;
};
