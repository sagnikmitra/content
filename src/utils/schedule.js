import { formatDateKey, parseDateValue } from "./date";

export const combineDateAndTime = (dateValue, timeValue) => {
  const date = parseDateValue(dateValue);
  const time = parseDateValue(timeValue);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0
  );
};

export const isBackdatedSchedule = (
  dateValue,
  timeValue,
  now = new Date(),
  graceMs = 60 * 1000
) => combineDateAndTime(dateValue, timeValue).getTime() < now.getTime() - graceMs;

export const isPastDate = (dateValue, now = new Date()) =>
  formatDateKey(dateValue) < formatDateKey(now);
