import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import VerseItem from "../components/VerseItem";
import { BibleContext } from "../context/BibleContext";
import { NoteContext } from "../context/NoteContext";
import { ReadingContext } from "../context/ReadingContext";

import twiBible from "../data/bible.json";
import englishBible from "../data/web_bible.json";
import { HighlightContext } from "../context/HighlightContext";

export default function VersesScreen({ route }) {
  const { language } = useContext(BibleContext);
  const { addNote } = useContext(NoteContext);
  const { saveLastRead } = useContext(ReadingContext);

  const [selectedVerse, setSelectedVerse] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const bible = language === "twi" ? twiBible : englishBible;

  const { bookName, chapterNumber } = route.params;

  const versesObject = bible.books[bookName]?.[chapterNumber] || {};
  const verses = Object.keys(versesObject);

  const [highlightModalVisible, setHighlightModalVisible] = useState(false);
  const [selectedHighlightVerse, setSelectedHighlightVerse] = useState(null);
  const { saveHighlight } = useContext(HighlightContext);

  useEffect(() => {
    saveLastRead({
      book: bookName,
      chapter: chapterNumber,
      language,
    });
  }, [bookName, chapterNumber, language]);

  function openNoteModal(verseData) {
    setSelectedVerse(verseData);
    setNoteText("");
    setModalVisible(true);
  }

  function saveNote() {
    if (!noteText.trim()) return;

    addNote({
      ...selectedVerse,
      note: noteText.trim(),
    });

    setModalVisible(false);
    setSelectedVerse(null);
    setNoteText("");
  }

  function openHighlightModal(verseData) {
    setSelectedHighlightVerse(verseData);
    setHighlightModalVisible(true);
  }

  function handleHighlight(color) {
    if (!selectedHighlightVerse) return;

    saveHighlight({
      ...selectedHighlightVerse,
      color,
    });

    setHighlightModalVisible(false);
    setSelectedHighlightVerse(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {bookName} {chapterNumber}
      </Text>

      <Text style={styles.subtitle}>
        {language === "twi"
          ? "Asante Twi Bible"
          : "World English Bible"}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {verses.map((verseNumber) => (
          <VerseItem
            key={verseNumber}
            book={bookName}
            chapter={chapterNumber}
            verseNumber={verseNumber}
            text={versesObject[verseNumber]}
            language={language}
            onAddNote={openNoteModal}
            onHighlight={openHighlightModal}
          />
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Note</Text>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {selectedVerse && (
              <Text style={styles.modalReference}>
                {selectedVerse.book} {selectedVerse.chapter}:
                {selectedVerse.verse}
              </Text>
            )}

            <TextInput
              style={styles.noteInput}
              placeholder="Write your note here..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
              <Text style={styles.saveButtonText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={highlightModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose Highlight</Text>

            <TouchableOpacity
              style={[styles.highlightOption, { backgroundColor: "#fef3c7" }]}
              onPress={() => handleHighlight("#fef3c7")}
            >
              <Text style={styles.highlightText}>Yellow - Important</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.highlightOption, { backgroundColor: "#dcfce7" }]}
              onPress={() => handleHighlight("#dcfce7")}
            >
              <Text style={styles.highlightText}>Green - Promise</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.highlightOption, { backgroundColor: "#dbeafe" }]}
              onPress={() => handleHighlight("#dbeafe")}
            >
              <Text style={styles.highlightText}>Blue - Study</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.highlightOption, { backgroundColor: "#ede9fe" }]}
              onPress={() => handleHighlight("#ede9fe")}
            >
              <Text style={styles.highlightText}>Purple - Prayer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setHighlightModalVisible(false);
                setSelectedHighlightVerse(null);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    marginBottom: 24,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: "#ffffff",
    padding: 22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#123524",
  },

  modalReference: {
    color: "#166534",
    fontWeight: "800",
    marginBottom: 14,
  },

  noteInput: {
    minHeight: 140,
    backgroundColor: "#f6f7f3",
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },

  saveButton: {
    backgroundColor: "#166534",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  highlightOption: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  highlightText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  cancelButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginTop: 4,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#374151",
  },
});