import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStoredCollection } from "../services/storedCollection";
import { createRecordId } from "../utils/studyWorkspace";

export const NoteContext = createContext();

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [storageError, setStorageError] = useState(false);
  const store = useRef(null);
  if (!store.current) store.current = createStoredCollection(AsyncStorage, "notes", (next) => {
    setNotes(next);
    setStorageError(false);
  }, (message, error) => { console.warn(message, error); setStorageError(true); });

  useEffect(() => { store.current.load(); }, []);

  // Stable IDs make repeated saves of a workspace draft an update, never a duplicate.
  const saveNote = useCallback((note) => store.current.update((current) => {
    const existing = current.find((item) => item.id === note.id);
    return existing
      ? current.map((item) => item.id === note.id ? { ...item, note: note.note } : item)
      : [...current, { ...note, createdAt: note.createdAt || new Date().toISOString() }];
  }), []);

  const addNote = useCallback((note) => saveNote({ ...note, id: note.id || createRecordId() }), [saveNote]);
  const deleteNote = useCallback((id) => store.current.update((current) => current.filter((note) => note.id !== id)), []);
  const updateNote = useCallback((id, text) => store.current.update((current) => current.map((note) =>
    note.id === id ? { ...note, note: text } : note
  )), []);

  return <NoteContext.Provider value={{ notes, addNote, saveNote, deleteNote, updateNote, storageError }}>{children}</NoteContext.Provider>;
}
