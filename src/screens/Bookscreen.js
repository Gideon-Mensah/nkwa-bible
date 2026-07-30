import { View, Text, StyleSheet, ScrollView } from 'react-native';
import bible from '../data/bible.json';
import BookCard from '../components/BookCard';
import twiBible from "../data/bible.json";
import englishBible from "../data/web_bible.json";
import React, { useContext } from "react";
import { BibleContext } from "../context/BibleContext";

const oldTestamentBooksTwi = [
  "Gyenesis", "Eksodɔs", "Lewitikɔs", "Numeri", "Deuteronomium",
  "Yosua", "Atemmufoɔ", "Rut",
  "1 Samuel", "2 Samuel",
  "1 Ahemfo", "2 Ahemfo",
  "1 Berɛsosɛm", "2 Berɛsosɛm",
  "Esra", "Nehemia", "Ester",
  "Hiob",
  "Nnwom", "Mmebusɛm", "Ɔsɛnkafoɔ",
  "Nnwom mu dwom",
  "Yesaia", "Yeremia",
  "Kwadwom", "Hesekiel", "Daniel",
  "Hosea", "Yoel", "Amos",
  "Obadia", "Yona", "Mika",
  "Nahum", "Habakuk", "Sefania",
  "Hagai", "Sakaria", "Malaki"
];

const newTestamentBooksEnglish = [
  "Matthew", "Mark", "Luke", "John",
  "Acts", "Romans",
  "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians",
  "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy",
  "Titus", "Philemon",
  "Hebrews", "James",
  "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John",
  "Jude", "Revelation"
];

const oldTestamentBooksEnglish = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther",
  "Job",
  "Psalms", "Proverbs", "Ecclesiastes",
  "Song of Solomon",
  "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi"
];

const newTestamentBooksTwi = [
  "Mateo", "Marko", "Luka", "Yohane",
  "Asomafoɔ", "Romafoɔ",
  "1 Korintofoɔ", "2 Korintofoɔ",
  "Galatifoɔ", "Efesofoɔ",
  "Filipifoɔ", "Kolosefoɔ",
  "1 Tesalonikafoɔ", "2 Tesalonikafoɔ",
  "1 Timoteo", "2 Timoteo",
  "Tito", "Filemon",
  "Hebrifoɔ", "Yakobo",
  "1 Petro", "2 Petro",
  "1 Yohane", "2 Yohane", "3 Yohane",
  "Yuda", "Adiyisɛm"
];

export default function BooksScreen({ route, navigation }) {
  const testament = route.params?.testament;
  const { language } = useContext(BibleContext);

  let books = Object.keys(bible.books);

if (testament === "old") {
  books = language === "twi"
    ? oldTestamentBooksTwi
    : oldTestamentBooksEnglish;
}

if (testament === "new") {
  books = language === "twi"
    ? newTestamentBooksTwi
    : newTestamentBooksEnglish;
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {testament === 'old'
          ? 'Old Testament'
          : testament === 'new'
          ? 'New Testament'
          : 'Bible Books'}
      </Text>

      <ScrollView>
        {books.map((book, index) => (
          <BookCard
            key={index}
            bookName={book}
            onPress={() => navigation.navigate('Chapters', { bookName: book })}
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
});