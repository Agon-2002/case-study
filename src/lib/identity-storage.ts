import { identitySchema, type Identity } from "./identity";

const NAME_KEY = "image-comments:name";
const BROWSER_ID_KEY = "image-comments:browser-id";
const CHANGE_EVENT = "image-comments:identity-change";

// Used when localStorage is blocked (private mode, strict settings). The
// name then lasts only until the page reloads.
const memoryFallback = new Map<string, string>();

function getItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

function setItem(key: string, value: string | null): void {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    if (value === null) {
      memoryFallback.delete(key);
    } else {
      memoryFallback.set(key, value);
    }
  }
}

let cachedKey: string | undefined;
let cachedIdentity: Identity | null = null;

/**
 * The saved identity, or null when there is no valid name. Returns the same
 * object while nothing changes, as useSyncExternalStore requires.
 */
export function readIdentity(): Identity | null {
  const name = getItem(NAME_KEY);
  const browserId = getItem(BROWSER_ID_KEY);
  const key = `${browserId}\n${name}`;
  if (key === cachedKey) {
    return cachedIdentity;
  }

  const result = identitySchema.safeParse({ name, browserId });
  cachedKey = key;
  cachedIdentity = result.success ? result.data : null;
  return cachedIdentity;
}

function notifyChange(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * A random v4 UUID. crypto.randomUUID only exists on secure origins (https
 * and localhost), but a phone testing the dev server over the local network
 * loads it over plain http, so fall back to crypto.getRandomValues, which
 * works everywhere.
 */
function createBrowserId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const withVersion = bytes.map((byte, index) => {
    if (index === 6) return (byte & 0x0f) | 0x40; // version 4
    if (index === 8) return (byte & 0x3f) | 0x80; // RFC 4122 variant
    return byte;
  });
  const hex = [...withVersion]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

/** Saves the name, keeping this browser's id or creating one. */
export function saveName(name: string): void {
  if (!getItem(BROWSER_ID_KEY)) {
    setItem(BROWSER_ID_KEY, createBrowserId());
  }
  setItem(NAME_KEY, name);
  notifyChange();
}

/** Forgets the name but keeps the browser id. */
export function clearName(): void {
  setItem(NAME_KEY, null);
  notifyChange();
}

export function subscribeToIdentity(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
