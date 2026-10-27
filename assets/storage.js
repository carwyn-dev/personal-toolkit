import { KEYS, defaults, validateCollection } from "./model.js";
export function createStorage(name = "personal-toolkit") {
  let connection;
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(`${name}:changes`)
      : null;
  const changes = new EventTarget();
  channel?.addEventListener("message", (event) =>
    changes.dispatchEvent(new CustomEvent("change", { detail: event.data })),
  );
  async function openDB() {
    if (connection) return connection;
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("collections"))
          db.createObjectStore("collections", { keyPath: "key" });
      };
      request.onerror = () => {
        connection = null;
        reject(new Error("loadError"));
      };
      request.onblocked = () => {
        connection = null;
        reject(new Error("loadError"));
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          connection = null;
          changes.dispatchEvent(new CustomEvent("unavailable"));
        };
        resolve(db);
      };
    });
    return connection;
  }
  async function read(key) {
    if (!KEYS.includes(key)) throw new Error("invalid");
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections");
      const req = tx.objectStore("collections").get(key);
      let result;
      req.onsuccess = () => {
        try {
          result = validateCollection(key, req.result?.data ?? defaults(key));
        } catch {
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve(result);
      tx.onabort = tx.onerror = () => reject(new Error("loadError"));
    });
  }
  async function snapshot(scope = KEYS) {
    if (scope.some((k) => !KEYS.includes(k))) throw new Error("invalid");
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const result = {};
      const tx = db.transaction("collections");
      const store = tx.objectStore("collections");
      for (const key of scope) {
        const req = store.get(key);
        req.onsuccess = () => {
          try {
            result[key] = validateCollection(
              key,
              req.result?.data ?? defaults(key),
            );
          } catch {
            tx.abort();
          }
        };
      }
      tx.oncomplete = () => resolve(result);
      tx.onabort = tx.onerror = () => reject(new Error("loadError"));
    });
  }
  function notify(keys) {
    channel?.postMessage(keys);
    changes.dispatchEvent(new CustomEvent("change", { detail: keys }));
  }
  async function mutate(key, updater) {
    if (!KEYS.includes(key)) throw new Error("invalid");
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      const req = store.get(key);
      let value, error;
      req.onsuccess = () => {
        try {
          const current = validateCollection(
            key,
            req.result?.data ?? defaults(key),
          );
          value = validateCollection(key, updater(current));
          store.put({ key, data: value });
        } catch (e) {
          error = e;
          tx.abort();
        }
      };
      tx.oncomplete = () => {
        notify([key]);
        resolve(value);
      };
      tx.onabort = tx.onerror = () => reject(error ?? new Error("saveError"));
    });
  }
  async function replace(data) {
    const clean = {};
    for (const [key, value] of Object.entries(data)) {
      clean[key] = validateCollection(key, value);
      // Restoring an older backup must invalidate every open editor's revision.
      if (key === "timer") {
        if (clean[key].active) clean[key].active.id = crypto.randomUUID();
      } else
        clean[key] = clean[key].map((item) => ({
          ...item,
          rev: crypto.randomUUID(),
          ...(key === "flashcards"
            ? {
                cards: item.cards.map((card) => ({
                  ...card,
                  rev: crypto.randomUUID(),
                })),
              }
            : {}),
        }));
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      for (const [key, value] of Object.entries(clean))
        store.put({ key, data: value });
      tx.oncomplete = () => {
        notify(Object.keys(clean));
        resolve();
      };
      tx.onabort = tx.onerror = () => reject(new Error("saveError"));
    });
  }
  async function close() {
    channel?.close();
    if (connection) {
      (await connection).close();
      connection = null;
    }
  }
  return { openDB, read, snapshot, mutate, replace, changes, close };
}
const production = createStorage();
export const { openDB, read, snapshot, mutate, replace, changes } = production;
