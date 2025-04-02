export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith(
    `${name}=`));

  if (!cookie) return undefined;

  return cookie.split("=")[1].trim();
}

export function setCookie(name: string, value: string, days?: number) {
  if (typeof document === "undefined") return;

  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  
  document.cookie = `${name}=${value}${expires}; path=/`;
} 