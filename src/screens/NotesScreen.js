import React, { useContext, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NoteContext } from "../context/NoteContext";
import { Alert } from "react-native";



export default function NotesScreen() {
    const { notes, deleteNote, updateNote } = useContext(NoteContext);

    const [selectedNote, setSelectedNote] = useState(null);
    const [editText, setEditText] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    async function saveEditedNote() {
        const success = await updateNote(
            selectedNote.id,
            editText.trim()
        );

        if (success) setModalVisible(false);
        else Alert.alert("Could not save", "Your note is still open. Please try again.");
    }

    function openEditModal(note) {
        setSelectedNote(note);
        setEditText(note.note);
        setModalVisible(true);
    }

    function handleDelete(id) {
        Alert.alert(
            "Delete Note",
            "Are you sure you want to delete this note?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (!(await deleteNote(id))) Alert.alert("Could not delete", "Your note has been preserved. Please try again.");
                    },
                },
            ]
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Notes</Text>

            {notes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="document-text-outline"
                        size={70}
                        color="#9ca3af"
                    />

                    <Text style={styles.emptyTitle}>
                        No Notes Yet
                    </Text>

                    <Text style={styles.emptyText}>
                        Add notes while reading Bible verses.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.reference}>
                                    {item.book} {item.chapter}{item.verse != null ? `:${item.verse}` : ""}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => handleDelete(item.id)}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={22}
                                        color="#dc2626"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => openEditModal(item)}
                                    style={{ marginRight: 15 }}
                                >
                                    <Ionicons name="create-outline" size={22} color="#166534" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.note}>
                                {item.note}
                            </Text>
                        </View>
                    )}
                />
            )}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Edit Note</Text>

                        <TextInput
                            style={styles.input}
                            multiline
                            value={editText}
                            onChangeText={setEditText}
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={saveEditedNote}
                        >
                            <Text style={styles.saveText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f6f7f3",
        padding: 20,
    },

    title: {
        fontSize: 32,
        fontWeight: "900",
        color: "#166534",
        marginBottom: 20,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 10,
    },

    emptyText: {
        color: "#6b7280",
        marginTop: 5,
    },

    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 18,
        marginBottom: 12,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    reference: {
        fontWeight: "bold",
        color: "#166534",
        fontSize: 16,
    },

    note: {
        fontSize: 16,
        lineHeight: 24,
        color: "#111827",
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

    modalTitle: {
        fontSize: 24,
        fontWeight: "900",
        color: "#123524",
        marginBottom: 14,
    },

    input: {
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

    saveText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "900",
    },
});
