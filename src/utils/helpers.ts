import { desktopCapturer } from "electron";

export function toTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const sec = seconds - hours * 3600 - minutes * 60;

  const timeString = `${hours
    .toString()
    .padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

  return timeString;
}

export const takeScreenshot = (): Promise<string> =>
  new Promise((resolve) => {
    desktopCapturer
      .getSources({
        types: ['screen'],
        thumbnailSize: {
          width: 1366,
          height: 768,
        },
      })
      .then(async (sources) => {
        const screenshot = sources[0].thumbnail.toDataURL();
        resolve(screenshot);
      });
  });
