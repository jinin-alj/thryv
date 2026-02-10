import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import PrimaryButton from "../ui/primarybutton";
import { SafeAreaView } from "react-native-safe-area-context";

import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

const facts = [
  "Attention is a limited resource — doom-scrolling makes refocusing harder.",
  "Reaction time slows when you're mentally fatigued.",
  "Working memory is the brain’s scratchpad for learning.",
  "Impulse control is critical for sustained focus.",
];

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function FunFactScreen() {
  const { theme } = useAppTheme();
  const [seed, setSeed] = useState(0);
  const [brainHtml, setBrainHtml] = useState<string | null>(null);

  const fact = useMemo(() => facts[seed % facts.length], [seed]);
  const styles = makeStyles(theme);

  useEffect(() => {
    (async () => {
      try {
        const modelAsset = Asset.fromModule(
          require("../models/human_brain.glb")
        );
        await modelAsset.downloadAsync();

        const localUri = modelAsset.localUri;
        if (!localUri) throw new Error("Model localUri is null");

        const base64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const dataUri = `data:model/gltf-binary;base64,${base64}`;

        const html = `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <style>
      html, body { margin:0; height:100%; background: transparent; }
      model-viewer { width:100%; height:100%; background: transparent; }
    </style>
  </head>
  <body>
    <model-viewer
      src="${dataUri}"
      camera-controls
      auto-rotate
      rotation-per-second="18deg"
      interaction-prompt="none"
      shadow-intensity="0"
      exposure="1"
      style="--progress-bar-color: transparent;"
    ></model-viewer>
  </body>
</html>`;

        setBrainHtml(html);
      } catch (e) {
        console.log("Brain viewer error:", e);
        setBrainHtml(null);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h}>Fun facts</Text>

        <View style={styles.card}>
          <Text style={styles.p}>{fact}</Text>
        </View>

        <View style={{ height: spacing.lg }} />
        <PrimaryButton
          title="New fact"
          onPress={() => setSeed((s) => s + 1)}
          style={styles.primaryBtn}
          textStyle={styles.primaryBtnText}
        />

        <View style={{ height: spacing.xl }} />

        {/* Brain 3D model */}
        <View style={styles.brainCard}>
          <View style={styles.brainTag}>
            <Text style={styles.brainTagText}>Explore the brain</Text>
          </View>

          {brainHtml ? (
            <WebView
              originWhitelist={["*"]}
              source={{ html: brainHtml }}
              style={{ flex: 1, backgroundColor: "transparent" }}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              allowsInlineMediaPlayback
            />
          ) : (
            <View style={styles.brainFallback}>
              <Text style={{ color: theme.muted, fontWeight: "600" }}>
                Loading brain…
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
    },

    content: {
      flexGrow: 1,
      padding: spacing.xl,
    },

    blobTop: {
      position: "absolute",
      top: -180,
      left: -140,
      width: 420,
      height: 420,
      borderRadius: 210,
      backgroundColor: PALETTE.mist,
      opacity: 0.45,
    },
    blobRight: {
      position: "absolute",
      top: 40,
      right: -180,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor: PALETTE.light,
      opacity: 0.2,
    },
    blobBottom: {
      position: "absolute",
      bottom: -220,
      left: -120,
      width: 520,
      height: 520,
      borderRadius: 260,
      backgroundColor: PALETTE.soft,
      opacity: 0.1,
    },

    h: { color: theme.text, fontSize: 26, fontWeight: "900" },

    card: {
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      borderRadius: 24,
      padding: spacing.lg,
      marginTop: spacing.md,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 2,
    },

    p: { color: theme.text, fontSize: 16, fontWeight: "700", lineHeight: 24 },

    brainCard: {
      height: 240,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: "rgba(209, 225, 225, 0.5)",
    },
    brainTag: {
      position: "absolute",
      top: 14,
      left: 14,
      zIndex: 2,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(52, 118, 121, 0.14)",
    },
    brainTagText: {
      color: PALETTE.deep,
      fontWeight: "900",
      fontSize: 12,
    },
    brainFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    primaryBtn: {
      backgroundColor: "rgba(163, 193, 195, 0.45)",
    },

    primaryBtnText: {
      color: PALETTE.deep,
      fontWeight: "800",
    },
  });