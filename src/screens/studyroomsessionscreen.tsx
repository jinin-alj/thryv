import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { useAuth } from "../auth/AuthContext";
import {
  heartbeat,
  listenMembers,
  listenRoom,
  MemberDoc,
  pauseRoom,
  RoomDoc,
  setPhase,
  setReady,
} from "../firebase/studyRooms";

const PALETTE = { deep: "#347679" };

type Props = NativeStackScreenProps<RootStackParamList, "StudyRoom">;

function fmt(sec: number) {
  const m = Math.max(0, Math.floor(sec / 60));
  const s = Math.max(0, sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function StudyRoomSessionScreen({ route, navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const { user } = useAuth();
  const roomId = route.params.roomId;

  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [members, setMembers] = useState<MemberDoc[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [remainingSec, setRemainingSec] = useState(0);

  const uid = user?.uid ?? "";

  const isHost = useMemo(() => {
    return !!room && !!user && room.hostUid === user.uid;
  }, [room, user]);

  const me = useMemo(() => members.find((m) => m.uid === uid) ?? null, [members, uid]);

  // Subscribe to room + members
  useEffect(() => {
    const unsubRoom = listenRoom(roomId, setRoom);
    const unsubMembers = listenMembers(roomId, setMembers);
    return () => {
      unsubRoom();
      unsubMembers();
    };
  }, [roomId]);

  // Presence heartbeat every 20s
  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => {
      heartbeat({ roomId, uid: user.uid }).catch(() => {});
    }, 20000);
    return () => clearInterval(t);
  }, [roomId, user]);

  // Compute remaining from phaseEndsAt
  useEffect(() => {
    const t = setInterval(() => {
      if (!room?.phaseEndsAt) {
        setRemainingSec(0);
        return;
      }
      const msLeft = room.phaseEndsAt.toMillis() - Date.now();
      setRemainingSec(Math.max(0, Math.floor(msLeft / 1000)));
    }, 250);
    return () => clearInterval(t);
  }, [room?.phaseEndsAt]);

  const allReady = useMemo(() => {
    if (members.length === 0) return false;
    return members.every((m) => m.ready);
  }, [members]);

  async function toggleReady() {
    if (!user) return;
    setErr(null);
    try {
      await setReady({ roomId, uid: user.uid, ready: !(me?.ready ?? false) });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to update ready");
    }
  }

  async function hostStart() {
    if (!room || !user) return;
    setErr(null);

    const endsAtMs = Date.now() + room.focusSec * 1000;

    try {
      await setPhase({
        roomId,
        status: "running",
        phase: "FOCUS",
        phaseEndsAtMs: endsAtMs,
        focusBlocksDone: 0,
      });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to start session");
    }
  }

  async function hostPause() {
    try {
      await pauseRoom({ roomId });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to pause");
    }
  }

  // Host auto-advances phases ONLY when time is truly over (Date.now >= endsAt)
  const advanceLockRef = useRef(false);

  useEffect(() => {
    if (!room || !isHost) return;
    if (room.status !== "running") return;
    if (!room.phaseEndsAt) return;

    const endsAtMs = room.phaseEndsAt.toMillis();
    const now = Date.now();

    // ✅ key fix: don't advance unless we are actually past endsAt
    if (now < endsAtMs) {
      advanceLockRef.current = false;
      return;
    }

    if (advanceLockRef.current) return;
    advanceLockRef.current = true;

    (async () => {
      const now2 = Date.now();

      if (room.phase === "FOCUS") {
        const nextCount = (room.focusBlocksDone ?? 0) + 1;

        const isLong =
          room.cyclesBeforeLongBreak > 0 &&
          nextCount % room.cyclesBeforeLongBreak === 0;

        const nextPhase = isLong ? "LONG_BREAK" : "BREAK";
        const durSec = isLong ? room.longBreakSec : room.breakSec;

        await setPhase({
          roomId,
          status: "running",
          phase: nextPhase,
          phaseEndsAtMs: now2 + durSec * 1000,
          focusBlocksDone: nextCount,
        });
      } else {
        // Break -> Focus
        await setPhase({
          roomId,
          status: "running",
          phase: "FOCUS",
          phaseEndsAtMs: now2 + room.focusSec * 1000,
        });
      }
    })().catch(() => {
      advanceLockRef.current = false;
    });
  }, [room, isHost, roomId]);

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Study Room</Text>

        <Text style={[styles.sub, { color: theme.muted }]}>
          {room ? `Code: ${room.code}` : "Loading room…"}
        </Text>

        <View style={{ height: spacing.md }} />

        {room ? (
          <Text style={[styles.small, { color: theme.muted }]}>
            Plan: {Math.round(room.focusSec / 60)}m focus / {Math.round(room.breakSec / 60)}m break
            {room.cyclesBeforeLongBreak > 0
              ? ` • long ${Math.round(room.longBreakSec / 60)}m every ${room.cyclesBeforeLongBreak}`
              : " • no long breaks"}
          </Text>
        ) : null}

        <View style={{ height: spacing.lg }} />

        <View style={styles.timerCard}>
          <Text style={[styles.phase, { color: theme.muted }]}>
            {room?.status === "running"
              ? room?.phase === "FOCUS"
                ? "Focus"
                : room?.phase === "BREAK"
                ? "Break"
                : "Long break"
              : "Lobby"}
          </Text>

          <Text style={[styles.time, { color: theme.text }]}>
            {room?.status === "running" ? fmt(remainingSec) : "—"}
          </Text>

          {room?.status !== "running" ? (
            <Text style={[styles.small, { color: theme.muted }]}>
              Tap Ready. Host starts when everyone is ready.
            </Text>
          ) : null}
        </View>

        <View style={{ height: spacing.md }} />

        {err ? <Text style={styles.err}>{err}</Text> : null}

        <View style={styles.row}>
          <PrimaryButton
            title={me?.ready ? "Ready ✓" : "Ready"}
            onPress={toggleReady}
            style={styles.secondaryBtn}
            textStyle={styles.secondaryBtnText}
          />

          {isHost ? (
            <PrimaryButton
              title={
                room?.status === "running"
                  ? "Pause"
                  : allReady
                  ? "Start session"
                  : "Start (waiting)"
              }
              onPress={() => {
                if (room?.status === "running") hostPause();
                else hostStart();
              }}
              style={styles.primaryBtn}
              textStyle={styles.primaryBtnText}
              disabled={room?.status !== "running" && !allReady}
            />
          ) : null}
        </View>

        <View style={{ height: spacing.lg }} />

        <Text style={[styles.section, { color: theme.muted }]}>People</Text>

        <FlatList
          data={members}
          keyExtractor={(m) => m.uid}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={({ item }) => (
            <View style={styles.memberRow}>
              <Text style={[styles.memberName, { color: theme.text }]}>
                {item.displayName}
                {room?.hostUid === item.uid ? " (host)" : ""}
              </Text>
              <Text style={[styles.memberStatus, { color: theme.muted }]}>
                {item.ready ? "Ready" : "Not ready"}
              </Text>
            </View>
          )}
        />

        {(room?.phase === "BREAK" || room?.phase === "LONG_BREAK") &&
        room?.status === "running" ? (
          <PrimaryButton
            title="Play Go/No-Go Sprint"
            onPress={() => navigation.replace("Games")}
            style={styles.primaryBtn}
            textStyle={styles.primaryBtnText}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: { flex: 1 },
    content: { flex: 1, padding: spacing.xl },

    title: { fontSize: 28, fontWeight: "900" },
    sub: { marginTop: 6, fontWeight: "800" },

    timerCard: {
      borderRadius: 24,
      padding: spacing.lg,
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 2,
    },

    phase: { fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" },
    time: { fontSize: 54, fontWeight: "900", marginTop: spacing.sm },
    small: { marginTop: spacing.sm, fontWeight: "700", lineHeight: 16 },

    err: { color: "tomato", fontWeight: "800", marginBottom: spacing.sm },

    row: { flexDirection: "row", gap: spacing.sm },

    primaryBtn: { flex: 1, backgroundColor: "rgba(163, 193, 195, 0.45)" },
    primaryBtnText: { color: PALETTE.deep, fontWeight: "800" },

    secondaryBtn: { flex: 1, backgroundColor: "rgba(209, 225, 225, 0.6)" },
    secondaryBtnText: { color: PALETTE.deep, fontWeight: "700" },

    section: {
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: spacing.sm,
    },

    memberRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(163, 193, 195, 0.25)",
    },
    memberName: { fontWeight: "900" },
    memberStatus: { fontWeight: "800" },
  });
