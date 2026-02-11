import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import { BrainRegion } from "../ui/BrainMap";
import { useSessionTimer } from "../context/SessionTimerContext";

const PALETTE = { deep: "#347679", mist: "#d1e1e1", light: "#a3c1c3", soft: "#74a3a5" };

type GameCard = { title: string; description: string; route?: string; comingSoon?: boolean };
type CatData = { title: string; subtitle: string; color: string; games: GameCard[] };

const CATS: Record<BrainRegion, CatData> = {
  frontal: { title: "Focus & Working Memory", subtitle: "Self-control, planning, staying on task", color: "#228181", games: [
    { title: "Go / No-Go", description: "Inhibition and impulse control", route: "GoNoGoDifficulty" },
    { title: "N-Back Sprint", description: "Working memory updating", route: "NBackDifficulty" },
    { title: "Stop-Signal", description: "Brake on command", comingSoon: true },
    { title: "Rule Stack", description: "Hold 2 rules, apply quickly", comingSoon: true },
  ]},
  parietal: { title: "Attention & Spatial", subtitle: "Attention shifting, visuospatial control", color: "#93DED5", games: [
    { title: "Visual Search", description: "Find targets among distractors", route: "VisualSearchDifficulty" },
    { title: "Spatial Span Grid", description: "Spatial sequence recall", comingSoon: true },
    { title: "Cue Shift", description: "Respond to shifting cues", comingSoon: true },
  ]},
  temporal: { title: "Language & Meaning", subtitle: "Language processing, semantic retrieval", color: "#74A3A5", games: [
    { title: "Meaning Match", description: "Fast synonym matching", comingSoon: true },
    { title: "Word-to-Concept", description: "Pick concepts under pressure", comingSoon: true },
  ]},
  occipital: { title: "Visual & Patterns", subtitle: "Visual discrimination, pattern recognition", color: "#347679", games: [
    { title: "Oddball Pop", description: "Spot rare targets", comingSoon: true },
    { title: "Pattern Snap", description: "Quick visual discrimination", comingSoon: true },
  ]},
  cerebellum: { title: "Timing & Rhythm", subtitle: "Timing, consistency", color: "#009189", games: [
    { title: "Rhythm Lock", description: "Tap in-time with tempo", comingSoon: true },
    { title: "Steady Hands", description: "Reaction-time consistency", comingSoon: true },
  ]},
  brainstem: { title: "Reset", subtitle: "Regulation tools", color: "#A3C1C3", games: [
    { title: "60-Second Reset", description: "Paced breathing", comingSoon: true },
  ]},
};

export default function SessionCategoryScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const config = route.params ?? {};
  const region: BrainRegion = config.region ?? "frontal";
  const data = CATS[region];
  const sessionTimer = useSessionTimer();
  const prepStartedRef = useRef(false);

  useEffect(() => {
    if (config.phase !== "prep" || !sessionTimer?.startPrep || prepStartedRef.current) return;
    prepStartedRef.current = true;
    sessionTimer.startPrep(config, () => {
      navigation.replace("FocusCountdown", { ...config, currentCycle: 1 });
    });
  }, [config.phase, sessionTimer]);

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} /><View style={styles.blobRight} /><View style={styles.blobBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.colorBar, { backgroundColor: data.color }]} />
        <Text style={styles.h}>{data.title}</Text>
        <Text style={styles.sub}>{data.subtitle}</Text>
        <View style={styles.prepBadge}>
          <Text style={styles.prepBadgeText}>{Math.round((config.prepDuration ?? 300) / 60)} min warm-up</Text>
        </View>
        <View style={{ height: spacing.lg }} />
        {data.games.map((game, idx) => {
          const disabled = !!game.comingSoon;
          return (
            <Pressable key={idx} disabled={disabled}
              onPress={() => {
                if (game.route) {
                  // Navigate to game -- after game finishes, the session orchestrator
                  // will transition to FocusCountdown. For now, navigate to the game.
                  // Pass session config through so region and session state persist
                  navigation.navigate(game.route, { sessionConfig: config });
                }
              }}
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
  prepBadge: { alignSelf: "flex-start", marginTop: spacing.sm, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(52,118,121,0.14)" },
  prepBadgeText: { color: PALETTE.deep, fontWeight: "800", fontSize: 12 },
  gameCard: { backgroundColor: "rgba(209,225,225,0.5)", borderRadius: 20, padding: spacing.lg, marginBottom: spacing.md, gap: 6 },
  gameTitle: { color: theme.text, fontSize: 18, fontWeight: "900" },
  gameDesc: { color: theme.text, opacity: 0.75, fontWeight: "700", fontSize: 13 },
  badge: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: PALETTE.deep },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  back: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, backgroundColor: "rgba(209,225,225,0.45)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  backText: { color: theme.text, fontWeight: "900", opacity: 0.9 },
});
