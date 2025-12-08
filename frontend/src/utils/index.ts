import Cookies from "universal-cookie";

const cookieStore = new Cookies();

export function setCookie(name: string, value: string) {
  cookieStore.set(name, value);
}

export function removeCookie(name: string) {
  cookieStore.remove(name);
}
