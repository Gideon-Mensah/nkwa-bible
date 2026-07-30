import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";

import { SermonContext } from "../context/SermonContext";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function EditSermonScreen({ route, navigation }) {
  const { sermonId } = route.params;

  const { sermons, updateSermon } = useContext(SermonContext);

  const sermon = sermons.find((item) => item.id === sermonId);

  const [title, setTitle] = useState(sermon?.title || "");
  const [preacher, setPreacher] = useState(sermon?.preacher || "");
  const [church, setChurch] = useState(sermon?.church || "");
  const [date, setDate] = useState(sermon?.date || "");
  const [scripture, setScripture] = useState(sermon?.scripture || "");
  const [notes, setNotes] = useState(sermon?.notes || "");

  if (!sermon) {
    return (
      <View style={styles.center}>
        <Text>Sermon not found</Text>
      </View>
    );
  }

  function handleUpdate() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter the sermon title.");
      return;
    }

    updateSermon(sermonId, {
      title: title.trim(),
      preacher: preacher.trim(),
      church: church.trim(),
      date: date.trim(),
      scripture: scripture.trim(),
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    });

    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={20}>

        <View style={styles.container} >
          <Text style={styles.title}>Add Sermon Note</Text>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Sermon title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Preacher</Text>
          <TextInput
            style={styles.input}
            value={preacher}
            onChangeText={setPreacher}
          />

          <Text style={styles.label}>Church</Text>
          <TextInput
            style={styles.input}
            value={church}
            onChangeText={setChurch}
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
          />

          <Text style={styles.label}>Key Scripture</Text>
          <TextInput
            style={styles.input}
            value={scripture}
            onChangeText={setScripture}
          />

          <Text style={styles.label}>Sermon Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Write your sermon notes here..."
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
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
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#123524",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  notesInput: {
    minHeight: 200,
  },

  saveButton: {
    backgroundColor: "#166534",
    padding: 17,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 40,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
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

  notesInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    minHeight: 180,
    padding: 16,
    textAlignVertical: "top",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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