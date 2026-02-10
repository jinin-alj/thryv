import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { useAuth } from "../auth/AuthContext";
import { createRoom, joinRoomByCode } from "../firebase/studyRooms";

const PALETTE = {
  deep: "#347679",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

type Props = NativeStackScreenProps<RootStackParamList, "StudyRooms">;

type RoomPreset = {
  id: string;
  name: string;
  focusMin: number;
  breakMin: number;
  longBreakMin: number;
  cyclesBeforeLongBreak: number;
  bestFor: string;
};

const ROOM_PRESETS: RoomPreset[] = [
  {
    id: "pomodoro",
    name: "Pomodoro (25/5 + long)",
    focusMin: 25,
    breakMin: 5,
    longBreakMin: 15,
    cyclesBeforeLongBreak: 4,
    bestFor: "Consistency + avoiding procrastination. Great default for groups.",
  },
  {
    id: "deep45",
    name: "Deep Work (45/10)",
    focusMin: 45,
    breakMin: 10,
    longBreakMin: 20,
    cyclesBeforeLongBreak: 3,
    bestFor: "Problem sets / coding / writing with fewer interruptions.",
  },
  {
    id: "exam60",
    name: "Exam Mode (60/10)",
    focusMin: 60,
    breakMin: 10,
    longBreakMin: 25,
    cyclesBeforeLongBreak: 2,
    bestFor: "Mock exams, long reading blocks, high-cognitive load sessions.",
  },
];

function clampInt(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function StudyRoomsScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const { user } = useAuth();

  const displayName = useMemo(() => {
    const email = user?.email ?? "Guest";
    return email.split("@")[0];
  }, [user?.email]);

  // Join
  const [joinCode, setJoinCode] = useState("");

  // Create config
  const [selectedPresetId, setSelectedPresetId] = useState<string>(ROOM_PRESETS[0].id);

  const [customFocusMinText, setCustomFocusMinText] = useState("25");
  const [customBreakMinText, setCustomBreakMinText] = useState("5");
  const [customLongBreakMinText, setCustomLongBreakMinText] = useState("15");
  const [customCyclesText, setCustomCyclesText] = useState("4");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedPreset = ROOM_PRESETS.find((p) => p.id === selectedPresetId) ?? ROOM_PRESETS[0];

  function applyPresetToCustom(p: RoomPreset) {
    setCustomFocusMinText(String(p.focusMin));
    setCustomBreakMinText(String(p.breakMin));
    setCustomLongBreakMinText(String(p.longBreakMin));
    setCustomCyclesText(String(p.cyclesBeforeLongBreak));
  }

  async function onCreatePreset() {
    if (!user) {
      setErr("Please log in to create a room.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const p = selectedPreset;
      const res = await createRoom({
        hostUid: user.uid,
        hostName: displayName,
        focusSec: p.focusMin * 60,
        breakSec: p.breakMin * 60,
        longBreakSec: p.longBreakMin * 60,
        cyclesBeforeLongBreak: p.cyclesBeforeLongBreak,
      });

      navigation.navigate("StudyRoom", { roomId: res.roomId });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create room");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateCustom() {
    if (!user) {
      setErr("Please log in to create a room.");
      return;
    }
    setErr(null);

    const f = clampInt(parseInt(customFocusMinText.trim(), 10), 1, 180);
    const b = clampInt(parseInt(customBreakMinText.trim(), 10), 1, 60);
    const lb = clampInt(parseInt(customLongBreakMinText.trim(), 10), 1, 90);
    const cyc = clampInt(parseInt(customCyclesText.trim(), 10), 0, 12);

    if (
      Number.isNaN(parseInt(customFocusMinText.trim(), 10)) ||
      Number.isNaN(parseInt(customBreakMinText.trim(), 10)) ||
      Number.isNaN(parseInt(customLongBreakMinText.trim(), 10)) ||
      Number.isNaN(parseInt(customCyclesText.trim(), 10))
    ) {
      setErr("Please enter valid numbers for custom timer values.");
      return;
    }

    // write clamped values back (good UX)
    setCustomFocusMinText(String(f));
    setCustomBreakMinText(String(b));
    setCustomLongBreakMinText(String(lb));
    setCustomCyclesText(String(cyc));

    setBusy(true);
    try {
      const res = await createRoom({
        hostUid: user.uid,
        hostName: displayName,
        focusSec: f * 60,
        breakSec: b * 60,
        longBreakSec: lb * 60,
        cyclesBeforeLongBreak: cyc, // 0 = no long breaks
      });

      navigation.navigate("StudyRoom", { roomId: res.roomId });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create room");
    } finally {
      setBusy(false);
    }
  }

  async function onJoin() {
    if (!user) {
      setErr("Please log in to join a room.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const res = await joinRoomByCode({
        code: joinCode,
        uid: user.uid,
        displayName,
      });
      navigation.navigate("StudyRoom", { roomId: res.roomId });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to join room");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Study Rooms</Text>
        <Text style={[styles.sub, { color: theme.muted }]}>
          Sync timers with friends and lock in during finals week.
        </Text>

        <View style={{ height: spacing.lg }} />

        <View style={styles.card}>
          <Text style={[styles.section, { color: theme.muted }]}>Create (preset)</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: spacing.sm }}>
            {ROOM_PRESETS.map((p) => {
              const selected = p.id === selectedPresetId;
              return (
                <View key={p.id} style={{ marginRight: spacing.sm }}>
                  <PrimaryButton
                    title={p.name}
                    disabled={busy}
                    onPress={() => {
                      setSelectedPresetId(p.id);
                      applyPresetToCustom(p);
                    }}
                    style={selected ? styles.presetBtnActive : styles.presetBtn}
                    textStyle={selected ? styles.presetTextActive : styles.presetText}
                  />
                </View>
              );
            })}
          </ScrollView>

          <Text style={[styles.small, { color: theme.muted }]}>
            <Text style={{ fontWeight: "900" }}>Best for: </Text>
            {selectedPreset.bestFor}
          </Text>

          <View style={{ height: spacing.sm }} />

          <PrimaryButton
            title={busy ? "Working..." : "Create room (using preset)"}
            onPress={onCreatePreset}
            style={styles.primaryBtn}
            textStyle={styles.primaryBtnText}
          />

          <View style={{ height: spacing.lg }} />

          <Text style={[styles.section, { color: theme.muted }]}>Create (custom)</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: theme.muted }]}>Focus (min)</Text>
              <TextInput
                value={customFocusMinText}
                onChangeText={setCustomFocusMinText}
                keyboardType="number-pad"
                style={[styles.input, { color: theme.text }]}
                editable={!busy}
              />
            </View>

            <View style={{ width: spacing.sm }} />

            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: theme.muted }]}>Break (min)</Text>
              <TextInput
                value={customBreakMinText}
                onChangeText={setCustomBreakMinText}
                keyboardType="number-pad"
                style={[styles.input, { color: theme.text }]}
                editable={!busy}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: theme.muted }]}>Long break (min)</Text>
              <TextInput
                value={customLongBreakMinText}
                onChangeText={setCustomLongBreakMinText}
                keyboardType="number-pad"
                style={[styles.input, { color: theme.text }]}
                editable={!busy}
              />
            </View>

            <View style={{ width: spacing.sm }} />

            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: theme.muted }]}>Cycles for long break</Text>
              <TextInput
                value={customCyclesText}
                onChangeText={setCustomCyclesText}
                keyboardType="number-pad"
                style={[styles.input, { color: theme.text }]}
                editable={!busy}
              />
            </View>
          </View>

          <Text style={[styles.small, { color: theme.muted }]}>
            Set cycles to <Text style={{ fontWeight: "900" }}>0</Text> to disable long breaks.
          </Text>

          <View style={{ height: spacing.sm }} />

          <PrimaryButton
            title="Create room (custom)"
            onPress={onCreateCustom}
            style={styles.secondaryBtn}
            textStyle={styles.secondaryBtnText}
          />

          <View style={{ height: spacing.lg }} />

          <Text style={[styles.section, { color: theme.muted }]}>Join</Text>

          <TextInput
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="Enter room code (e.g. K7Q2)"
            placeholderTextColor={theme.muted}
            autoCapitalize="characters"
            style={[styles.input, { color: theme.text }]}
            editable={!busy}
          />

          {err ? <Text style={styles.err}>{err}</Text> : null}

          <PrimaryButton
            title="Join room"
            onPress={onJoin}
            style={styles.secondaryBtn}
            textStyle={styles.secondaryBtnText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: { flex: 1 },
    content: { flexGrow: 1, padding: spacing.xl },

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

    title: { fontSize: 28, fontWeight: "900" },
    sub: { marginTop: 6, fontWeight: "700" },

    card: {
      borderRadius: 28,
      padding: spacing.lg,
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 2,
    },

    section: {
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: spacing.sm,
    },

    presetBtn: {
      backgroundColor: "rgba(209, 225, 225, 0.55)",
      borderRadius: 16,
    },
    presetBtnActive: {
      backgroundColor: "rgba(116, 163, 165, 0.35)",
      borderRadius: 16,
    },
    presetText: { color: PALETTE.deep, fontWeight: "800", fontSize: 14 },
    presetTextActive: { color: PALETTE.deep, fontWeight: "900", fontSize: 14 },

    row: { flexDirection: "row", marginBottom: spacing.sm },

    inputLabel: { fontSize: 12, fontWeight: "900", marginBottom: 6 },

    input: {
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      fontWeight: "800",
    },

    small: { fontSize: 12, fontWeight: "700", lineHeight: 16, marginTop: 6 },

    err: { color: "tomato", fontWeight: "800", marginTop: spacing.sm },

    primaryBtn: { backgroundColor: "rgba(163, 193, 195, 0.45)" },
    primaryBtnText: { color: PALETTE.deep, fontWeight: "800" },

    secondaryBtn: { backgroundColor: "rgba(209, 225, 225, 0.6)" },
    secondaryBtnText: { color: PALETTE.deep, fontWeight: "700" },
  });
