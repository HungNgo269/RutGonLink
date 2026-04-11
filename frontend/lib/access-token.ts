type AccessTokenPayload = {
  email: string;
  exp: number;
  sub: string;
  tier: string;
  type: "access";
};

export async function verifyAccessToken(
  token: string | undefined,
): Promise<AccessTokenPayload | null> {
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await createSignature(
    encodedHeader,
    encodedPayload,
    secret,
  );

  if (!constantTimeEquals(signature, expectedSignature)) {
    return null;
  }

  const payload = parsePayload(encodedPayload);

  if (
    !payload ||
    payload.type !== "access" ||
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  return payload;
}

async function createSignature(
  encodedHeader: string,
  encodedPayload: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );

  return toBase64Url(bytesToBase64(new Uint8Array(signature)));
}

function parsePayload(encodedPayload: string): AccessTokenPayload | null {
  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as unknown;

    if (!payload || typeof payload !== "object") {
      return null;
    }

    if (
      !Object.hasOwn(payload, "email") ||
      !Object.hasOwn(payload, "exp") ||
      !Object.hasOwn(payload, "sub") ||
      !Object.hasOwn(payload, "tier") ||
      !Object.hasOwn(payload, "type")
    ) {
      return null;
    }

    const candidate = payload as Record<string, unknown>;

    if (
      typeof candidate.email !== "string" ||
      typeof candidate.exp !== "number" ||
      typeof candidate.sub !== "string" ||
      typeof candidate.tier !== "string" ||
      candidate.type !== "access"
    ) {
      return null;
    }

    return {
      email: candidate.email,
      exp: candidate.exp,
      sub: candidate.sub,
      tier: candidate.tier,
      type: candidate.type,
    };
  } catch {
    return null;
  }
}

function constantTimeEquals(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function toBase64Url(value: string): string {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4 || 4)) % 4;

  return atob(`${normalized}${"=".repeat(padding)}`);
}
