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

/** Saves the name, keeping this browser's id or creating one. */
export function saveName(name: string): void {
  if (!getItem(BROWSER_ID_KEY)) {
    setItem(BROWSER_ID_KEY, crypto.randomUUID());
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
