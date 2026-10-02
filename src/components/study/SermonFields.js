import React from "react";
import { Text, TextInput } from "react-native";

export default function SermonFields({ values, onChange, labelStyle, inputStyle, disabled = false }) {
  return [ ["title", "Title"], ["preacher", "Preacher"], ["church", "Church"],
    ["date", "Date"], ["scripture", "Key Scripture"] ].map(([field, label]) => (
    <React.Fragment key={field}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput accessibilityLabel={label} editable={!disabled} style={inputStyle} value={values[field] || ""}
        onChangeText={(text) => onChange(field, text)} multiline={field === "scripture"} />
    </React.Fragment>
  ));
}
