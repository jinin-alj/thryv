import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polyline, Line, Circle } from "react-native-svg";

import { getJSON, setJSON, Keys, Profile, GameRun } from "../storage/local";

type Metric = "focus" | "accuracy" | "speed";

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function ProfileScreen() {
  const { theme, toggleTheme, mode } = useAppTheme();
  const styles = makeStyles(theme);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [runs, setRuns] = useState<GameRun[]>([]);
  const [metric, setMetric] = useState<Metric>("focus");

  useEffect(() => {
    (async () => {
      setProfile(await getJSON(Keys.profile, null));
      setRuns(await getJSON(Keys.runs, []));
    })();
  }, []);

  async function togglePremium(v: boolean) {
    if (!profile) return;
    const next = { ...profile, isPremium: v };
    setProfile(next);
    await setJSON(Keys.profile, next);
  }

  const chartRuns = runs.slice(0, 10).reverse();

  const chartValues = useMemo(() => {
    if (metric === "focus") return chartRuns.map((r) => r.focusScore ?? 0);
    if (metric === "accuracy")
      return chartRuns.map((r) => Math.round((r.accuracy ?? 0) * 100));
    return chartRuns.map((r) => r.avgReactionMs ?? 0);
  }, [metric, chartRuns]);

  const chartTitle =
    metric === "focus"
      ? "Focus score trend"
      : metric === "accuracy"
      ? "Accuracy trend"
      : "Reaction time trend";

  const latestValue = chartValues.length
    ? chartValues[chartValues.length - 1]
    : null;

  const latestLabel =
    metric === "focus"
      ? `${latestValue ?? "-"} / 100`
      : metric === "accuracy"
      ? `${latestValue ?? "-"}%`
      : `${latestValue ?? "-"} ms`;

  const chartWidth = Math.min(
    Dimensions.get("window").width - spacing.xl * 2 - spacing.lg * 2,
    360
  );

  const min = chartValues.length ? Math.min(...chartValues) : 0;
  const max = chartValues.length ? Math.max(...chartValues) : 0;

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h}>Profile</Text>

        <View style={{ height: spacing.lg }} />

        <View style={styles.card}>
          <Text style={styles.label}>Streak</Text>
          <Text style={styles.big}>{profile?.streakDays ?? 0} days</Text>

          <View style={{ height: spacing.md }} />

          <Text style={styles.label}>Total Runs</Text>
          <Text style={styles.big}>{profile?.totalRuns ?? 0}</Text>

          <View style={{ height: spacing.md }} />

          <View style={styles.row}>
            <Text style={styles.label}>Premium (Demo)</Text>
            <Switch value={!!profile?.isPremium} onValueChange={togglePremium} />
          </View>

          <View style={{ height: spacing.md }} />

          <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch value={mode === "dark"} onValueChange={toggleTheme} />
          </View>
        </View>

        <View style={{ height: spacing.lg }} />

        <View style={styles.card}>
          <Text style={styles.label}>Recent Results</Text>

          {runs.length === 0 && <Text style={styles.empty}>No runs yet.</Text>}

          {runs.slice(0, 5).map((r) => (
            <View key={r.id} style={styles.resultRow}>
              <Text style={styles.resultScore}>{r.focusScore}/100</Text>
              <Text style={styles.resultDetail}>
                {Math.round(r.accuracy * 100)}% · L{r.difficultyLevel}
              </Text>
            </View>
          ))}

          <View style={{ height: spacing.lg }} />

          <Text style={styles.label}>{chartTitle}</Text>

          {/* Metric selector */}
          <View style={styles.metricRow}>
            <MetricChip
              label="Focus"
              active={metric === "focus"}
              onPress={() => setMetric("focus")}
              theme={theme}
            />
            <MetricChip
              label="Accuracy"
              active={metric === "accuracy"}
              onPress={() => setMetric("accuracy")}
              theme={theme}
            />
            <MetricChip
              label="Speed"
              active={metric === "speed"}
              onPress={() => setMetric("speed")}
              theme={theme}
            />
          </View>

          {chartValues.length < 2 ? (
            <Text style={styles.empty}>Play at least 2 runs to see your trend.</Text>
          ) : (
            <>
              <View style={styles.chartMetaRow}>
                <Text style={styles.metaText}>
                  Max: {formatMetric(max, metric)}
                </Text>
                <Text style={styles.metaText}>Latest: {latestLabel}</Text>
              </View>

              <View style={styles.chartRow}>
                <View style={styles.yAxis}>
                  <Text style={styles.yAxisText}>{formatMetric(max, metric)}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.yAxisText}>{formatMetric(min, metric)}</Text>
                </View>

                <MiniLineChart
                  values={chartValues}
                  width={chartWidth}
                  height={140}
                  padding={14}
                  stroke={theme.primary}
                  axis={theme.border}
                  dot={theme.primary}
                />
              </View>
            </>
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricChip({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? theme.primary : theme.border,
          backgroundColor: active ? theme.primary : "transparent",
        },
      ]}
    >
      <Text
        style={{
          color: active ? theme.background : theme.text,
          fontWeight: "900",
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function formatMetric(v: number, metric: "focus" | "accuracy" | "speed") {
  if (metric === "focus") return `${Math.round(v)}`;
  if (metric === "accuracy") return `${Math.round(v)}%`;
  return `${Math.round(v)} ms`;
}

function MiniLineChart({
  values,
  width,
  height,
  padding,
  stroke,
  axis,
  dot,
}: {
  values: number[];
  width: number;
  height: number;
  padding: number;
  stroke: string;
  axis: string;
  dot: string;
}) {
  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const insetX = 18;

  const innerW = width - padding * 2 - insetX * 2;
  const innerH = height - padding * 2;

  const xLeft = padding + insetX;
  const xRight = xLeft + innerW;

  const yTop = padding;
  const yBottom = padding + innerH;

  const points = values.map((v, i) => {
    const t = i / (values.length - 1);
    const x = xLeft + t * innerW;
    const y = yTop + (1 - (v - min) / range) * innerH;
    return { x, y };
  });

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];

  return (
    <Svg width={width} height={height}>
      <Line x1={xLeft} y1={yTop} x2={xRight} y2={yTop} stroke={axis} strokeWidth={1} />
      <Line x1={xLeft} y1={yBottom} x2={xRight} y2={yBottom} stroke={axis} strokeWidth={1} />

      <Polyline
        points={polyPoints}
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* last-point dot */}
      <Circle cx={last.x} cy={last.y} r={4} fill={dot} />
    </Svg>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
      padding: spacing.xl,
    },

    blobTop: {
      position: "absolute",
      top: -180,
      left: -140,
      width: 420,
      height: 420,
      borderRadius: 210,
      backgroundColor: PALETTE.mist,
      opacity: 0.45,
    },
    blobRight: {
      position: "absolute",
      top: 40,
      right: -180,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor: PALETTE.light,
      opacity: 0.2,
    },
    blobBottom: {
      position: "absolute",
      bottom: -220,
      left: -120,
      width: 520,
      height: 520,
      borderRadius: 260,
      backgroundColor: PALETTE.soft,
      opacity: 0.1,
    },

    scrollContent: {
      paddingBottom: spacing.xl,
    },

    h: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
    },

    card: {
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      borderRadius: 24,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 2,
    },

    label: {
      color: theme.text,
      fontWeight: "800",
      fontSize: 14,
    },

    big: {
      color: theme.text,
      fontSize: 32,
      fontWeight: "900",
      marginTop: 4,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    resultRow: {
      marginTop: 8,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(163, 193, 195, 0.35)",
    },

    resultScore: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: "900",
    },

    resultDetail: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "600",
      marginTop: 2,
    },

    empty: {
      color: theme.text,
      marginTop: 8,
      fontWeight: "600",
      opacity: 0.7,
    },

    metricRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },

    chartMetaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },

    metaText: {
      color: theme.text,
      fontWeight: "700",
      fontSize: 12,
      opacity: 0.85,
    },

    chartRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    yAxis: {
      width: 34,
      height: 140,
      paddingVertical: 8,
      marginRight: 4,
      justifyContent: "space-between",
    },

    yAxisText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "800",
      opacity: 0.85,
    },
  });