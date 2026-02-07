import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import StartScreen from "../screens/startscreen";
import HomeScreen from "../screens/homescreen";
import GameScreen from "../screens/gamescreen";
import GamesLandingScreen from "../screens/gameslandingscreen";
import GoNoGoDifficultyScreen from "../screens/gonogo_difficultyscreen";
import GoNoGoBlocksScreen from "../screens/gonogo_blocksscreen";
import FocusTimerScreen from "../screens/focustimerscreen";
import FunFactsScreen from "../screens/funfactscreen";
import ProfileScreen from "../screens/profilescreen";
import ResultsScreen from "../screens/resultsscreen";
import OnboardingScreen from "../screens/onboardingscreen";
import LoginScreen from "../screens/loginscreen";
import SignUpScreen from "../screens/signupscreen";

export type RootStackParamList = {
  Start: undefined;
  Home: undefined;
  Games: undefined;

  GoNoGoDifficulty: undefined;
  GoNoGoBlocks: { tier: 1 | 2 | 3 | 4 };
  GoNoGo: {
    level: 1 | 2 | 3 | 4;
    tier: 1 | 2 | 3 | 4;
    blockId: number;
  } | undefined;

  FocusTimer: undefined;
  FunFacts: undefined;
  Profile: undefined;

  Results:
    | {
        runId: string;
        tier?: 1 | 2 | 3 | 4;
        blockId?: number;
      }
    | undefined;

  Onboarding: undefined;
  Login: { fromWelcome?: boolean } | undefined;
  Signup: { fromWelcome?: boolean } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      id="root"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Start"
        component={StartScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen name="Games" component={GamesLandingScreen} />

      <Stack.Screen
        name="GoNoGoDifficulty"
        component={GoNoGoDifficultyScreen}
      />

      <Stack.Screen
        name="GoNoGoBlocks"
        component={GoNoGoBlocksScreen}
      />

      <Stack.Screen
        name="GoNoGo"
        component={GameScreen}
      />

      <Stack.Screen name="FocusTimer" component={FocusTimerScreen} />
      <Stack.Screen name="FunFacts" component={FunFactsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Signup"
        component={SignUpScreen}
      />
    </Stack.Navigator>
  );
}
