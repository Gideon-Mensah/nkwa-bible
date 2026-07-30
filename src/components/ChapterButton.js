import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChapterButton({ chapterNumber, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={styles.circle}>
          <Text style={styles.number}>{chapterNumber}</Text>
        </View>

        <View>
          <Text style={styles.chapterText}>
            Chapter {chapterNumber}
          </Text>

          <Text style={styles.subtitle}>
            Read chapter
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#6b7280"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  circle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#166534',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  number: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  chapterText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 3,
    color: '#6b7280',
    fontSize: 13,
  },
});