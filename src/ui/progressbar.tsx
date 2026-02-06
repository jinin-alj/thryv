import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  fill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
