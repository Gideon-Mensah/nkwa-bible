import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCanonicalBookId } from "../data/bookMappings";

export const ReadingContext = createContext();

export function ReadingProvider({ children }) {
  const [lastRead, setLastRead] = useState(null);

  useEffect(() => {
    loadLastRead();
  }, []);

  async function loadLastRead() {
    try {
      const saved = await AsyncStorage.getItem("lastRead");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          const bookId = parsed.bookId || getCanonicalBookId(parsed.book);
          setLastRead(bookId ? { ...parsed, bookId } : parsed);
        }
      }
    } catch (error) {
      console.warn("Unable to load the last-read passage.", error);
    }
  }

  async function saveLastRead(reading) {
    const normalized = {
      bookId: reading.bookId || getCanonicalBookId(reading.book),
      chapter: reading.chapter,
      language: reading.language === "english" ? "english" : "twi",
    };
    setLastRead(normalized);
    try {
      await AsyncStorage.setItem("lastRead", JSON.stringify(normalized));
    } catch (error) {
      console.warn("Unable to save the last-read passage.", error);
    }
  }

  return (
    <ReadingContext.Provider value={{ lastRead, saveLastRead }}>
      {children}
    </ReadingContext.Provider>
  );
}
