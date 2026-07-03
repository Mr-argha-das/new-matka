const IST_TIME_ZONE = "Asia/Kolkata";

export const getISTMinutes = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

  return hour * 60 + minute;
};

export const parseMarketTime = (time = "") => {
  const value = String(time).trim();
  const match = value.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) return null;

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
  } else if (hour > 23) {
    return null;
  }

  return hour * 60 + minute;
};

export const isWithinMarketTime = (openTime, closeTime, date = new Date()) => {
  const openMinutes = parseMarketTime(openTime);
  const closeMinutes = parseMarketTime(closeTime);

  if (openMinutes === null || closeMinutes === null) return null;

  const nowMinutes = getISTMinutes(date);

  if (closeMinutes < openMinutes) {
    return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  }

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
};

export const isMarketPlayable = (market, date = new Date()) => {
  if (market?.status !== true) return false;

  const withinTime = isWithinMarketTime(
    market?.openTime || market?.open_time,
    market?.closeTime || market?.close_time,
    date
  );

  return withinTime ?? true;
};

