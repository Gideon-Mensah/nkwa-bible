import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
} from "react-native";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import useSermonSave from "../components/study/useSermonSave";
import SermonFields from "../components/study/SermonFields";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AddSermonScreen({ navigation }) {

  const { save, saving } = useSermonSave();
  const [title, setTitle] = useState("");
  const [preacher, setPreacher] = useState("");
  const [church, setChurch] = useState("");
  const [date, setDate] = useState("");
  const [scripture, setScripture] = useState("");
  const [notes, setNotes] = useState("");

  const [notesExpanded, setNotesExpanded] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);
  const [expandedFocused, setExpandedFocused] = useState(false);
  const expandedInputRef = useRef(null);
  const wordCount = notes.trim() ? notes.trim().split(/\s+/u).length : 0;
  const wordCountLabel = `${wordCount} ${wordCount === 1 ? "word" : "words"}`;

  function closeNotes() {
    Keyboard.dismiss();
    setNotesExpanded(false);
  }

  async function handleSave() {
    const id = await save({ title, preacher, church, date, scripture, notes }, undefined);
    if (id) navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={24}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View style={styles.container} >
          <Text style={styles.title}>Add Sermon Note</Text>

          <SermonFields disabled={saving} values={{ title, preacher, church, date, scripture }}
            onChange={(field, text) => ({ title: setTitle, preacher: setPreacher, church: setChurch, date: setDate, scripture: setScripture })[field](text)}
            labelStyle={styles.label} inputStyle={styles.input} />

          <View style={styles.notesHeader}>
            <Text style={styles.label}>Sermon Notes</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Expand sermon notes"
              style={styles.editorControl}
              onPress={() => {
                Keyboard.dismiss();
                setNotesExpanded(true);
              }}>
              <Text style={styles.editorControlText}>Expand ↗</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            editable={!saving}
            accessibilityLabel="Sermon notes"
            style={[styles.notesInput, styles.inlineNotes, notesFocused && styles.notesFocused]}
            placeholder="Write your sermon notes, key points, illustrations, and reflections here..."
            placeholderTextColor="#6b7280"
            value={notes}
            onChangeText={setNotes}
            onFocus={() => setNotesFocused(true)}
            onBlur={() => setNotesFocused(false)}
            multiline
            scrollEnabled
            textAlignVertical="top"
          />
          <Text style={styles.wordCount}>{wordCountLabel}</Text>

          <TouchableOpacity accessibilityRole="button" disabled={saving} style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save Sermon"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <Modal
        visible={notesExpanded}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeNotes}
        onShow={() => expandedInputRef.current?.focus()}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              style={styles.modalContent}
              behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <View style={styles.notesHeader}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Close sermon notes"
                  style={styles.editorControl}
                  onPress={closeNotes}>
                  <Text style={styles.editorControlText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle} accessibilityRole="header">Sermon Notes</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.doneButton}
                  onPress={closeNotes}>
                  <Text style={styles.saveButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                ref={expandedInputRef}
                editable={!saving}
                accessibilityLabel="Expanded sermon notes"
                style={[styles.notesInput, styles.expandedNotes, expandedFocused && styles.notesFocused]}
                placeholder="Write your sermon notes, key points, illustrations, and reflections here..."
                placeholderTextColor="#6b7280"
                value={notes}
                onChangeText={setNotes}
                onFocus={() => setExpandedFocused(true)}
                onBlur={() => setExpandedFocused(false)}
                multiline
                scrollEnabled
                textAlignVertical="top"
              />
              <Text style={styles.wordCount}>{wordCountLabel}</Text>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f3",
  },

  container: {
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#123524",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginLeft: 4,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },

  notesInput: {
    backgroundColor: "#FFFFFF",
    color: "#123524",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#dce4dd",
    padding: 18,
    fontSize: 17,
    lineHeight: 26,
  },

  inlineNotes: {
    height: 340,
    minHeight: 340,
  },

  notesFocused: {
    borderColor: "#166534",
  },

  wordCount: {
    fontSize: 13,
    color: "#59665d",
    textAlign: "right",
    paddingVertical: 10,
  },

  editorControl: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  editorControlText: {
    color: "#166534",
    fontSize: 15,
    fontWeight: "700",
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  modalTitle: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#123524",
  },

  expandedNotes: {
    flex: 1,
    minHeight: 0,
  },

  doneButton: {
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: "#166534",
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  saveButton: {
    backgroundColor: "#166534",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

});
