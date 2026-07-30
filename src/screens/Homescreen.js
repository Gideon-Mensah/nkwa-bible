import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BibleContext } from "../context/BibleContext";
import { ReadingContext } from "../context/ReadingContext";
import { NoteContext } from "../context/NoteContext";
import dailyVerses from "../data/dailyVerses";

export default function HomeScreen({ navigation }) {
  const { language, setLanguage } = useContext(BibleContext);
  const { lastRead } = useContext(ReadingContext);

  const isTwi = language === "twi";

  const title = isTwi ? "Twi Bible" : "English Bible";
  const subtitle = isTwi
    ? "Offline Asante Twi Bible"
    : "Offline World English Bible";

  const { notes } = useContext(NoteContext);

  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
    86400000
  );

  const dailyVerse =
    dailyVerses[dayOfYear % dailyVerses.length];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.languageSwitch}>
          <TouchableOpacity
            style={[styles.languageButton, isTwi && styles.activeLanguage]}
            onPress={() => setLanguage("twi")}
          >
            <Text style={[styles.languageText, isTwi && styles.activeText]}>
              Twi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageButton, !isTwi && styles.activeLanguage]}
            onPress={() => setLanguage("english")}
          >
            <Text style={[styles.languageText, !isTwi && styles.activeText]}>
              English
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="book" size={42} color="#166534" />
          </View>

          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.dailyVerseCard}>
          <Text style={styles.dailyLabel}>Daily Verse</Text>

          <Text style={styles.dailyText}>
            “{dailyVerse.text}”
          </Text>

          <Text style={styles.dailyReference}>
            {dailyVerse.reference}
          </Text>
        </View>

        {lastRead && (
          <TouchableOpacity
            style={styles.continueCard}
            onPress={() =>
              navigation.navigate("Bible", {
                screen: "Verses",
                params: {
                  bookName: lastRead.book,
                  chapterNumber: lastRead.chapter,
                },
              })
            }
          >
            <View style={styles.continueIcon}>
              <Ionicons name="time-outline" size={24} color="#166534" />
            </View>

            <View style={styles.cardTextBox}>
              <Text style={styles.cardLabel}>Continue Reading</Text>
              <Text style={styles.cardTitle}>
                {lastRead.book} {lastRead.chapter}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#166534" />
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Read Bible</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryCard}
          onPress={() =>
            navigation.navigate("Bible", {
              screen: "Books",
              params: { testament: "old" },
            })
          }
        >
          <View style={styles.primaryIcon}>
            <Ionicons name="library" size={24} color="#fff" />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.primaryTitle}>Old Testament</Text>
            <Text style={styles.primarySubtitle}>Genesis to Malachi</Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryCard}
          onPress={() =>
            navigation.navigate("Bible", {
              screen: "Books",
              params: { testament: "new" },
            })
          }
        >
          <View style={styles.primaryIcon}>
            <Ionicons name="bookmark" size={24} color="#fff" />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.primaryTitle}>New Testament</Text>
            <Text style={styles.primarySubtitle}>Matthew to Revelation</Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tools</Text>
        </View>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => navigation.navigate("Search")}
        >
          <View style={styles.toolIcon}>
            <Ionicons name="search" size={23} color="#166534" />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.toolTitle}>Search Bible</Text>
            <Text style={styles.toolSubtitle}>Find any word or verse</Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#166534" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() =>
            navigation.navigate("Bible", {
              screen: "Bookmarks",
            })
          }
        >
          <View style={styles.toolIcon}>
            <Ionicons name="star" size={23} color="#166534" />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.toolTitle}>Bookmarks</Text>
            <Text style={styles.toolSubtitle}>View your saved verses</Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#166534" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() =>
            navigation.navigate("Bible", {
              screen: "Notes",
            })
          }
        >
          <View style={styles.toolIcon}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color="#166534"
            />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.toolTitle}>
              Notes
            </Text>

            <Text style={styles.toolSubtitle}>
              {notes.length} saved note{notes.length === 1 ? "" : "s"}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#166534"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() =>
            navigation.navigate("Bible", {
              screen: "Sermons",
            })
          }
        >
          <View style={styles.toolIcon}>
            <Ionicons name="reader-outline" size={23} color="#166534" />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.toolTitle}>Sermon Notes</Text>
            <Text style={styles.toolSubtitle}>
              Save notes from church services
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#166534" />
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: "#f6f7f3",
  },

  content: {
    padding: 20,
    paddingBottom: 35,
  },

  languageSwitch: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 5,
    borderRadius: 18,
    marginBottom: 22,
  },

  languageButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  activeLanguage: {
    backgroundColor: "#166534",
  },

  languageText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#374151",
  },

  activeText: {
    color: "#fff",
  },

  heroCard: {
    backgroundColor: "#166534",
    borderRadius: 32,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 24,
  },

  heroIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  heroTitle: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
  },

  heroSubtitle: {
    color: "#dcfce7",
    fontSize: 15,
    marginTop: 6,
    fontWeight: "600",
  },

  sectionHeader: {
    marginTop: 4,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#123524",
  },

  continueCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 22,
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  continueIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  primaryCard: {
    backgroundColor: "#166534",
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  primaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  toolCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  cardTextBox: {
    flex: 1,
  },

  cardLabel: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "800",
  },

  cardTitle: {
    color: "#123524",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 3,
  },

  primaryTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  primarySubtitle: {
    color: "#dcfce7",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },

  toolTitle: {
    color: "#123524",
    fontSize: 17,
    fontWeight: "900",
  },

  toolSubtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },

  dailyVerseCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 22,
    marginBottom: 22,
    borderLeftWidth: 5,
    borderLeftColor: "#166534",
  },

  dailyLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#166534",
    marginBottom: 10,
  },

  dailyText: {
    fontSize: 17,
    lineHeight: 28,
    color: "#111827",
    fontWeight: "600",
  },

  dailyReference: {
    marginTop: 12,
    fontSize: 14,
    color: "#166534",
    fontWeight: "900",
  },
});