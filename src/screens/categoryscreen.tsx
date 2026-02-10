import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import { BrainRegion } from "../ui/BrainMap";

const PALETTE = { deep: "#347679", mid: "#478387", soft: "#74a3a5", light: "#a3c1c3", mist: "#d1e1e1" };

type GameCard = { title: string; description: string; route?: string; comingSoon?: boolean };
type CategoryData = { title: string; subtitle: string; color: string; games: GameCard[] };

const CATEGORIES: Record<BrainRegion, CategoryData> = {
  frontal: { title: "Focus & Working Memory", subtitle: "Self-control, planning, staying on task", color: "#228181", games: [
    { title: "Go / No-Go", description: "Inhibition and impulse control under speed", route: "GoNoGoDifficulty" },
    { title: "N-Back Sprint", description: "Working memory updating — remember and compare", route: "NBackDifficulty" },
    { title: "Stop-Signal", description: "Inhibition under urgency — brake on command", comingSoon: true },
    { title: "Rule Stack", description: "Hold 2 rules, apply quickly under load", comingSoon: true },
  ]},
  parietal: { title: "Attention & Spatial", subtitle: "Attention shifting, visuospatial control", color: "#93DED5", games: [
    { title: "Visual Search", description: "Find the target among distractors — fast scanning", route: "VisualSearchDifficulty" },
    { title: "Spatial Span Grid", description: "Corsi-style spatial sequence recall", comingSoon: true },
    { title: "Cue Shift", description: "Respond to shifting spatial cues", comingSoon: true },
  ]},
  temporal: { title: "Language & Meaning", subtitle: "Language processing, semantic retrieval", color: "#74A3A5", games: [
    { title: "Meaning Match", description: "Fast synonym or category matching", comingSoon: true },
    { title: "Word-to-Concept", description: "Pick the best concept under time pressure", comingSoon: true },
    { title: "Reading Noise Filter", description: "Comprehension while ignoring distractors", comingSoon: true },
  ]},
  occipital: { title: "Visual & Patterns", subtitle: "Visual discrimination, pattern recognition", color: "#347679", games: [
    { title: "Oddball Pop", description: "Spot the rare target among frequent non-targets", comingSoon: true },
    { title: "Pattern Snap", description: "Quick same/different visual discrimination", comingSoon: true },
    { title: "Contrast Shift", description: "Detect subtle visual changes under time", comingSoon: true },
  ]},
  cerebellum: { title: "Timing & Rhythm", subtitle: "Timing, consistency, smooth performance", color: "#009189", games: [
    { title: "Rhythm Lock", description: "Tap in-time with changing tempo", comingSoon: true },
    { title: "Steady Hands", description: "Optimize reaction-time consistency", comingSoon: true },
    { title: "Predict-the-Beat", description: "Anticipatory timing and temporal prediction", comingSoon: true },
  ]},
  brainstem: { title: "Reset", subtitle: "Regulation and state-change tools", color: "#A3C1C3", games: [
    { title: "60-Second Reset", description: "Paced breathing + short grounding prompt", comingSoon: true },
  ]},
};

export default function CategoryScreen({ route, navigation }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const region: BrainRegion = route.params?.region ?? "frontal";
  const data = CATEGORIES[region];

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} /><View style={styles.blobRight} /><View style={styles.blobBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.colorBar, { backgroundColor: data.color }]} />
        <Text style={styles.h}>{data.title}</Text>
        <Text style={styles.sub}>{data.subtitle}</Text>
        <View style={{ height: spacing.lg }} />
        {data.games.map((game, idx) => {
          const disabled = !!game.comingSoon;
          return (
            <Pressable key={idx} onPress={() => { if (!disabled && game.route) navigation.navigate(game.route); }} disabled={disabled}
              style={({ pressed }) => [styles.gameCard, { opacity: disabled ? 0.55 : pressed ? 0.85 : 1 }]}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDesc}>{game.description}</Text>
              {game.comingSoon && <View style={styles.badge}><Text style={styles.badgeText}>Coming soon</Text></View>}
            </Pressable>
          );
        })}
        <View style={{ height: spacing.lg }} />
        <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>Back</Text></Pressable>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.background },
  content: { flexGrow: 1, padding: spacing.xl },
  blobTop: { position: "absolute", top: -180, left: -140, width: 420, height: 420, borderRadius: 210, backgroundColor: PALETTE.mist, opacity: 0.35 },
  blobRight: { position: "absolute", top: 40, right: -180, width: 380, height: 380, borderRadius: 190, backgroundColor: PALETTE.light, opacity: 0.18 },
  blobBottom: { position: "absolute", bottom: -220, left: -120, width: 520, height: 520, borderRadius: 260, backgroundColor: PALETTE.soft, opacity: 0.09 },
  colorBar: { height: 6, borderRadius: 3, width: 48, marginBottom: spacing.md },
  h: { color: theme.text, fontSize: 28, fontWeight: "900" },
  sub: { color: theme.text, opacity: 0.85, fontWeight: "700", marginTop: 6 },
  gameCard: { backgroundColor: "rgba(209, 225, 225, 0.5)", borderRadius: 20, padding: spacing.lg, marginBottom: spacing.md, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 2, gap: 6 },
  gameTitle: { color: theme.text, fontSize: 18, fontWeight: "900" },
  gameDesc: { color: theme.text, opacity: 0.75, fontWeight: "700", fontSize: 13 },
  badge: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: PALETTE.deep },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  back: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, backgroundColor: "rgba(209, 225, 225, 0.45)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  backText: { color: theme.text, fontWeight: "900", opacity: 0.9 },
});
