import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ReadingContext = createContext();

export function ReadingProvider({ children }) {
  const [lastRead, setLastRead] = useState(null);

  useEffect(() => {
    loadLastRead();
  }, []);

  async function loadLastRead() {
    const saved = await AsyncStorage.getItem("lastRead");
    if (saved) {
      setLastRead(JSON.parse(saved));
    }
  }

  async function saveLastRead(reading) {
    setLastRead(reading);
    await AsyncStorage.setItem("lastRead", JSON.stringify(reading));
  }

  return (
    <ReadingContext.Provider value={{ lastRead, saveLastRead }}>
      {children}
    </ReadingContext.Provider>
  );
}