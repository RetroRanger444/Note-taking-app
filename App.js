import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

// custom components and helpers
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import MainTabs from './src/navigation/MainTabs';
import ThemeScreen from './src/screens/ThemeScreen';
import DisplayScreen from './src/screens/DisplayScreen';
import TrashScreen from './src/screens/TrashScreen';
import LockScreen from './src/screens/LockScreen';

// prevent auto-hide -> manual control after fonts load
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
// key for persistent biometric lock preference
const BIOMETRIC_LOCK_ENABLED_KEY = 'is_biometric_lock_enabled';

function AppNavigation() {
  const { theme } = useTheme();

  // FIX: prevent white flash on navigation transitions
  // override default navigation background with theme background
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          // hide default header -> using custom Header component
          headerShown: false,
          // FIX: fade animation prevents Android flicker
          cardStyleInterpolator: CardStyleInterpolators.forFade,
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Theme" component={ThemeScreen} />
        <Stack.Screen name="Display" component={DisplayScreen} />
        <Stack.Screen name="Trash" component={TrashScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// root component wrapper -> provides theme context to entire app
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const [isLocked, setIsLocked] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
    'PressStart-Regular': PressStart2P_400Regular,
  });

  // check biometric lock preference on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isEnabled = await AsyncStorage.getItem(BIOMETRIC_LOCK_ENABLED_KEY);
        // default to locked if preference not found
        setIsLocked(isEnabled === 'true');
      } catch (e) {
        // FIX: fallback to unlocked if storage fails
        setIsLocked(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  // hide splash screen after fonts load
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // prevent render until fonts load and auth check completes
  if (!fontsLoaded || isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // FIX: apply theme background to root view -> prevents white flash
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} onLayout={onLayoutRootView}>
      {isLocked ? (
        <LockScreen onUnlock={() => setIsLocked(false)} />
      ) : (
        <AppNavigation />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // dark theme default -> prevents white flash during font loading
    backgroundColor: '#1C1C1E',
  },
});