import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { getJSON, Keys, Profile, GameRun } from "../storage/local";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lastRun, setLastRun] = useState<GameRun | null>(null);

  useEffect(() => {
    (async () => {
      setProfile(await getJSON(Keys.profile, null));
      setLastRun(await getJSON(Keys.lastRun, null));
    })();
  }, []);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
      <Text style={[styles.sub, { color: theme.muted }]}>
        Prime your brain. Then crush the study block.
      </Text>

      <View style={{ height: spacing.lg }} />

      {/* ✅ THIS GOES TO GAME SCREEN */}
      <PrimaryButton
        title="Play"
        onPress={() => navigation.navigate("Games")}
      />

      <View style={{ height: spacing.sm }} />

      {/* ✅ THIS GOES TO TIMER */}
      <PrimaryButton
        title="Focus Timer"
        onPress={() => navigation.navigate("FocusTimer")}
        style={{ backgroundColor: theme.card }}
      />

      <View style={{ height: spacing.sm }} />

      <PrimaryButton
        title="Profile"
        onPress={() => navigation.navigate("Profile")}
        style={{ backgroundColor: theme.card }}
      />

      <View style={{ height: spacing.sm }} />

      <PrimaryButton
        title="Fun Facts"
        onPress={() => navigation.navigate("FunFacts")}
        style={{ backgroundColor: theme.card }}
      />

      <View style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  sub: {
    marginTop: 6,
    fontWeight: "600",
  },
});
