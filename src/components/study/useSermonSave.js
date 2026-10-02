import { useContext, useRef, useState } from "react";
import { Alert } from "react-native";
import { SermonContext } from "../../context/SermonContext";
import { createRecordId, normalizeSermon } from "../../utils/studyWorkspace";

export default function useSermonSave() {
  const { addSermon, updateSermon } = useContext(SermonContext);
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);

  async function save(fields, existingId) {
    if (busy.current) return null;
    let normalized;
    try { normalized = normalizeSermon(fields); }
    catch (error) { Alert.alert("Missing title", error.message); return null; }
    busy.current = true;
    setSaving(true);
    const id = existingId || fields.id || createRecordId();
    try {
      const success = existingId
        ? await updateSermon(id, { ...normalized, updatedAt: new Date().toISOString() })
        : await addSermon({ ...normalized, id });
      if (!success) {
        Alert.alert("Could not save sermon", "Your draft is still open. Please try again. Stored sermons have been preserved.");
        return null;
      }
      return id;
    } finally { busy.current = false; setSaving(false); }
  }
  return { save, saving };
}
