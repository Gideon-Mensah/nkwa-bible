import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";

import SearchBar from "../components/SearchBar";
import { BibleContext } from "../context/BibleContext";

import twiBibleFlat from "../data/bible_flat.json";
import englishBibleFlat from "../data/web_bible_flat.json";

export default function SearchScreen() {
  const { language } = useContext(BibleContext);
  const [searchText, setSearchText] = useState("");

  const bibleFlat =
    language === "twi" ? twiBibleFlat : englishBibleFlat;

  const verses = bibleFlat.verses || bibleFlat.data || bibleFlat;

  const results = Array.isArray(verses)
    ? verses
        .filter((item) => {
          const keyword = searchText.toLowerCase();

          const book = item.book || item.bookName || "";
          const text = item.text || item.verseText || "";

          return (
            book.toLowerCase().includes(keyword) ||
            text.toLowerCase().includes(keyword)
          );
        })
        .slice(0, 50)
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Search Bible</Text>

        <Text style={styles.subtitle}>
          {language === "twi"
            ? "Search Asante Twi Bible"
            : "Search World English Bible"}
        </Text>

        <SearchBar value={searchText} onChangeText={setSearchText} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {searchText.length > 0 &&
            results.map((item, index) => {
              const book = item.book || item.bookName || "";
              const chapter = item.chapter || "";
              const verse = item.verse || "";
              const text = item.text || item.verseText || "";

              return (
                <View key={index} style={styles.resultCard}>
                  <Text style={styles.reference}>
                    {book} {chapter}:{verse}
                  </Text>

                  <Text style={styles.verseText}>{text}</Text>
                </View>
              );
            })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f3",
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f6f7f3",
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#123524",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 22,
  },

  resultCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  reference: {
    fontWeight: "900",
    marginBottom: 8,
    color: "#166534",
    fontSize: 15,
  },

  verseText: {
    fontSize: 17,
    lineHeight: 27,
    color: "#111827",
  },
});