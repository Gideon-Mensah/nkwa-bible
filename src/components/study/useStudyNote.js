import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { NoteContext } from "../../context/NoteContext";
import { createRecordId } from "../../utils/studyWorkspace";

// This hook lives above the modal/column boundary; rotating never recreates a draft.
export default function useStudyNote() {
  const { notes, saveNote, storageError } = useContext(NoteContext);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState("");
  const draftRef = useRef(null);
  const saved = useRef(null);
  const pending = useRef(null);

  const flush = useCallback(async () => {
    const snapshot = draftRef.current;
    if (!snapshot || snapshot === saved.current || (!snapshot.note.trim() && !snapshot.createdAt && saved.current?.id !== snapshot.id)) return true;
    if (pending.current?.snapshot === snapshot) return pending.current.promise;
    setStatus("Saving…");
    const promise = saveNote(snapshot).then((success) => {
      if (success) saved.current = snapshot;
      if (draftRef.current === snapshot) setStatus(success ? "Saved" : "Could not save. Tap Retry.");
      return success;
    });
    pending.current = { snapshot, promise };
    return promise;
  }, [saveNote]);

  useEffect(() => {
    const timer = setTimeout(flush, 650);
    return () => clearTimeout(timer);
  }, [draft, flush]);
  useEffect(() => () => { void flush(); }, [flush]);

  function edit(text, passage) {
    const next = { ...(draftRef.current || { ...passage, id: createRecordId() }), note: text };
    draftRef.current = next;
    setDraft(next);
    setStatus("Unsaved");
  }

  async function select(note) {
    if (!(await flush())) return;
    draftRef.current = note ? { ...note } : null;
    saved.current = draftRef.current;
    setDraft(draftRef.current);
    setStatus(note ? "Saved" : "");
  }

  return { notes, draft, status, storageError, edit, select, flush };
}
