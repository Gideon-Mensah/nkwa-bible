import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStoredCollection } from "../services/storedCollection";
import { createRecordId } from "../utils/studyWorkspace";

export const SermonContext = createContext();

export function SermonProvider({ children }) {
  const [sermons, setSermons] = useState([]);
  const [storageError, setStorageError] = useState(false);
  const store = useRef(null);
  if (!store.current) store.current = createStoredCollection(AsyncStorage, "sermons", (next) => {
    setSermons(next);
    setStorageError(false);
  }, (message, error) => { console.warn(message, error); setStorageError(true); });

  useEffect(() => { store.current.load(); }, []);

  const addSermon = useCallback((sermon) => {
    const record = { ...sermon, id: sermon.id || createRecordId(), createdAt: sermon.createdAt || new Date().toISOString() };
    return store.current.update((current) => current.some((item) => item.id === record.id) ? current : [record, ...current]);
  }, []);
  const deleteSermon = useCallback((id) => store.current.update((current) => current.filter((item) => item.id !== id)), []);
  const updateSermon = useCallback((id, updatedSermon) => store.current.update((current) => {
    if (!current.some((item) => item.id === id)) throw new Error("This sermon no longer exists.");
    return current.map((sermon) => sermon.id === id
      ? { ...sermon, ...updatedSermon, id: sermon.id, createdAt: sermon.createdAt } : sermon);
  }), []);

  return <SermonContext.Provider value={{ sermons, addSermon, deleteSermon, updateSermon, storageError }}>{children}</SermonContext.Provider>;
}
