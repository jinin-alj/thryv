import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import PrimaryButton from "../ui/primarybutton";

import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

type FunFact = {
  id: string;
  fact: string;
  sourceLabel: string;
  sourceUrl: string;
};

const FUN_FACTS: FunFact[] = [
  {
    id: "switch-cost",
    fact: "Task switching has a measurable time penalty (“switch cost”) even when you feel like you’re multitasking smoothly.",
    sourceLabel: "Rubinstein, Meyer & Evans (2001) – Task switching",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/11518143/",
  },
  {
    id: "attention-residue",
    fact: "After switching tasks, part of your brain stays “stuck” on the previous task (attention residue), lowering performance on the next one.",
    sourceLabel: "Leroy (2009) – Attention residue",
    sourceUrl: "https://www.sciencedirect.com/science/article/pii/S0749597809000399",
  },
  {
    id: "brain-drain-phone",
    fact: "The mere presence of your phone (even face down) can reduce available cognitive capacity (“brain drain”).",
    sourceLabel: "Ward et al. (2017) – Brain Drain",
    sourceUrl: "https://www.journals.uchicago.edu/doi/abs/10.1086/691462",
  },
  {
    id: "lyrics-reading",
    fact: "Music with lyrics tends to impair reading comprehension and verbal memory more than silence or instrumental music.",
    sourceLabel: "Souza et al. (2023) – Lyrics interfere with cognition",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10162369/",
  },
  {
    id: "go-nogo-fmri",
    fact: "Go/No-Go is a standard neuroscience task to measure response inhibition (executive control) and is widely used in fMRI studies.",
    sourceLabel: "Simmonds et al. (2007) – Go/No-Go fMRI meta-analysis",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2327217/",
  },
  {
    id: "dmn-mindwandering",
    fact: "Mind-wandering is linked to Default Mode Network (DMN) activity; sustained focus often shows different network dynamics.",
    sourceLabel: "Zhou et al. (2018) – DMN & mind-wandering",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6246840/",
  },
  {
    id: "sleep-deprivation-attention",
    fact: "Sleep deprivation reliably worsens sustained attention: slower responses, more lapses, and more errors.",
    sourceLabel: "Lim & Dinges (2008) – Sleep deprivation & vigilant attention",
    sourceUrl:
      "https://www.med.upenn.edu/uep/assets/user-content/documents/LimDinges2008VigilantAttention.pdf",
  },
  {
    id: "sleep-attn-failures",
    fact: "Recent work links attentional failures after sleep loss to specific brain-state dynamics (why “zoning out” can happen suddenly).",
    sourceLabel: "Yang et al. (2025) – Nature Neuroscience",
    sourceUrl: "https://www.nature.com/articles/s41593-025-02098-8",
  },
  {
    id: "pvt-lapses",
    fact: "Psychomotor Vigilance Task (PVT) “lapses” (very slow responses) are a classic marker of impaired sustained attention from sleepiness.",
    sourceLabel: "Anderson et al. (2010) – PVT lapses",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2817906/",
  },
  {
    id: "acute-exercise",
    fact: "A single session of moderate aerobic exercise can acutely improve attention/executive function shortly afterward.",
    sourceLabel: "Tsuk et al. (2019) – Acute exercise and attention",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6776756/",
  },
  {
    id: "exercise-meta",
    fact: "Meta-analytic evidence suggests acute exercise can boost executive function, but effects depend on task, intensity, and baseline state.",
    sourceLabel: "Ishihara et al. (2021) – Acute exercise meta-analysis",
    sourceUrl: "https://www.sciencedirect.com/science/article/pii/S0149763421002670",
  },
  {
    id: "caffeine-attention",
    fact: "Caffeine acutely enhances attention by improving reaction time and accuracy, but dose matters (too high can hurt accuracy).",
    sourceLabel: "Kløve et al. (2025) – Caffeine & attention meta-analysis",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/40335666/",
  },
  {
    id: "mindfulness-meta",
    fact: "Mindfulness interventions show small-to-moderate improvements in attention/executive control across RCT meta-analysis in healthy adults.",
    sourceLabel: "Yakobi et al. (2021) – Mindfulness & attention meta-analysis",
    sourceUrl: "https://link.springer.com/article/10.1007/s10608-020-10177-2",
  },
  {
    id: "pomodoro-study",
    fact: "Pomodoro-style systematic breaks vs self-regulated breaks have been studied in real-life study sessions.",
    sourceLabel: "Biwer et al. (2023) – Pomodoro vs self-regulated breaks",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/36859717/",
  },
  {
    id: "flowtime-pomodoro",
    fact: "Newer research compares Pomodoro/Flowtime/self-regulated breaks and how they relate to flow and task completion.",
    sourceLabel: "Smits et al. (2025) – Break styles study",
    sourceUrl: "https://www.mdpi.com/2076-328X/15/7/861",
  },
  {
    id: "attentional-blink",
    fact: "The attentional blink: if two targets appear within ~200–500 ms, people often miss the second—attention has temporal bottlenecks.",
    sourceLabel: "Raymond, Shapiro & Arnell (1992) – Attentional blink",
    sourceUrl:
      "https://psych.hanover.edu/classes/cognition/papers/raymond%20et%20al%201992%20attn%20blink.pdf",
  },
  {
    id: "spacing-effect",
    fact: "Spaced learning beats cramming: a major meta-analysis found robust benefits of distributed practice across hundreds of experiments.",
    sourceLabel: "Cepeda et al. (2006) – Distributed practice meta-analysis",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/16719566/",
  },
  {
    id: "testing-effect",
    fact: "Testing yourself (retrieval practice) improves long-term retention more than re-studying—test-enhanced learning.",
    sourceLabel: "Roediger & Karpicke (2006) – Testing effect",
    sourceUrl: "https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x",
  },
  {
    id: "arousal-inverted-u",
    fact: "Performance often follows an inverted-U with arousal: moderate arousal tends to optimize decision performance more than low/high arousal.",
    sourceLabel:
      "Nieuwenhuis et al. (2024) – Arousal & performance (Trends Cog Sci)",
    sourceUrl:
      "https://www.cell.com/trends/cognitive-sciences/fulltext/S1364-6613%2824%2900078-0",
  },
  {
    id: "reward-uncertainty",
    fact: "Reward uncertainty/variability can strongly drive behavior—one reason “infinite feeds” can feel sticky.",
    sourceLabel: "Clark et al. (2023) – Reward variability mechanisms",
    sourceUrl: "https://www.sciencedirect.com/science/article/pii/S0306460323000217",
  },
  {
    id: "dopamine-rpe",
    fact: "Dopamine systems encode prediction error signals—central to learning from surprise and reinforcement.",
    sourceLabel: "Bakhurin et al. (2025) – Dopamine & prediction error",
    sourceUrl: "https://www.nature.com/articles/s41467-025-64132-4",
  },
  {
    id: "attention-state-vs-performance",
    fact: "Self-reported attention and actual performance can diverge: you can feel ‘on-task’ but drift in subtle ways.",
    sourceLabel: "Godwin et al. (2023) – Off-task attention states",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/36709724/",
  },
  {
    id: "gng-design",
    fact: "Go/No-Go difficulty depends a lot on design (No-Go frequency, timing, cueing). Small tweaks change how ‘hard’ inhibition feels.",
    sourceLabel: "Simmonds et al. (2007) – Go/No-Go design + fMRI",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2327217/",
  },
  {
    id: "lyrics-effect-size",
    fact: "Controlled evidence shows lyrics can produce a reliable negative effect on reading/memory on average (not just “preference”).",
    sourceLabel: "Souza et al. (2023) – Lyrics effect sizes",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10162369/",
  },
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

  // Use idx as the "seed" for selecting the fact
  const [idx, setIdx] = useState(0);

  // Brain WebView HTML
  const [brainHtml, setBrainHtml] = useState<string | null>(null);

  const item = useMemo(() => FUN_FACTS[idx % FUN_FACTS.length], [idx]);
  const styles = makeStyles(theme);

  useEffect(() => {
    (async () => {
      try {
        const modelAsset = Asset.fromModule(require("../models/human_brain.glb"));
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

  const openSource = async () => {
    try {
      const ok = await Linking.canOpenURL(item.sourceUrl);
      if (ok) await Linking.openURL(item.sourceUrl);
    } catch {
      // ignore
    }
  };

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

        {/* Fun fact card */}
        <View style={styles.card}>
          <Text style={styles.p}>{item.fact}</Text>

          <View style={{ height: spacing.md }} />

          <Text style={styles.sourceLabel}>Source</Text>
          <Pressable onPress={openSource} hitSlop={10}>
            <Text style={styles.sourceLink}>{item.sourceLabel}</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.lg }} />

        <PrimaryButton
          title="New fact"
          onPress={() => setIdx((s) => (s + 1) % FUN_FACTS.length)}
          style={styles.primaryBtn}
          textStyle={styles.primaryBtnText}
        />

        <View style={{ height: spacing.xl }} />

        {/* Explore the brain */}
        <Text style={styles.sectionLabel}>Explore the brain</Text>
        <View style={{ height: spacing.sm }} />

        <View style={styles.brainCard}>
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

    p: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 24,
    },

    sourceLabel: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },

    sourceLink: {
      marginTop: 6,
      color: PALETTE.deep,
      fontWeight: "800",
      textDecorationLine: "underline",
      lineHeight: 20,
    },

    primaryBtn: {
      backgroundColor: "rgba(163, 193, 195, 0.45)",
    },

    primaryBtnText: {
      color: PALETTE.deep,
      fontWeight: "800",
    },

    sectionLabel: {
      color: theme.muted,
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

    brainFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });
