import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "bibleStudyCache:v1";
const CACHE_VERSION = "study-v1-openbible-2026-08-17";
const MAX_ENTRIES = 30;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function getStudyCacheKey(selection) {
  return [CACHE_VERSION, selection.bookId, selection.chapter, selection.verseStart || "chapter", selection.verseEnd || "chapter", selection.language].join(":");
}

async function readCache() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (__DEV__) console.warn("Unable to read Bible study cache.", error);
    return [];
  }
}

export async function getCachedStudy(selection, now = Date.now()) {
  const key = getStudyCacheKey(selection);
  const entries = await readCache();
  const entry = entries.find((item) => item.key === key);
  return entry && now - entry.savedAt <= MAX_AGE_MS ? entry.study : null;
}

export async function cacheStudy(selection, study, now = Date.now()) {
  const key = getStudyCacheKey(selection);
  const entries = (await readCache()).filter((item) => item.key !== key && now - item.savedAt <= MAX_AGE_MS);
  const next = [{ key, savedAt: now, study }, ...entries].slice(0, MAX_ENTRIES);
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  catch (error) { if (__DEV__) console.warn("Unable to cache Bible study.", error); }
}

export async function clearBibleStudyCache() {
  try { await AsyncStorage.removeItem(STORAGE_KEY); }
  catch (error) { if (__DEV__) console.warn("Unable to clear Bible study cache.", error); }
}

export { CACHE_VERSION, MAX_AGE_MS, MAX_ENTRIES, STORAGE_KEY };
