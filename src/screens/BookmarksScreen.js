import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BookmarkContext } from "../context/BookmarkContext";

export default function BookmarksScreen() {
  const { bookmarks, removeBookmark } = useContext(BookmarkContext);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bookmarks</Text>
            <Text style={styles.subtitle}>
              {bookmarks.length} saved verse{bookmarks.length === 1 ? "" : "s"}
            </Text>
          </View>

          <View style={styles.iconCircle}>
            <Ionicons name="bookmark" size={24} color="#166534" />
          </View>
        </View>

        {bookmarks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bookmark-outline" size={54} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No bookmarks yet</Text>
            <Text style={styles.emptyText}>
              Save verses by tapping the bookmark icon while reading.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item, index) =>
              `${item.language}-${item.book}-${item.chapter}-${item.verse}-${index}`
            }
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.reference}>
                      {item.book} {item.chapter}:{item.verse}
                    </Text>

                    <Text style={styles.language}>
                      {item.language === "twi"
                        ? "Asante Twi Bible"
                        : "World English Bible"}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => removeBookmark(item)}>
                    <Ionicons name="trash-outline" size={22} color="#dc2626" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.text}>{item.text}</Text>
              </View>
            )}
          />
        )}
      </View>
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
    backgroundColor: "#f6f7f3",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#123524",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  reference: {
    fontSize: 16,
    fontWeight: "900",
    color: "#166534",
  },

  language: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },

  text: {
    fontSize: 17,
    lineHeight: 28,
    color: "#111827",
  },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "900",
    color: "#123524",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 23,
  },
});