// Client-side cookie handling for TanStack application

/**
 * Get a cookie value by name
 * @param name The name of the cookie to get
 * @returns The cookie value or undefined if not found
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return undefined;
}

/**
 * Set a cookie with the given name, value and options
 * @param name The name of the cookie
 * @param value The value to store
 * @param options Cookie options like maxAge, path, etc.
 */
export function setCookie(
  name: string, 
  value: string, 
  options: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  if (typeof document === 'undefined') return;
  
  const cookieOptions = [];
  
  if (options.maxAge) {
    cookieOptions.push(`max-age=${options.maxAge}`);
  }
  
  if (options.path) {
    cookieOptions.push(`path=${options.path}`);
  }
  
  if (options.domain) {
    cookieOptions.push(`domain=${options.domain}`);
  }
  
  if (options.secure) {
    cookieOptions.push('secure');
  }
  
  if (options.sameSite) {
    cookieOptions.push(`samesite=${options.sameSite}`);
  }
  
  const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${
    cookieOptions.length > 0 ? `; ${cookieOptions.join('; ')}` : ''
  }`;
  
  document.cookie = cookieString;
}

/**
 * Remove a cookie by name
 * @param name The name of the cookie to remove
 * @param path The path of the cookie (must match the path used when setting)
 */
export function removeCookie(name: string, path = '/'): void {
  setCookie(name, '', { maxAge: -1, path });
}
