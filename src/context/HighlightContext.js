import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const HighlightContext = createContext();

export function HighlightProvider({ children }) {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    loadHighlights();
  }, []);

  async function loadHighlights() {
    const saved = await AsyncStorage.getItem("highlights");
    if (saved) {
      setHighlights(JSON.parse(saved));
    }
  }

  async function saveHighlights(newHighlights) {
    setHighlights(newHighlights);
    await AsyncStorage.setItem("highlights", JSON.stringify(newHighlights));
  }

  function saveHighlight(highlight) {
    const filtered = highlights.filter(
      (item) =>
        !(
          item.book === highlight.book &&
          item.chapter === highlight.chapter &&
          item.verse === highlight.verse &&
          item.language === highlight.language
        )
    );

    saveHighlights([...filtered, highlight]);
  }

  function removeHighlight(verseData) {
    const filtered = highlights.filter(
      (item) =>
        !(
          item.book === verseData.book &&
          item.chapter === verseData.chapter &&
          item.verse === verseData.verse &&
          item.language === verseData.language
        )
    );

    saveHighlights(filtered);
  }

  return (
    <HighlightContext.Provider
      value={{ highlights, saveHighlight, removeHighlight }}
    >
      {children}
    </HighlightContext.Provider>
  );
}