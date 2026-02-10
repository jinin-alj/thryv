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
import CategoryScreen from "../screens/categoryscreen";
import NBackDifficultyScreen from "../screens/nback_difficultyscreen";
import NBackBlocksScreen from "../screens/nback_blocksscreen";
import NBackGameScreen from "../screens/nback_gamescreen";
import VSDifficultyScreen from "../screens/vs_difficultyscreen";
import VSBlocksScreen from "../screens/vs_blocksscreen";
import VSGameScreen from "../screens/vs_gamescreen";
import PrepTimePickerScreen from "../screens/preptimepicker_screen";
import BrainPrepScreen from "../screens/brainprep_screen";
import SessionCategoryScreen from "../screens/sessioncategory_screen";
import FocusCountdownScreen from "../screens/focuscountdown_screen";
import SessionBreakScreen from "../screens/sessionbreak_screen";
import SessionSummaryScreen from "../screens/sessionsummary_screen";

// ✅ NEW Study Rooms screens
import StudyRoomsScreen from "../screens/studyroomsscreen";
import StudyRoomSessionScreen from "../screens/studyroomsessionscreen";

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

  Category: { region: string };
  NBackDifficulty: undefined;
  NBackBlocks: { tier: 1 | 2 | 3 | 4 };
  NBackGame: { level: 1 | 2 | 3 | 4; tier: 1 | 2 | 3 | 4; blockId: number } | undefined;
  VisualSearchDifficulty: undefined;
  VisualSearchBlocks: { tier: 1 | 2 | 3 | 4 };
  VisualSearchGame: { level: 1 | 2 | 3 | 4; tier: 1 | 2 | 3 | 4; blockId: number } | undefined;
  PrepTimePicker: any;
  BrainPrep: any;
  SessionCategory: any;
  FocusCountdown: any;
  SessionBreak: any;
  SessionSummary: any;
  FocusTimer: undefined;
  FunFacts: undefined;
  Profile: undefined;

  // ✅ NEW routes
  StudyRooms: undefined;
  StudyRoom: { roomId: string };

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

      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen name="Games" component={GamesLandingScreen} />

      <Stack.Screen name="GoNoGoDifficulty" component={GoNoGoDifficultyScreen} />

      <Stack.Screen name="GoNoGoBlocks" component={GoNoGoBlocksScreen} />

      <Stack.Screen name="GoNoGo" component={GameScreen} />

      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="NBackDifficulty" component={NBackDifficultyScreen} />
      <Stack.Screen name="NBackBlocks" component={NBackBlocksScreen} />
      <Stack.Screen name="NBackGame" component={NBackGameScreen} />
      <Stack.Screen name="VisualSearchDifficulty" component={VSDifficultyScreen} />
      <Stack.Screen name="VisualSearchBlocks" component={VSBlocksScreen} />
      <Stack.Screen name="VisualSearchGame" component={VSGameScreen} />
      <Stack.Screen name="PrepTimePicker" component={PrepTimePickerScreen} />
      <Stack.Screen name="BrainPrep" component={BrainPrepScreen} />
      <Stack.Screen name="SessionCategory" component={SessionCategoryScreen} />
      <Stack.Screen name="FocusCountdown" component={FocusCountdownScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="SessionBreak" component={SessionBreakScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="FocusTimer" component={FocusTimerScreen} />
      <Stack.Screen name="FunFacts" component={FunFactsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />

      {/* ✅ NEW Study Rooms */}
      <Stack.Screen name="StudyRooms" component={StudyRoomsScreen} />
      <Stack.Screen name="StudyRoom" component={StudyRoomSessionScreen} />

      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen name="Signup" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
