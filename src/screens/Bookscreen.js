import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import BookCard from "../components/BookCard";
import { BibleContext } from "../context/BibleContext";
import { BOOK_MAPPINGS, getBookName, getTestamentBooks } from "../data/bookMappings";

export default function BooksScreen({ route, navigation }) {
  const testament = route.params?.testament;
  const { language } = useContext(BibleContext);
  const books = testament ? getTestamentBooks(testament, language) : BOOK_MAPPINGS.map((book) => ({ id: book.id, name: getBookName(book.id, language) }));
  return <View style={styles.container}>
    <Text style={styles.title}>{testament === "old" ? "Old Testament" : testament === "new" ? "New Testament" : "Bible Books"}</Text>
    <ScrollView>{books.map((book) => <BookCard key={book.id} bookName={book.name} onPress={() => navigation.navigate("Chapters", { bookId: book.id })} />)}</ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 70, backgroundColor: "#f6f7f3" },
  title: { fontSize: 32, fontWeight: "800", marginBottom: 20, color: "#123524" },
});
