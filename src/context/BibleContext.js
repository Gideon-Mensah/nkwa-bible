import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BibleContext = createContext();

export const BibleProvider = ({ children }) => {
  const [language, setLanguage] = useState("twi");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function loadLanguage() {
      try {
        const savedLanguage = await AsyncStorage.getItem("bibleLanguage");
        setLanguage(savedLanguage === "english" || savedLanguage === "twi" ? savedLanguage : "twi");
      } catch (error) {
        console.warn("Unable to load the saved Bible language.", error);
      } finally {
        setIsHydrated(true);
      }
    }
    loadLanguage();
  }, []);

  async function changeLanguage(nextLanguage) {
    const safeLanguage = nextLanguage === "english" ? "english" : "twi";
    setLanguage(safeLanguage);
    try {
      await AsyncStorage.setItem("bibleLanguage", safeLanguage);
    } catch (error) {
      console.warn("Unable to save the Bible language.", error);
    }
  }

  return (
    <BibleContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        isHydrated,
      }}
    >
      {isHydrated ? children : null}
    </BibleContext.Provider>
  );
};
