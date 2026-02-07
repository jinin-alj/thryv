import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";

type Props = {
  navigation: any;
};

type SkillSection = {
  title: string;
  subtitle?: string;
  cards: Array<{
    title: string;
    image?: any;
    onPress?: () => void;
    comingSoon?: boolean;
  }>;
};

export default function GamesLandingScreen({ navigation }: Props) {
  const { theme } = useAppTheme();

  const sections: SkillSection[] = [
    {
      title: "Focus",
      subtitle: "Train sustained attention and impulse control",
      cards: [
        {
          title: "Go/No-Go",
          image: require("../assets/gonogo_cover.png"),
          onPress: () => {
            // This should navigate to the existing Go/No-Go start screen/flow.
            // If your route name differs, we’ll adjust it when we edit navigation.tsx.
            navigation.navigate("GoNoGo");
          },
        },
      ],
    },
    {
      title: "Memory",
      subtitle: "Train working and short-term memory",
      cards: [
        {
          title: "Coming soon",
          comingSoon: true,
        },
      ],
    },
    {
      title: "Speed",
      subtitle: "Train processing speed and reaction time",
      cards: [
        {
          title: "Coming soon",
          comingSoon: true,
        },
      ],
    },
    {
      title: "Flexibility",
      subtitle: "Train cognitive flexibility and task-switching",
      cards: [
        {
          title: "Coming soon",
          comingSoon: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: theme.background ?? "#FFFFFF" },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text ?? "#111" }]}>
          Games
        </Text>
        <Text style={[styles.subtitle, { color: theme.mutedText ?? "#666" }]}>
          Choose a skill to train
        </Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.text ?? "#111" }]}
              >
                {section.title}
              </Text>
              {!!section.subtitle && (
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.mutedText ?? "#666" },
                  ]}
                >
                  {section.subtitle}
                </Text>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {section.cards.map((card, idx) => {
                const disabled = !!card.comingSoon || !card.onPress;

                return (
                  <Pressable
                    key={`${section.title}-${idx}`}
                    onPress={card.onPress}
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.card,
                      {
                        backgroundColor: theme.card ?? "#F5F6F7",
                        borderColor: theme.border ?? "rgba(0,0,0,0.08)",
                        opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
                      },
                    ]}
                  >
                    {card.image ? (
                      <Image
                        source={card.image}
                        style={styles.cover}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.coverPlaceholder,
                          {
                            backgroundColor:
                              theme.background ?? "rgba(0,0,0,0.06)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.placeholderText,
                            { color: theme.mutedText ?? "#666" },
                          ]}
                        >
                          Placeholder
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <Text
                        numberOfLines={1}
                        style={[styles.cardTitle, { color: theme.text ?? "#111" }]}
                      >
                        {card.title}
                      </Text>

                      {card.comingSoon ? (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: theme.primary ?? "#347679" },
                          ]}
                        >
                          <Text style={styles.badgeText}>Coming soon</Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.tapHint,
                            { color: theme.mutedText ?? "#666" },
                          ]}
                        >
                          Tap to play
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: spacing.lg ?? 20,
    paddingTop: spacing.lg ?? 20,
    paddingBottom: spacing.xl ?? 28,
    gap: spacing.xl ?? 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
  },
  section: {
    gap: spacing.md ?? 12,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  row: {
    paddingRight: spacing.lg ?? 20,
    gap: spacing.md ?? 12,
  },
  card: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cover: {
    width: "100%",
    height: 120,
  },
  coverPlaceholder: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 12,
  },
  cardFooter: {
    padding: spacing.md ?? 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  tapHint: {
    fontSize: 12,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
