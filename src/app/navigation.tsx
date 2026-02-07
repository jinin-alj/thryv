import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import StartScreen from "../screens/startscreen";
import HomeScreen from "../screens/homescreen";
import GameScreen from "../screens/gamescreen";
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
  FocusTimer: undefined;
  FunFacts: undefined;
  Profile: undefined;
  Results: { runId: string };
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Games" component={GameScreen} />
      <Stack.Screen name="FocusTimer" component={FocusTimerScreen} />
      <Stack.Screen name="FunFacts" component={FunFactsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
