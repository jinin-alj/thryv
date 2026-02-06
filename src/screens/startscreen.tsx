import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { getString, Keys } from "../storage/local";

type Props = NativeStackScreenProps<RootStackParamList, "Start">;

export default function StartScreen({ navigation }: Props) {
  const { theme } = useAppTheme();

  useEffect(() => {
    (async () => {
      const onboarded = await getString(Keys.onboarded, "");
      if (!onboarded) {
        navigation.replace("Onboarding");
      } else {
        navigation.replace("Home");
      }
    })();
  }, []);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
