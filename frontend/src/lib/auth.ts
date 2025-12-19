/**
 * Authentication helpers for token management.
 */

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, expiresAt: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const token = getToken();
  if (!token) return false;

  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (expiry) {
    const expiryDate = new Date(expiry);
    if (expiryDate <= new Date()) {
      clearToken();
      return false;
    }
  }

  return true;
}

/**
 * Get the user ID from the JWT token.
 * Returns null if no token or unable to decode.
 */
export function getUserIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;

  try {
    // JWT is base64 encoded: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}
