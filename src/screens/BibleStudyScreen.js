import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BibleContext } from "../context/BibleContext";
import { cacheStudy, getCachedStudy } from "../services/bibleStudyCache";
import { requestBibleStudy } from "../services/bibleStudyService";

const FACT_COLORS = { explicit: "#166534", inference: "#92400e", interpretation: "#6d28d9", disputed: "#b91c1c" };

function FactLabel({ type }) {
  if (!type) return null;
  return <Text style={[styles.factLabel, { color: FACT_COLORS[type] || "#374151" }]}>{type.toUpperCase()}</Text>;
}

function Section({ title, children }) {
  return <View style={styles.card}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

export default function BibleStudyScreen({ route, navigation }) {
  const baseSelection = route.params.selection;
  const { setLanguage } = useContext(BibleContext);
  const [requestedLanguage, setRequestedLanguage] = useState(baseSelection.language);
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestInFlight = useRef(false);
  const mounted = useRef(true);

  const loadStudy = useCallback(async (language, regenerate = false) => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setLoading(true);
    setError("");
    const selection = { ...baseSelection, language };
    try {
      if (!regenerate) {
        const cached = await getCachedStudy(selection);
        if (cached) { if (mounted.current) setStudy(cached); return; }
      }
      const result = await requestBibleStudy(selection);
      await cacheStudy(selection, result);
      if (mounted.current) setStudy(result);
    } catch (loadError) {
      if (mounted.current) setError(loadError.message || "The Bible study could not be loaded.");
    } finally {
      requestInFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [baseSelection]);

  useEffect(() => {
    mounted.current = true;
    loadStudy(requestedLanguage);
    return () => { mounted.current = false; };
  }, []);

  function switchLanguage(nextLanguage) {
    if (nextLanguage === requestedLanguage || requestInFlight.current) return;
    setRequestedLanguage(nextLanguage);
    setStudy(null);
    setLanguage(nextLanguage);
    loadStudy(nextLanguage);
  }

  function openReference(reference) {
    setLanguage(requestedLanguage);
    navigation.navigate("Verses", { bookId: reference.bookId, chapterNumber: String(reference.chapter) });
  }

  const renderEvidence = (references = []) => references.map((reference, index) =>
    <TouchableOpacity key={`${reference.bookId}-${reference.chapter}-${reference.verseStart}-${index}`} onPress={() => openReference(reference)} style={styles.evidenceLink}>
      <Text style={styles.evidenceReference}>{reference.displayReference || `${reference.bookName} ${reference.chapter}:${reference.verseStart}`}</Text>
      {reference.verseText ? <Text style={styles.evidenceText}>{reference.verseText}</Text> : null}
    </TouchableOpacity>
  );

  const renderStatements = (items) => items.map((item, index) => <View key={index} style={styles.item}>
    <FactLabel type={item.factType} /><Text style={styles.itemTitle}>{item.statement || item.name}</Text>
    <Text style={styles.bodyText}>{item.explanation || item.role || item.significance}</Text>{renderEvidence(item.evidenceReferences)}
  </View>);

  return <View style={styles.container}>
    <View style={styles.languageSwitch}>
      {[{ key: "twi", label: "Twi" }, { key: "english", label: "English" }].map(({ key, label }) => <TouchableOpacity key={key} disabled={loading} style={[styles.languageButton, requestedLanguage === key && styles.activeLanguage]} onPress={() => switchLanguage(key)}><Text style={[styles.languageText, requestedLanguage === key && styles.activeText]}>{label}</Text></TouchableOpacity>)}
    </View>
    {loading && !study ? <View style={styles.center}><ActivityIndicator size="large" color="#166534" /><Text style={styles.loadingText}>Preparing a grounded Bible study...</Text></View> : error && !study ? <View style={styles.center}><Ionicons name="cloud-offline-outline" size={44} color="#6b7280" /><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.primaryButton} onPress={() => loadStudy(requestedLanguage)}><Text style={styles.primaryButtonText}>Retry</Text></TouchableOpacity></View> : study ? <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.reference}>{study.reference.displayReference}</Text>
      <Text style={styles.passage}>{study.passageText}</Text>
      <Text style={styles.disclaimer}>AI-generated study aid. Check every interpretation against Scripture and trusted biblical teaching.</Text>
      <Section title="Summary"><Text style={styles.bodyText}>{study.summary}</Text></Section>
      <Section title="Immediate Context"><Text style={styles.contextLabel}>Before</Text><Text style={styles.bodyText}>{study.immediateContext.before}</Text><Text style={styles.contextLabel}>Selected passage</Text><Text style={styles.bodyText}>{study.immediateContext.selected}</Text><Text style={styles.contextLabel}>After</Text><Text style={styles.bodyText}>{study.immediateContext.after}</Text></Section>
      <Section title="Genealogy">{study.genealogy.length ? study.genealogy.map((item, index) => <View key={index} style={styles.item}><FactLabel type={item.factType} /><Text style={styles.itemTitle}>{item.person} — {item.relationship} — {item.relatedPerson}</Text><Text style={styles.bodyText}>{item.explanation}</Text>{renderEvidence(item.evidenceReferences)}</View>) : <Text style={styles.emptyText}>No direct genealogical connection was identified for this passage.</Text>}</Section>
      {study.people.length ? <Section title="People">{renderStatements(study.people)}</Section> : null}
      {study.places.length ? <Section title="Places">{renderStatements(study.places)}</Section> : null}
      {study.crossReferences.length ? <Section title="Cross-References">{study.crossReferences.map((item, index) => <TouchableOpacity key={index} style={styles.item} onPress={() => openReference(item.reference)}><FactLabel type={item.factType} /><Text style={styles.linkTitle}>{item.reference.displayReference} · {item.connectionType}</Text><Text style={styles.bodyText}>{item.relevance}</Text><Text style={styles.evidenceText}>{item.verseText}</Text></TouchableOpacity>)}</Section> : null}
      {study.oldNewTestamentConnections.length ? <Section title="Old and New Testament Connections">{renderStatements(study.oldNewTestamentConnections)}</Section> : null}
      {study.prophecyAndFulfilment.length ? <Section title="Prophecy, Quotations and Fulfilment">{renderStatements(study.prophecyAndFulfilment)}</Section> : null}
      {study.themes.length ? <Section title="Themes">{renderStatements(study.themes)}</Section> : null}
      {study.historicalBackground.length ? <Section title="Historical Background">{renderStatements(study.historicalBackground)}</Section> : null}
      {study.interpretiveNotes.length ? <Section title="Interpretive Notes">{study.interpretiveNotes.map((item, index) => <View key={index} style={styles.item}><FactLabel type={item.factType} /><Text style={styles.bodyText}>{item.statement}</Text><Text style={styles.viewText}>{item.traditionOrView}</Text></View>)}</Section> : null}
      {study.limitations.length ? <Section title="Limitations">{study.limitations.map((item, index) => <Text key={index} style={styles.bodyText}>• {item}</Text>)}</Section> : null}
      {error ? <Text style={styles.cachedWarning}>{error} Showing the cached study.</Text> : null}
      <TouchableOpacity disabled={loading} style={[styles.regenerateButton, loading && styles.disabled]} onPress={() => loadStudy(requestedLanguage, true)}><Ionicons name="refresh" size={19} color="#166534" /><Text style={styles.regenerateText}>{loading ? "Regenerating..." : "Regenerate study"}</Text></TouchableOpacity>
    </ScrollView> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f3" }, content: { padding: 18, paddingBottom: 40 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  languageSwitch: { flexDirection: "row", backgroundColor: "#e5e7eb", padding: 4, borderRadius: 16, margin: 16, marginBottom: 0 }, languageButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 }, activeLanguage: { backgroundColor: "#166534" }, languageText: { fontWeight: "800", color: "#374151" }, activeText: { color: "#fff" },
  loadingText: { marginTop: 14, color: "#374151", fontSize: 16 }, errorText: { marginVertical: 16, textAlign: "center", color: "#374151", lineHeight: 23 }, primaryButton: { backgroundColor: "#166534", paddingHorizontal: 26, paddingVertical: 13, borderRadius: 14 }, primaryButtonText: { color: "#fff", fontWeight: "900" },
  reference: { fontSize: 29, fontWeight: "900", color: "#123524", marginBottom: 12 }, passage: { fontSize: 17, lineHeight: 28, color: "#111827", backgroundColor: "#ecfdf5", padding: 16, borderRadius: 16 }, disclaimer: { fontSize: 12, lineHeight: 18, color: "#6b7280", marginVertical: 14 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 17, marginBottom: 14, borderWidth: 1, borderColor: "#e5e7eb" }, sectionTitle: { fontSize: 20, fontWeight: "900", color: "#123524", marginBottom: 10 }, bodyText: { color: "#374151", fontSize: 15, lineHeight: 23, marginBottom: 5 }, contextLabel: { color: "#166534", fontSize: 13, fontWeight: "900", marginTop: 7 }, item: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#d1d5db" }, itemTitle: { fontSize: 16, fontWeight: "800", color: "#1f2937", marginBottom: 4 }, linkTitle: { fontSize: 16, fontWeight: "900", color: "#166534", marginBottom: 4 }, factLabel: { fontSize: 10, fontWeight: "900", marginBottom: 3 }, emptyText: { color: "#6b7280", fontStyle: "italic", lineHeight: 22 },
  evidenceLink: { backgroundColor: "#f9fafb", padding: 9, borderRadius: 10, marginTop: 7 }, evidenceReference: { color: "#166534", fontWeight: "900", marginBottom: 3 }, evidenceText: { color: "#4b5563", fontSize: 13, lineHeight: 19 }, viewText: { color: "#6d28d9", fontSize: 13, marginTop: 4 }, cachedWarning: { color: "#92400e", textAlign: "center", marginBottom: 10 }, regenerateButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 15, borderWidth: 1, borderColor: "#166534" }, regenerateText: { color: "#166534", fontWeight: "900", marginLeft: 7 }, disabled: { opacity: 0.6 },
});
