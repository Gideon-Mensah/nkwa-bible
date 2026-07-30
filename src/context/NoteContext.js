import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const NoteContext = createContext();

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    const saved = await AsyncStorage.getItem("notes");
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }

  async function saveNotes(newNotes) {
    setNotes(newNotes);
    await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
  }

  function addNote(note) {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    saveNotes([...notes, newNote]);
  }

  function deleteNote(id) {
    const updated = notes.filter((note) => note.id !== id);
    saveNotes(updated);
  }

  function updateNote(id, updatedText) {
  const updated = notes.map((note) =>
    note.id === id
      ? { ...note, note: updatedText }
      : note
  );

  saveNotes(updated);
}

  return (
    <NoteContext.Provider value={{ notes, addNote, deleteNote, updateNote }}>
      {children}
    </NoteContext.Provider>
  );
}