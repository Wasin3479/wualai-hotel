function b64url(str) {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4 ? 4 - (str.length % 4) : 0;
  return atob(str + "=".repeat(pad));
}

export function createFakeJWT(payload, expiresInSec = 60 * 60 * 8) {
  const header = { alg: "none", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSec;
  const data = { ...payload, iat, exp };
  const token = [
    b64url(JSON.stringify(header)),
    b64url(JSON.stringify(data)),
    "demo"
  ].join(".");
  return token;
}

export function parseFakeJWT(token) {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(b64urlDecode(payload));
    return json;
  } catch {
    return null;
  }
}

export function isExpired(token) {
  const p = parseFakeJWT(token);
  if (!p?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= p.exp;
}
