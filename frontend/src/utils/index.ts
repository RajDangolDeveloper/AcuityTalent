import Cookies from "universal-cookie";

const cookieStore = new Cookies();

export function setCookie(name: string, value: string) {
  cookieStore.set(name, value);
}

export function removeCookie(name: string) {
  cookieStore.remove(name);
}

export function ViewDependentTime(isoString: string) {
  const now = new Date();
  const dateObj = new Date(isoString);

  const elapsedSeconds = Math.floor((Number(dateObj) - Number(now)) / 1000);
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const { unit, seconds } of units) {
    if (Math.abs(elapsedSeconds) >= seconds || unit === "second") {
      const value = Math.round(elapsedSeconds / seconds);
      return rtf.format(value, unit);
      // Output examples: "18 minutes ago", "yesterday", "in 2 hours"
    }
  }
}
