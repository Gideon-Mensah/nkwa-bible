import React, { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import QuickNoteEditor from "./QuickNoteEditor";
import SermonWorkspace from "./SermonWorkspace";
import useStudyNote from "./useStudyNote";
import useSermonSave from "./useSermonSave";
import { StudyButton, studyStyles } from "./StudyControls";

export default function StudyWorkspace({ children, passage, wide, open, setOpen, mode, setMode, onChangeLanguage }) {
  const notes = useStudyNote();
  const [draft, setDraft] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const { save, saving } = useSermonSave();
  const navigation = useNavigation();
  usePreventRemove(dirty || notes.status === "Unsaved" || notes.status === "Saving…" || notes.status.startsWith("Could"), ({ data }) => {
    Alert.alert("Leave study workspace?", dirty ? "Your sermon has unsaved changes." : "Your note has not finished saving.", [
      { text: "Keep studying", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: async () => {
        if (await notes.flush()) navigation.dispatch(data.action);
      } },
    ]);
  });

  function close() {
    Keyboard.dismiss();
    void notes.flush();
    setOpen(false);
  }

  const panel = <View style={styles.panel}>
    <View style={styles.header}>
      <Text accessibilityRole="header" style={studyStyles.heading}>Study workspace</Text>
      <StudyButton accessibilityLabel="Close Study Mode" onPress={close}>Close</StudyButton>
    </View>
    <View style={styles.tabs}>
      {["Notes", "Sermon"].map((tab) => <StudyButton key={tab} accessibilityRole="tab" selected={mode === tab}
        accessibilityLabel={`${tab} mode`} onPress={() => { Keyboard.dismiss(); void notes.flush(); setMode(tab); }}>{tab}</StudyButton>)}
    </View>
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" enableOnAndroid extraScrollHeight={24}
      contentContainerStyle={studyStyles.body}>
      <View style={studyStyles.row}>
        {["twi", "english"].map((language) => <StudyButton key={language} selected={passage.language === language}
          accessibilityLabel={`Read Bible in ${language === "twi" ? "Twi" : "English"}`}
          onPress={() => onChangeLanguage(language)}>{language === "twi" ? "Twi" : "English"}</StudyButton>)}
      </View>
      {mode === "Notes" ? <QuickNoteEditor passage={passage} model={notes} /> :
        <SermonWorkspace passage={passage} model={{ draft, setDraft, selectedId, setSelectedId, dirty, setDirty, save, saving }} />}
    </KeyboardAwareScrollView>
  </View>;

  return <View style={styles.workspace}>
    <View style={[styles.reader, wide && open && styles.readerWide]}>{children}</View>
    {wide && open && <View style={styles.sidePanel}>{panel}</View>}
    <Modal visible={!wide && open} animationType="slide" presentationStyle="fullScreen"
      supportedOrientations={["portrait", "landscape", "portrait-upside-down"]} onRequestClose={close}>
      <SafeAreaProvider><SafeAreaView style={styles.modal}>
        <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          {panel}
        </KeyboardAvoidingView>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  workspace: { flex: 1, flexDirection: "row", backgroundColor: "#f6f7f3" },
  reader: { flex: 1, minWidth: 0 },
  readerWide: { flex: 58, minWidth: 480 },
  sidePanel: { flex: 42, minWidth: 360, borderLeftWidth: 1, borderColor: "#c6d8ca" },
  panel: { flex: 1, backgroundColor: "#f6f7f3" },
  header: { padding: 16, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 },
  tabs: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", gap: 8, borderBottomWidth: 1, borderColor: "#dce4dd" },
  modal: { flex: 1, backgroundColor: "#f6f7f3" },
});
