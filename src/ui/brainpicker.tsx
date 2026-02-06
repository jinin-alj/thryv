import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";

export type BrainGame = {
  id: "gonogo";
  title: string;
  subtitle: string;
  minutes: number;
};

export default function BrainPicker({
  games,
  selectedId,
  onSelect,
}: {
  games: BrainGame[];
  selectedId: BrainGame["id"];
  onSelect: (id: BrainGame["id"]) => void;
}) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  return (
    <View style={{ gap: spacing.sm }}>
      {games.map((g) => {
        const active = g.id === selectedId;
        return (
          <Pressable
            key={g.id}
            onPress={() => onSelect(g.id)}
            style={[
              styles.card,
              active ? { borderColor: theme.primary } : null,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{g.title}</Text>
              <Text style={styles.sub}>{g.subtitle}</Text>
            </View>
            <Text style={styles.mins}>{g.minutes}m</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: spacing.md,
      gap: spacing.md,
    },
    title: { color: theme.text, fontSize: 16, fontWeight: "800" },
    sub: { color: theme.mutedText, marginTop: 4, fontSize: 13, fontWeight: "600" },
    mins: { color: theme.mutedText, fontSize: 12, fontWeight: "800" },
  });
