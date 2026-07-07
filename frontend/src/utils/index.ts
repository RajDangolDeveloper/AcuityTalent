import Cookies from "universal-cookie";

const cookieStore = new Cookies();

export function setCookie(name: string, value: string) {
  cookieStore.set(name, value);
}

export function removeCookie(name: string) {
  cookieStore.remove(name);
}

export function ViewDependentTime(isoString: string) {
  const dateObj = new Date(isoString);

  const viewedTime = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return viewedTime;
}
