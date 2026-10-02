import React, { useContext, useRef, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { SermonContext } from "../../context/SermonContext";
import { exportSermonToPdf } from "../../utils/sermonPdf";
import { appendText, createRecordId, passageReference } from "../../utils/studyWorkspace";
import SermonFields from "./SermonFields";
import { StudyButton, studyStyles as styles } from "./StudyControls";

export default function SermonWorkspace({ passage, model }) {
  const { sermons, deleteSermon, storageError } = useContext(SermonContext);
  const { draft, setDraft, selectedId, setSelectedId, save, saving, dirty, setDirty } = model;
  const [exporting, setExporting] = useState(false);
  const exportLock = useRef(false);
  const sermon = sermons.find((item) => item.id === selectedId);

  function change(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setDirty(true);
  }

  function leaveEditor(action) {
    if (saving) return;
    if (!dirty) return action();
    Alert.alert("Discard sermon changes?", "Save your sermon before leaving this editor to keep your changes.", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => { setDirty(false); action(); } },
    ]);
  }

  async function handleSave() {
    const id = await save(draft, selectedId);
    if (id) { setSelectedId(id); setDraft(null); setDirty(false); }
  }

  async function exportPdf() {
    if (exportLock.current) return;
    exportLock.current = true;
    setExporting(true);
    try { await exportSermonToPdf(sermon); }
    catch (error) {
      console.warn("Sermon PDF export failed.", error);
      Alert.alert("Could not export PDF", "Please try again on a device that supports file sharing.");
    } finally { exportLock.current = false; setExporting(false); }
  }

  function remove() {
    Alert.alert("Delete Sermon", "Are you sure you want to delete this sermon?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        if (await deleteSermon(sermon.id)) setSelectedId(null);
        else Alert.alert("Could not delete", "The sermon has been preserved. Please try again.");
      } },
    ]);
  }

  return <>
    <Text accessibilityRole="header" style={styles.heading}>Sermon</Text>
    <Text style={styles.hint}>Reading: {passageReference(passage)}</Text>
    {storageError && <Text style={styles.hint}>Sermons could not be loaded or saved. Stored records are preserved.</Text>}
    {(draft || selectedId) && <StudyButton disabled={saving} onPress={() => leaveEditor(() => { setDraft(null); setSelectedId(null); })}>All sermons</StudyButton>}
    {draft ? <>
      <SermonFields values={draft} disabled={saving} onChange={change} labelStyle={styles.label} inputStyle={styles.input} />
      <StudyButton disabled={saving} onPress={() => change("scripture", appendText(draft.scripture, passageReference(passage)))}>Insert current reference</StudyButton>
      <Text style={styles.label}>Sermon notes</Text>
      <TextInput accessibilityLabel="Sermon notes" style={[styles.input, styles.editor]} multiline editable={!saving}
        value={draft.notes || ""} onChangeText={(value) => change("notes", value)} />
      {passage.verse != null && <StudyButton disabled={saving} onPress={() => change("notes", appendText(draft.notes, `${passageReference(passage)}\n${passage.text}`))}>Insert selected verse text</StudyButton>}
      <Text style={styles.hint}>{dirty ? "Unsaved changes · Save when ready" : "Edit the fields, then save."}</Text>
      <StudyButton selected disabled={saving} onPress={handleSave}>{saving ? "Saving…" : "Save sermon"}</StudyButton>
    </> : sermon ? <>
      <View style={styles.card}>
        <Text style={styles.heading}>{sermon.title}</Text>
        {[["Preacher", sermon.preacher], ["Church", sermon.church], ["Date", sermon.date], ["Scripture", sermon.scripture], ["Notes", sermon.notes]].map(([label, value]) => <View key={label}>
          <Text style={styles.label}>{label}</Text><Text style={styles.text}>{value || "Not specified"}</Text>
        </View>)}
      </View>
      <StudyButton onPress={() => { setDraft({ ...sermon }); setDirty(false); }}>Edit sermon</StudyButton>
      <StudyButton disabled={exporting} onPress={exportPdf}>{exporting ? "Creating PDF…" : "Export to PDF"}</StudyButton>
      <StudyButton onPress={remove}>Delete sermon</StudyButton>
    </> : <>
      <StudyButton selected onPress={() => { setSelectedId(null); setDraft({ id: createRecordId(), title: "", preacher: "", church: "", date: "", scripture: "", notes: "" }); setDirty(false); }}>New sermon</StudyButton>
      {sermons.length === 0 && <Text style={styles.hint}>Create a sermon while keeping your Bible open.</Text>}
      {sermons.map((item) => <View key={item.id} style={styles.card}>
        <StudyButton accessibilityLabel={`Open sermon: ${item.title}`} onPress={() => setSelectedId(item.id)}>{item.title}</StudyButton>
        {!!item.scripture && <Text style={styles.text}>{item.scripture}</Text>}
      </View>)}
    </>}
  </>;
}
