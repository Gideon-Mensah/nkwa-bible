import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    const saved = await AsyncStorage.getItem("bookmarks");
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }

  async function saveBookmarks(newBookmarks) {
    setBookmarks(newBookmarks);
    await AsyncStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
  }

  function addBookmark(verse) {
    const exists = bookmarks.some(
      (item) =>
        item.book === verse.book &&
        item.chapter === verse.chapter &&
        item.verse === verse.verse &&
        item.language === verse.language
    );

    if (!exists) {
      saveBookmarks([...bookmarks, verse]);
    }
  }

  function removeBookmark(verse) {
    const updated = bookmarks.filter(
      (item) =>
        !(
          item.book === verse.book &&
          item.chapter === verse.chapter &&
          item.verse === verse.verse &&
          item.language === verse.language
        )
    );

    saveBookmarks(updated);
  }

  return (
    <BookmarkContext.Provider
      value={{ bookmarks, addBookmark, removeBookmark }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}