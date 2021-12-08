/* eslint-disable camelcase */

import dayjs from "dayjs";
import axios from 'axios';

const BASE_URL = "https://erp.codedisruptors.com";
axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
// axios.defaults.withCredentials = true;

export const initToken = (token: string | null = null) => {
  const t = token ?? window.Main.getToken();
  window.Main.setToken(t);
  axios.defaults.headers.common.Authorization = `token ${t}`;
};

export const requestLogin = async (username: string, password: string) => {
  const params = new URLSearchParams();
  params.append('usr', username);
  params.append('pwd', password);
  params.append('device', 'mobile');

  const resp = await axios.post('/api/method/login', params);

  const success = resp.status === 200;

  if (success) {
    window.Main.setLoginStatus(true);
    const employee = await getEmployee();

    if (employee) {
      const now = dayjs().format('YYYY-MM-DD');
      const info = await getTimesheetForDate(employee, now);

      window.Main.setResumeData(info?.timesheet ?? '', info?.time ?? 0);
    }
  }

  return success;
};

export const requestAuth = async (key: string, secret: string) => {
  const token = `${key}:${secret}`;
  initToken(token);
  const employee = await getEmployee();
  if (employee) {
    window.Main.setLoginStatus(true);
    const now = dayjs().format('YYYY-MM-DD');
    const info = await getTimesheetForDate(employee, now);

    window.Main.setResumeData(info?.timesheet ?? '', info?.time ?? 0);

    return true;
  }

  return false;
};

export const logout = async () => {
  await axios.get('/api/method/logout');
};

export const getEmployee = async (): Promise<string | null> => {
  try {
    const resp = await axios.get('/api/resource/Employee?fields=["*"]');
    if (resp?.status === 200) {
      window.Main.setEmployeeData(resp.data.data[0]);
    } else {
      window.Main.setEmployeeData(null);
      window.Main.setLoginStatus(false);
    }

    return resp?.data.data[0].name;
  } catch (e) {
    console.log(e);
  }

  return null;
};

type GetTimesheetInfo = {
  timesheet: string;
  time: number;
};

export const getTimesheetForDate = async (employee: string, date: string): Promise<GetTimesheetInfo | null> => {
  try {
    const resp = await axios.get(
      `/api/resource/Timesheet?filters=[["employee","=","${employee}"],["start_date","=","${date}"],["end_date","=","${date}"]]&fields=["name","start_date","end_date","total_hours"]`
    );

    const { data }: any = resp.data;

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
    const resp = await axios.get(`/api/resource/Timesheet/${name}`);

    const { data } = resp.data;

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

  const resp = await axios.post(`/api/resource/Timesheet`, initPayload);

  if (resp.status === 200) {
    const { data } = resp.data;
    const timesheet = data.name;

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

  let resp = await axios.put(`/api/resource/Timesheet/${timesheet}`, {
    time_logs: [...time_logs, activity],
  });

  if (resp.status === 417) {
    activity.from_time = dayjs(activity.from_time).add(1, 'second').format('YYYY-MM-DD HH:mm:ss');
    resp = await axios.put(`${BASE_URL}/api/resource/Timesheet/${timesheet}`, {
      time_logs: [...time_logs, activity],
    });
  }

  return resp.status === 200 || resp.status === 417;
};

const syncScreenshot = async (name: string, filename: string, screenshot: string) => {
  const payload = {
    // cmd: 'uploadfile',
    doctype: 'Timesheet',
    docname: name,
    filename: `${filename}.png`,
    filedata: screenshot,
    decode_base64: 1
    // from_form: 1,
  };

  try {
    const resp = await axios.post(`${BASE_URL}/api/method/frappe.client.attach_file`, payload);

    const res = resp.data;

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
