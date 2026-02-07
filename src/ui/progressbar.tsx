import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "../theme/themeContext";

export default function ProgressBar({ value }: { value: number }) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    track: {
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.border,
      overflow: "hidden",
    },
    fill: {
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.primary,
    },
  });
