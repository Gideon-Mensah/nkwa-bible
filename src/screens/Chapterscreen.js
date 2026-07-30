import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import ChapterButton from "../components/ChapterButton";
import { BibleContext } from "../context/BibleContext";

import twiBible from "../data/bible.json";
import englishBible from "../data/web_bible.json";

export default function ChaptersScreen({ route, navigation }) {
  const { language } = useContext(BibleContext);

  const bible = language === "twi" ? twiBible : englishBible;

  const { bookName } = route.params;

  const book = bible.books[bookName];
  const chapters = book ? Object.keys(book) : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{bookName}</Text>

      <ScrollView>
        {chapters.map((chapter) => (
          <ChapterButton
            key={chapter}
            chapterNumber={chapter}
            onPress={() =>
              navigation.navigate("Verses", {
                bookName: bookName,
                chapterNumber: chapter,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  padding: 20,
  paddingTop: 70,
  backgroundColor: '#f6f7f3',
},

title: {
  fontSize: 32,
  fontWeight: '800',
  marginBottom: 20,
  color: '#123524',
},
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});