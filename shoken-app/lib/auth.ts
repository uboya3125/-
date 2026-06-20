const SESSION_COOKIE = "shoken_session";
const SESSION_MAX_AGE_SECONDS = 30 * 60; // 30分操作がなければ自動ログアウト

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET が設定されていません");
  return secret;
}

async function getHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string) {
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

function timingSafeEqualString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${expiresAt}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await sign(payload);
  if (!timingSafeEqualString(sig, expected)) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export function verifyPassword(input: string): boolean {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) throw new Error("APP_PASSWORD が設定されていません");
  return timingSafeEqualString(input, appPassword);
}

export { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS };
