import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import BrainPicker, { BrainGame } from "../ui/brainpicker";
import { getJSON, setJSON, Keys, Profile, todayKey } from "../storage/local";
import GoNoGoGame from "./gonogo_screen";

type Props = NativeStackScreenProps<RootStackParamList, "Games">;

type DailyPlays = { date: string; used: number };

const FREE_PLAYS_PER_DAY = 3;

export default function GameScreen({ navigation }: Props) {
  const games: BrainGame[] = useMemo(
    () => [
      { id: "gonogo", title: "Go / No-Go", subtitle: "Impulse control + sustained attention", minutes: 2 },
    ],
    []
  );

  const [selected, setSelected] = useState<BrainGame["id"]>("gonogo");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [daily, setDaily] = useState<DailyPlays>({ date: todayKey(), used: 0 });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      setProfile(await getJSON(Keys.profile, null));
      const d = await getJSON<DailyPlays>(Keys.freePlaysDaily, { date: todayKey(), used: 0 });
      if (d.date !== todayKey()) {
        const reset = { date: todayKey(), used: 0 };
        await setJSON(Keys.freePlaysDaily, reset);
        setDaily(reset);
      } else {
        setDaily(d);
      }
    })();
  }, []);

  function canPlay(): boolean {
    if (profile?.isPremium) return true;
    return daily.used < FREE_PLAYS_PER_DAY;
  }

  async function consumePlay() {
    if (profile?.isPremium) return;
    const next = { date: todayKey(), used: daily.used + 1 };
    setDaily(next);
    await setJSON(Keys.freePlaysDaily, next);
  }

  function start() {
    if (!canPlay()) {
      Alert.alert("Daily limit reached", `Free users get ${FREE_PLAYS_PER_DAY} plays/day. Toggle Premium in Profile for demo.`);
      return;
    }
    setPlaying(true);
  }

  if (playing) {
    return (
      <GoNoGoGame
        onExit={() => setPlaying(false)}
        onFinished={() => {
          consumePlay().catch(() => {});
          navigation.replace("Home");
        }}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Brain sprints</Text>
      <Text style={styles.sub}>2–3 minutes. Fast reset. Real focus.</Text>

      <View style={{ height: spacing.lg }} />

      <BrainPicker games={games} selectedId={selected} onSelect={setSelected} />

      <View style={{ height: spacing.lg }} />

      <PrimaryButton title="Start" onPress={start} />
      <View style={{ height: spacing.sm }} />
      <PrimaryButton title="Back" onPress={() => navigation.goBack()} style={{ backgroundColor: colors.card }} />

      <View style={{ flex: 1 }} />
      <Text style={styles.footer}>
        {profile?.isPremium ? "Premium unlimited" : `Free plays left today: ${Math.max(0, FREE_PLAYS_PER_DAY - daily.used)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  h: { color: colors.text, fontSize: 28, fontWeight: "900" },
  sub: { color: colors.muted, marginTop: 6, fontWeight: "600" },
  footer: { color: colors.muted, fontSize: 12, fontWeight: "700", opacity: 0.8 },
});
