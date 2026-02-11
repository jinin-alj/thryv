import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import BrainMap, { BrainRegion } from "../ui/BrainMap";

export default function BrainPrepScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const sessionConfig = route.params ?? {};

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} /><View style={styles.blobRight} /><View style={styles.blobBottom} />

      <View style={{ flex: 1 }} />

      <Text style={styles.h}>Train Your Brain</Text>
      <Text style={styles.sub}>Pick a brain region to warm up before your focus session</Text>

      <View style={{ height: spacing.lg }} />

      <BrainMap
        onRegionPress={(region: BrainRegion) => {
          navigation.navigate("SessionCategory", {
            ...sessionConfig,
            region,
          });
        }}
        size={300}
      />

      <View style={{ flex: 1 }} />

      <Text style={styles.hint}>Tap a region to start your warm-up</Text>
      <View style={{ height: spacing.lg }} />
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.background, padding: spacing.xl },
  blobTop: { position: "absolute", top: -180, left: -140, width: 420, height: 420, borderRadius: 210, backgroundColor: "#d1e1e1", opacity: 0.35 },
  blobRight: { position: "absolute", top: 40, right: -180, width: 380, height: 380, borderRadius: 190, backgroundColor: "#a3c1c3", opacity: 0.18 },
  blobBottom: { position: "absolute", bottom: -220, left: -120, width: 520, height: 520, borderRadius: 260, backgroundColor: "#74a3a5", opacity: 0.09 },
  h: { color: theme.text, fontSize: 28, fontWeight: "900" },
  sub: { color: theme.text, opacity: 0.85, fontWeight: "700", marginTop: 6, lineHeight: 20 },
  hint: { color: theme.text, opacity: 0.5, fontWeight: "700", fontSize: 13, textAlign: "center" },
});
