import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

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
              active ? { borderColor: colors.primary } : null,
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

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  sub: { color: colors.muted, marginTop: 4, fontSize: 13, fontWeight: "600" },
  mins: { color: colors.muted, fontSize: 12, fontWeight: "800" },
});
