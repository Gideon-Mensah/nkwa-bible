// Serialize reads and writes so every updater sees the last successful record set.
// A failed read/parse never authorizes a write over the original stored value.
export function createStoredCollection(storage, key, onChange, onError = console.warn) {
  let current = [];
  let loaded = false;
  let queue = Promise.resolve();

  async function read() {
    if (loaded) return;
    const raw = await storage.getItem(key);
    const parsed = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
      throw new Error(`Invalid ${key} records; stored data was preserved.`);
    }
    current = parsed;
    loaded = true;
    onChange(current);
  }

  function enqueue(operation) {
    const result = queue.then(operation).catch((error) => {
      onError(`Unable to read or save ${key}.`, error);
      return false;
    });
    queue = result.then(() => undefined);
    return result;
  }

  return {
    load: () => enqueue(async () => { await read(); return true; }),
    update: (updater) => enqueue(async () => {
      await read();
      const next = updater(current);
      await storage.setItem(key, JSON.stringify(next));
      current = next;
      onChange(current);
      return true;
    }),
  };
}
