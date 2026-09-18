export function setCookie(name, value, days = 180) {
  try {
    const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {
    /* cookies unavailable (e.g. sandboxed preview) — fail silently */
  }
}

export function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function deleteCookie(name) {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  } catch {
    /* noop */
  }
}
