import React, { useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { BookmarkContext } from "../context/BookmarkContext";
import { HighlightContext } from "../context/HighlightContext";
import VerseShareCard from "./VerseShareCard";

export default function VerseItem({
  book,
  chapter,
  verseNumber,
  text,
  language,
  onAddNote,
  onHighlight,
  onStudy,
  selectionMode = false,
  isSelected = false,
  onSelect,
}) {
  const shareCardRef = useRef(null);

  const { bookmarks, addBookmark, removeBookmark } =
    useContext(BookmarkContext);

  const { highlights, removeHighlight } =
    useContext(HighlightContext);

  const verseData = {
    book,
    chapter,
    verse: verseNumber,
    text,
    language,
  };

  const isBookmarked = bookmarks.some(
    (item) =>
      item.book === book &&
      item.chapter === chapter &&
      item.verse === verseNumber &&
      item.language === language
  );

  const currentHighlight = highlights.find(
    (item) =>
      item.book === book &&
      item.chapter === chapter &&
      item.verse === verseNumber &&
      item.language === language
  );

  function toggleBookmark() {
    if (isBookmarked) {
      removeBookmark(verseData);
    } else {
      addBookmark(verseData);
    }
  }

  async function shareText() {
    await Share.share({
      message: `${book} ${chapter}:${verseNumber}\n\n${text}\n\nShared from Twi Bible App`,
    });
  }

  async function shareImage() {
    try {
      const uri = await shareCardRef.current.capture();

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert("Sharing not available", "Image sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log("Image share error:", error);
      Alert.alert("Error", "Could not share image.");
    }
  }

  function openShareOptions() {
    Alert.alert(
      "Share Verse",
      "How do you want to share this verse?",
      [
        {
          text: "Share Text",
          onPress: shareText,
        },
        {
          text: "Share Image",
          onPress: shareImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={selectionMode ? 0.7 : 1}
        onPress={selectionMode ? () => onSelect?.(Number(verseNumber)) : undefined}
        accessibilityRole={selectionMode ? "button" : undefined}
        accessibilityLabel={selectionMode ? `Select verse ${verseNumber}` : undefined}
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          currentHighlight && {
            backgroundColor: currentHighlight.color,
            borderLeftWidth: 5,
            borderLeftColor: "#166534",
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.reference}>
            {book} {chapter}:{verseNumber}
          </Text>

          {selectionMode ? <Ionicons name={isSelected ? "checkmark-circle" : "ellipse-outline"} size={24} color="#166534" /> : <View style={styles.actions}>
            <TouchableOpacity accessibilityLabel="Study this verse with AI" onPress={() => onStudy?.(Number(verseNumber))} style={styles.iconButton}>
              <Ionicons name="sparkles-outline" size={22} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onHighlight && onHighlight(verseData)}
              style={styles.iconButton}
            >
              <Ionicons name="color-fill-outline" size={22} color="#f59e0b" />
            </TouchableOpacity>

            {currentHighlight && (
              <TouchableOpacity
                onPress={() => removeHighlight(verseData)}
                style={styles.iconButton}
              >
                <Ionicons name="close-circle-outline" size={22} color="#dc2626" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onAddNote && onAddNote(verseData)}
              style={styles.iconButton}
            >
              <Ionicons name="document-text-outline" size={22} color="#166534" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleBookmark} style={styles.iconButton}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isBookmarked ? "#166534" : "#6b7280"}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={openShareOptions} style={styles.iconButton}>
              <Ionicons name="share-social-outline" size={22} color="#166534" />
            </TouchableOpacity>
          </View>}
        </View>

        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>

      <View style={styles.hiddenShareCard}>
        <ViewShot ref={shareCardRef} options={{ format: "png", quality: 1 }}>
          <VerseShareCard
            book={book}
            chapter={chapter}
            verseNumber={verseNumber}
            text={text}
          />
        </ViewShot>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  selectedCard: { borderWidth: 2, borderColor: "#166534", backgroundColor: "#ecfdf5" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  reference: {
    color: "#166534",
    fontSize: 15,
    fontWeight: "900",
    flex: 1,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  iconButton: {
    marginLeft: 10,
  },

  text: {
    color: "#111827",
    fontSize: 17,
    lineHeight: 28,
  },

  hiddenShareCard: {
    position: "absolute",
    left: -9999,
    top: -9999,
  },
});
