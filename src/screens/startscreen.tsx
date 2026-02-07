import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { getString, Keys } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Start">;

export default function StartScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { user, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const v = await getString(Keys.onboarded, "");
      setOnboarded(v);
    })();
  }, []);

  useEffect(() => {
    if (onboarded === null) return;

    if (!onboarded) {
      navigation.replace("Onboarding");
      return;
    }

    if (loading) return; 

    navigation.replace(user ? "Home" : "Login");
  }, [onboarded, loading, user, navigation]);

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", alignItems: "center" },
});
