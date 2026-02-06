import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { getString, Keys } from "../storage/local";

type Props = NativeStackScreenProps<RootStackParamList, "Start">;

export default function StartScreen({ navigation }: Props) {
  useEffect(() => {
    (async () => {
      const onboarded = await getString(Keys.onboarded, "0");
      if (onboarded === "1") navigation.replace("Home");
    })();
  }, [navigation]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>thryv</Text>
      <Text style={styles.sub}>
        Micro brain sprints that prime your focus before you study.
      </Text>

      <View style={{ height: spacing.xl }} />

      <PrimaryButton title="Get Started" onPress={() => navigation.replace("Onboarding")} />
      <View style={{ height: spacing.sm }} />
      <PrimaryButton title="Skip to Home" onPress={() => navigation.replace("Home")} style={{ backgroundColor: colors.card }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: "center" },
  title: { color: colors.text, fontSize: 44, fontWeight: "900" },
  sub: { color: colors.muted, marginTop: spacing.sm, fontSize: 15, fontWeight: "600", lineHeight: 22 },
});
