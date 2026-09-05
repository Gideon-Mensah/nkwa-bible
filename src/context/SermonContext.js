import React, { createContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SermonContext = createContext();

export function SermonProvider({ children }) {
  const [sermons, setSermons] = useState([]);
  const sermonsRef = useRef([]);
  const storageWriteRef = useRef(Promise.resolve());

  useEffect(() => {
    loadSermons();
  }, []);

  async function loadSermons() {
    try {
      const saved = await AsyncStorage.getItem("sermons");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          sermonsRef.current = parsed;
          setSermons(parsed);
        }
      }
    } catch (error) {
      console.warn("Unable to load sermon notes.", error);
    }
  }

  function persistSermons(newSermons) {
    storageWriteRef.current = storageWriteRef.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem("sermons", JSON.stringify(newSermons)))
      .catch((error) => console.warn("Unable to save sermon notes.", error));
  }

  function applySermonUpdate(updater) {
    const next = updater(sermonsRef.current);
    sermonsRef.current = next;
    setSermons(next);
    persistSermons(next);
  }

  function addSermon(sermon) {
    const newSermon = {
      ...sermon,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    applySermonUpdate((current) => [newSermon, ...current]);
  }

  function deleteSermon(id) {
    applySermonUpdate((current) => current.filter((item) => item.id !== id));
  }

  function updateSermon(id, updatedSermon) {
    applySermonUpdate((current) =>
      current.map((sermon) =>
        sermon.id === id ? { ...sermon, ...updatedSermon } : sermon
      )
    );
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
