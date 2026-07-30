import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SermonContext } from "../context/SermonContext";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


export default function SermonScreen({ navigation }) {
  const { sermons } = useContext(SermonContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sermon Notes</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddSermon")}
      >
        <Text style={styles.addButtonText}>+ Add Sermon Note</Text>
      </TouchableOpacity>

      <FlatList
        data={sermons}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("SermonDetail", {
                sermonId: item.id,
              })
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="reader-outline" size={24} color="#166534" />
              </View>

              <View style={styles.textBox}>
                <Text style={styles.sermonTitle}>{item.title}</Text>

                {item.preacher ? (
                  <Text style={styles.meta}>Preacher: {item.preacher}</Text>
                ) : null}

                {item.scripture ? (
                  <Text style={styles.scripture}>{item.scripture}</Text>
                ) : null}
              </View>

              <Ionicons name="chevron-forward" size={22} color="#6b7280" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={60} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No sermon notes yet</Text>
            <Text style={styles.emptyText}>
              Tap the button above to add your first sermon note.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f6f7f3",
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 18,
    color: "#123524",
  },

  addButton: {
    backgroundColor: "#166534",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 18,
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  textBox: {
    flex: 1,
  },

  sermonTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#123524",
    marginBottom: 5,
  },

  meta: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 3,
    fontWeight: "600",
  },

  scripture: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "800",
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#123524",
    marginTop: 14,
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 6,
    lineHeight: 22,
  },
});