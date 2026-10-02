import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export function StudyButton({ children, onPress, disabled, selected, accessibilityLabel, accessibilityRole = "button" }) {
  return <TouchableOpacity accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled: !!disabled, selected: !!selected }} disabled={disabled} onPress={onPress}
    style={[studyStyles.button, selected && studyStyles.active, disabled && { opacity: 0.5 }]}>
    <Text style={[studyStyles.buttonText, selected && { color: "#fff" }]}>{children}</Text>
  </TouchableOpacity>;
}

export const studyStyles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40, gap: 12 },
  heading: { color: "#123524", fontSize: 22, fontWeight: "800" },
  label: { color: "#166534", fontSize: 15, fontWeight: "700", marginBottom: 6 },
  text: { color: "#374151", fontSize: 16, lineHeight: 25 },
  hint: { color: "#526158", fontSize: 13, lineHeight: 20 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: { minHeight: 44, justifyContent: "center", padding: 12, borderWidth: 1, borderColor: "#bbd7c4", borderRadius: 12, backgroundColor: "#f0f7f2" },
  buttonText: { color: "#166534", fontSize: 15, fontWeight: "700" },
  active: { backgroundColor: "#166534", borderColor: "#166534" },
  input: { backgroundColor: "#fff", color: "#123524", borderWidth: 1, borderColor: "#aebeb3", borderRadius: 12, padding: 12, minHeight: 48, fontSize: 17, marginBottom: 12 },
  editor: { minHeight: 180, textAlignVertical: "top", lineHeight: 26 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dce4dd", borderRadius: 14, padding: 14, gap: 8 },
});
