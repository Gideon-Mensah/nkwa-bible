import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function VerseShareCard({ book, chapter, verseNumber, text }) {
  return (
    <View style={styles.card}>
      <Text style={styles.appName}>Twi Bible</Text>

      <Text style={styles.reference}>
        {book} {chapter}:{verseNumber}
      </Text>

      <Text style={styles.verseText}>“{text}”</Text>

      <Text style={styles.footer}>Shared from Nkwa Bible App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    minHeight: 420,
    backgroundColor: "#166534",
    padding: 28,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  appName: {
    color: "#dcfce7",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 24,
  },

  reference: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 22,
    textAlign: "center",
  },

  verseText: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "600",
  },

  footer: {
    color: "#bbf7d0",
    fontSize: 13,
    marginTop: 28,
    fontWeight: "700",
  },
});