import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  variant?: "outline";
}) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && !disabled ? { opacity: 0.9 } : null,
        disabled ? { opacity: 0.45 } : null,
        style,
      ]}
    >
      <Text style={[styles.txt, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    btn: {
      backgroundColor: theme.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    txt: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "800",
    },
  });