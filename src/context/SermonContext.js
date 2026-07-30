import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SermonContext = createContext();

export function SermonProvider({ children }) {
  const [sermons, setSermons] = useState([]);

  useEffect(() => {
    loadSermons();
  }, []);

  async function loadSermons() {
    const saved = await AsyncStorage.getItem("sermons");
    if (saved) {
      setSermons(JSON.parse(saved));
    }
  }

  async function saveSermons(newSermons) {
    setSermons(newSermons);
    await AsyncStorage.setItem("sermons", JSON.stringify(newSermons));
  }

  function addSermon(sermon) {
    const newSermon = {
      ...sermon,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    saveSermons([newSermon, ...sermons]);
  }

  function deleteSermon(id) {
    const updated = sermons.filter((item) => item.id !== id);
    saveSermons(updated);
  }

  function updateSermon(id, updatedSermon) {
  const updated = sermons.map((sermon) =>
    sermon.id === id
      ? { ...sermon, ...updatedSermon }
      : sermon
  );

  saveSermons(updated);
}

  return (
    <SermonContext.Provider
      value={{
        sermons,
        addSermon,
        deleteSermon,
        updateSermon,
      }}

      
    >
      {children}
    </SermonContext.Provider>
  );
}