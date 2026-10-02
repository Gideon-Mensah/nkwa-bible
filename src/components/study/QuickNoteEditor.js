import React from "react";
import { Text, TextInput, View } from "react-native";
import { appendText, passageReference } from "../../utils/studyWorkspace";
import { StudyButton, studyStyles as styles } from "./StudyControls";

export default function QuickNoteEditor({ passage, model }) {
  const { notes, draft, status, edit, select, flush, storageError } = model;
  const chapter = { ...passage, verse: undefined, text: "" };
  const [chapterOnly, setChapterOnly] = React.useState(false);
  const target = chapterOnly ? chapter : passage;
  return <>
    <Text accessibilityRole="header" style={styles.heading}>Reading notes</Text>
    <Text style={styles.hint}>Reading: {passageReference(passage)} · {passage.language === "twi" ? "Twi" : "English"}</Text>
    <Text style={styles.label}>Note for {passageReference(draft || target)} · {(draft || target).language}</Text>
    {draft && <Text style={styles.hint}>This note keeps its original passage. Choose New note to write about the current reading.</Text>}
    {!draft && passage.verse != null && <View style={styles.row}>
      <StudyButton selected={!chapterOnly} onPress={() => setChapterOnly(false)}>Selected verse</StudyButton>
      <StudyButton selected={chapterOnly} onPress={() => setChapterOnly(true)}>Whole chapter</StudyButton>
    </View>}
    <TextInput accessibilityLabel="Study note" style={[styles.input, styles.editor]} multiline
      placeholder="Write a thought, prayer or question…" placeholderTextColor="#526158"
      value={draft?.note || ""} onChangeText={(text) => edit(text, target)} onBlur={flush} />
    <Text accessibilityLiveRegion="polite" style={styles.hint}>{status || "Notes save automatically after a short pause."}</Text>
    {storageError && <Text style={styles.hint}>Notes could not be loaded or saved. Your stored data is preserved.</Text>}
    <View style={styles.row}>
      <StudyButton onPress={() => edit(appendText(draft?.note, `${passageReference(passage)}${passage.verse != null ? `\n${passage.text}` : ""}`), target)}>Insert {passage.verse != null ? "verse" : "reference"}</StudyButton>
      <StudyButton onPress={flush}>{status.startsWith("Could") ? "Retry" : "Save now"}</StudyButton>
      <StudyButton onPress={() => select(null)}>New note</StudyButton>
    </View>
    <Text accessibilityRole="header" style={styles.heading}>Saved notes</Text>
    {notes.length === 0 && <Text style={styles.hint}>Your saved notes will appear here.</Text>}
    {notes.map((note, index) => <View key={note.id || index} style={styles.card}>
      <StudyButton selected={draft?.id === note.id} accessibilityLabel={`Open note for ${passageReference(note)}`}
        onPress={() => select(note)}>{passageReference(note)} · {note.language || "Twi"}</StudyButton>
      <Text numberOfLines={3} style={styles.text}>{note.note}</Text>
    </View>)}
  </>;
}
