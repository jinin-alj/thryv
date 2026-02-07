import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { getJSON, Keys, Profile, GameRun } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";

import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lastRun, setLastRun] = useState<GameRun | null>(null);
  const [brainHtml, setBrainHtml] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setProfile(await getJSON(Keys.profile, null));
      setLastRun(await getJSON(Keys.lastRun, null));
    })();
  }, []);

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
    <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Image
            source={require("../assets/THRYV_icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={styles.profileBtn}
            hitSlop={10}
          >
            <Image
              source={require("../assets/profile_icon.png")}
              style={styles.profileIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View style={{ height: spacing.md }} />

        <Text style={[styles.title, { color: theme.text }]}>
          Welcome back
        </Text>
        <Text style={[styles.sub, { color: theme.muted }]}>
          Prime your brain. Then crush the study block.
        </Text>

        <View style={{ height: spacing.md }} />

        {/* Today context */}
        <View style={styles.todayCard}>
          <Text style={[styles.todayLabel, { color: theme.muted }]}>
            Today
          </Text>
          <Text style={[styles.todayText, { color: theme.text }]}>
            {lastRun
              ? "Keep the momentum — one quick round can sharpen your focus."
              : "No sessions yet. Start with a quick round to warm up your focus."}
          </Text>
        </View>

        <View style={{ height: spacing.lg }} />

        {/* Brain card */}
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

        <View style={{ height: spacing.lg }} />

        {/* Actions */}
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>
          Play
        </Text>

        <View style={{ height: spacing.sm }} />

        <PrimaryButton
          title="Games"
          onPress={() => navigation.navigate("Games")}
          style={styles.primaryBtn}
          textStyle={styles.primaryBtnText}
        />

        <View style={{ height: spacing.lg }} />

        <Text style={[styles.sectionLabel, { color: theme.muted }]}>
          Quick actions
        </Text>

        <View style={{ height: spacing.sm }} />

        <PrimaryButton
          title="Focus Timer"
          onPress={() => navigation.navigate("FocusTimer")}
          style={styles.secondaryBtn}
          textStyle={styles.secondaryBtnText}
        />

        <View style={{ height: spacing.sm }} />

        <PrimaryButton
          title="Fun Facts"
          onPress={() => navigation.navigate("FunFacts")}
          style={styles.secondaryBtn}
          textStyle={styles.secondaryBtnText}
        />

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },

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

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 60,
    height: 60,
    opacity: 0.9,
  },

  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(209, 225, 225, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  profileIcon: {
    width: 20,
    height: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  sub: {
    marginTop: 6,
    fontWeight: "600",
  },

  todayCard: {
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: "rgba(209, 225, 225, 0.45)",
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  todayText: {
    marginTop: 6,
    fontWeight: "700",
    lineHeight: 20,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

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
    backgroundColor: "rgba(52, 118, 121, 0.14)",
    paddingVertical: 18,
    borderRadius: 22,
  },
  primaryBtnText: {
    color: PALETTE.deep,
    fontWeight: "900",
    fontSize: 18,
  },

  secondaryBtn: {
    backgroundColor: "rgba(209, 225, 225, 0.6)",
  },
  secondaryBtnText: {
    color: PALETTE.deep,
    fontWeight: "700",
  },
});
