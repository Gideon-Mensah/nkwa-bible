import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import { SermonContext } from "../context/SermonContext";
import { Ionicons } from "@expo/vector-icons";

export default function SermonDetailScreen({
  route,
  navigation,
}) {
  const { sermonId } = route.params;

  const { sermons, deleteSermon } =
    useContext(SermonContext);

  const sermon = sermons.find(
    (item) => item.id === sermonId
  );

  if (!sermon) {
    return (
      <View style={styles.center}>
        <Text>Sermon not found</Text>
      </View>
    );
  }

  function handleDelete() {
    Alert.alert(
      "Delete Sermon",
      "Are you sure you want to delete this sermon?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSermon(sermon.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {sermon.title}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Preacher</Text>
        <Text style={styles.value}>
          {sermon.preacher || "Not specified"}
        </Text>

        <Text style={styles.label}>Church</Text>
        <Text style={styles.value}>
          {sermon.church || "Not specified"}
        </Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>
          {sermon.date || "Not specified"}
        </Text>

        <Text style={styles.label}>Key Scripture</Text>
        <Text style={styles.value}>
          {sermon.scripture || "Not specified"}
        </Text>

        <Text style={styles.label}>Notes</Text>
        <Text style={styles.notes}>
          {sermon.notes}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("EditSermon", {
            sermonId: sermon.id,
          })
        }
      >
        <Ionicons
          name="create-outline"
          size={20}
          color="#fff"
        />
        <Text style={styles.buttonText}>
          Edit Sermon
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color="#fff"
        />
        <Text style={styles.buttonText}>
          Delete Sermon
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7f3",
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

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "900",
    marginTop: 12,
  },

  value: {
    fontSize: 16,
    color: "#374151",
    marginTop: 4,
  },

  notes: {
    fontSize: 16,
    lineHeight: 28,
    marginTop: 8,
    color: "#111827",
  },

  editButton: {
    backgroundColor: "#166534",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 8,
  },
});