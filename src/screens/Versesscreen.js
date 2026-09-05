import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, View, Text, StyleSheet, ScrollView, Modal, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import VerseItem from "../components/VerseItem";
import { BibleContext } from "../context/BibleContext";
import { NoteContext } from "../context/NoteContext";
import { ReadingContext } from "../context/ReadingContext";
import { HighlightContext } from "../context/HighlightContext";
import { getCanonicalBookId, getBookName } from "../data/bookMappings";
import twiBible from "../data/bible.json";
import englishBible from "../data/web_bible.json";

const MAX_STUDY_RANGE = 25;

export default function VersesScreen({ route, navigation }) {
  const { language, setLanguage } = useContext(BibleContext);
  const { addNote } = useContext(NoteContext);
  const { saveLastRead } = useContext(ReadingContext);
  const { saveHighlight } = useContext(HighlightContext);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [highlightModalVisible, setHighlightModalVisible] = useState(false);
  const [selectedHighlightVerse, setSelectedHighlightVerse] = useState(null);
  const scrollRef = useRef(null);
  const scrollProgress = useRef(0);
  const contentHeight = useRef(0);
  const viewportHeight = useRef(0);
  const restoreScrollAfterLanguageChange = useRef(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  const { chapterNumber } = route.params;
  const bookId = route.params.bookId || getCanonicalBookId(route.params.bookName);
  const bookName = getBookName(bookId, language);
  const bible = language === "twi" ? twiBible : englishBible;
  const versesObject = bookName ? bible.books[bookName]?.[chapterNumber] : null;
  const verses = versesObject ? Object.keys(versesObject) : [];

  useEffect(() => {
    if (bookId) saveLastRead({ bookId, chapter: chapterNumber, language });
  }, [bookId, chapterNumber, language]);

  useEffect(() => {
    if (__DEV__ && bookName && !versesObject) console.warn(`Missing Bible chapter: ${language}/${bookName}/${chapterNumber}`);
  }, [bookName, chapterNumber, language, versesObject]);

  function changeReadingLanguage(nextLanguage) {
    if (nextLanguage === language) return;
    restoreScrollAfterLanguageChange.current = true;
    setLanguage(nextLanguage);
  }

  function saveNote() {
    if (!noteText.trim() || !selectedVerse) return;
    addNote({ ...selectedVerse, note: noteText.trim() });
    setModalVisible(false);
    setSelectedVerse(null);
    setNoteText("");
  }

  function handleHighlight(color) {
    if (!selectedHighlightVerse) return;
    saveHighlight({ ...selectedHighlightVerse, color });
    setHighlightModalVisible(false);
    setSelectedHighlightVerse(null);
  }

  function openStudy(selectionType, verseStart, verseEnd) {
    navigation.navigate("BibleStudy", {
      selection: { selectionType, bookId, chapter: Number(chapterNumber), verseStart, verseEnd, language },
    });
  }

  function cancelSelection() {
    setSelectionMode(false);
    setRangeStart(null);
    setRangeEnd(null);
  }

  function selectRangeVerse(verse) {
    if (rangeStart === null || rangeEnd !== null) {
      setRangeStart(verse);
      setRangeEnd(null);
      return;
    }
    if (verse < rangeStart) {
      Alert.alert("Choose an ending verse", "The ending verse must come after the starting verse.");
      return;
    }
    if (verse - rangeStart + 1 > MAX_STUDY_RANGE) {
      Alert.alert("Passage is too long", `Select no more than ${MAX_STUDY_RANGE} verses.`);
      return;
    }
    setRangeEnd(verse);
  }

  return <View style={styles.container}>
    <View style={styles.headingRow}><View style={styles.headingText}><Text style={styles.title}>{bookName || "Unknown book"} {chapterNumber}</Text><Text style={styles.subtitle}>{language === "twi" ? "Asante Twi Bible" : "World English Bible"}</Text></View>
      <TouchableOpacity accessibilityLabel="Study this chapter with AI" style={styles.chapterStudyButton} onPress={() => openStudy("chapter")}><Ionicons name="sparkles-outline" size={17} color="#2563eb" /><Text style={styles.chapterStudyText}>Study Chapter</Text></TouchableOpacity>
    </View>
    <View style={styles.languageSwitch}>
      {[{ key: "twi", label: "Twi" }, { key: "english", label: "English" }].map((option) => {
        const active = language === option.key;
        return <TouchableOpacity key={option.key} style={[styles.languageButton, active && styles.activeLanguage]} onPress={() => changeReadingLanguage(option.key)}>
          <Text style={[styles.languageText, active && styles.activeText]}>{option.label}</Text>
        </TouchableOpacity>;
      })}
    </View>
    {!selectionMode ? <TouchableOpacity style={styles.selectPassageButton} onPress={() => setSelectionMode(true)}><Ionicons name="checkmark-circle-outline" size={19} color="#166534" /><Text style={styles.selectPassageText}>Select passage</Text></TouchableOpacity> : <View style={styles.selectionBar}>
      <View style={styles.selectionInfo}><Text style={styles.selectionTitle}>{rangeStart === null ? "Choose a starting verse" : rangeEnd === null ? `Start: verse ${rangeStart}. Now choose the end.` : `${bookName} ${chapterNumber}:${rangeStart}${rangeEnd === rangeStart ? "" : `-${rangeEnd}`}`}</Text><Text style={styles.selectionLimit}>Maximum {MAX_STUDY_RANGE} verses</Text></View>
      {rangeEnd !== null ? <TouchableOpacity style={styles.studyRangeButton} onPress={() => openStudy(rangeStart === rangeEnd ? "verse" : "range", rangeStart, rangeEnd)}><Text style={styles.studyRangeText}>Study with AI</Text></TouchableOpacity> : null}
      <TouchableOpacity accessibilityLabel="Cancel passage selection" onPress={cancelSelection}><Ionicons name="close-circle" size={28} color="#6b7280" /></TouchableOpacity>
    </View>}
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      onLayout={(event) => { viewportHeight.current = event.nativeEvent.layout.height; }}
      onContentSizeChange={(_, height) => {
        contentHeight.current = height;
        if (restoreScrollAfterLanguageChange.current) {
          restoreScrollAfterLanguageChange.current = false;
          const maxOffset = Math.max(0, height - viewportHeight.current);
          requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: maxOffset * scrollProgress.current, animated: false }));
        }
      }}
      onScroll={(event) => {
        const maxOffset = contentHeight.current - viewportHeight.current;
        scrollProgress.current = maxOffset > 0 ? event.nativeEvent.contentOffset.y / maxOffset : 0;
      }}
      scrollEventThrottle={32}
    >
      {!versesObject ? <View style={styles.unavailableBox}>
        <Ionicons name="alert-circle-outline" size={30} color="#166534" />
        <Text style={styles.unavailableText}>This chapter is unavailable in the selected language.</Text>
      </View> : verses.map((verseNumber) => <VerseItem
        key={verseNumber}
        book={bookName}
        chapter={chapterNumber}
        verseNumber={verseNumber}
        text={versesObject[verseNumber]}
        language={language}
        selectionMode={selectionMode}
        isSelected={rangeStart !== null && Number(verseNumber) >= rangeStart && Number(verseNumber) <= (rangeEnd ?? rangeStart)}
        onSelect={selectRangeVerse}
        onStudy={(verse) => openStudy("verse", verse, verse)}
        onAddNote={(verseData) => { setSelectedVerse(verseData); setNoteText(""); setModalVisible(true); }}
        onHighlight={(verseData) => { setSelectedHighlightVerse(verseData); setHighlightModalVisible(true); }}
      />)}
    </ScrollView>

    <Modal visible={modalVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}><View style={styles.modalBox}>
        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Add Note</Text><TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#111827" /></TouchableOpacity></View>
        {selectedVerse && <Text style={styles.modalReference}>{selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse}</Text>}
        <TextInput style={styles.noteInput} placeholder="Write your note here..." value={noteText} onChangeText={setNoteText} multiline textAlignVertical="top" />
        <TouchableOpacity style={styles.saveButton} onPress={saveNote}><Text style={styles.saveButtonText}>Save Note</Text></TouchableOpacity>
      </View></View>
    </Modal>

    <Modal visible={highlightModalVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}><View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Choose Highlight</Text>
        {[["#fef3c7", "Yellow - Important"], ["#dcfce7", "Green - Promise"], ["#dbeafe", "Blue - Study"], ["#ede9fe", "Purple - Prayer"]].map(([color, label]) =>
          <TouchableOpacity key={color} style={[styles.highlightOption, { backgroundColor: color }]} onPress={() => handleHighlight(color)}><Text style={styles.highlightText}>{label}</Text></TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelButton} onPress={() => { setHighlightModalVisible(false); setSelectedHighlightVerse(null); }}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
      </View></View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f6f7f3" },
  title: { fontSize: 32, fontWeight: "900", color: "#123524" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  headingRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  headingText: { flex: 1 },
  chapterStudyButton: { flexDirection: "row", alignItems: "center", paddingVertical: 9, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: "#93c5fd", backgroundColor: "#eff6ff" },
  chapterStudyText: { color: "#1d4ed8", fontSize: 12, fontWeight: "900", marginLeft: 5 },
  languageSwitch: { flexDirection: "row", backgroundColor: "#e5e7eb", padding: 5, borderRadius: 18, marginBottom: 18 },
  languageButton: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: "center" },
  activeLanguage: { backgroundColor: "#166534" },
  languageText: { fontSize: 15, fontWeight: "800", color: "#374151" },
  activeText: { color: "#fff" },
  selectPassageButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 13, backgroundColor: "#f0fdf4" },
  selectPassageText: { color: "#166534", fontWeight: "900", marginLeft: 6 },
  selectionBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 11, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: "#86efac" },
  selectionInfo: { flex: 1 }, selectionTitle: { color: "#123524", fontWeight: "800", fontSize: 13 }, selectionLimit: { color: "#6b7280", fontSize: 11, marginTop: 2 },
  studyRangeButton: { backgroundColor: "#2563eb", paddingHorizontal: 11, paddingVertical: 9, borderRadius: 10, marginRight: 8 }, studyRangeText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  unavailableBox: { alignItems: "center", padding: 28, backgroundColor: "#fff", borderRadius: 18 },
  unavailableText: { color: "#374151", textAlign: "center", marginTop: 10, lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#fff", padding: 22, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: "900", color: "#123524", marginBottom: 12 },
  modalReference: { color: "#166534", fontWeight: "800", marginBottom: 14 },
  noteInput: { minHeight: 140, backgroundColor: "#f6f7f3", borderRadius: 18, padding: 16, fontSize: 16, lineHeight: 24, marginBottom: 18 },
  saveButton: { backgroundColor: "#166534", padding: 16, borderRadius: 18, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  highlightOption: { padding: 16, borderRadius: 16, marginBottom: 12 },
  highlightText: { fontSize: 16, fontWeight: "800", color: "#111827" },
  cancelButton: { padding: 16, borderRadius: 16, alignItems: "center", backgroundColor: "#f3f4f6", marginTop: 4 },
  cancelText: { fontSize: 16, fontWeight: "800", color: "#374151" },
});
