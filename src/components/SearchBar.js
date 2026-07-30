import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={22} color="#6b7280" />

      <TextInput
        style={styles.input}
        placeholder="Search Bible..."
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 22,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
  },
});