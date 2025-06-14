import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_400Regular_Italic,
} from '@expo-google-fonts/montserrat';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import MainTabs from './src/navigation/MainTabs';

// Import all screens
import ThemeScreen from './src/screens/ThemeScreen';
import DisplayScreen from './src/screens/DisplayScreen';
import FontSizeScreen from './src/screens/FontSizeScreen';
import StorageScreen from './src/screens/StorageScreen';
import PerformanceScreen from './src/screens/PerformanceScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import ImportExportScreen from './src/screens/ImportExportScreen';
import TrashScreen from './src/screens/TrashScreen';
import LockScreen from './src/screens/LockScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';

function AppNavigator() {
  const { theme } = useTheme();

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
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Theme" component={ThemeScreen} />
        <Stack.Screen name="FontSize" component={FontSizeScreen} />
        <Stack.Screen name="Display" component={DisplayScreen} />
        <Stack.Screen name="Storage" component={StorageScreen} />
        <Stack.Screen name="Performance" component={PerformanceScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="ImportExport" component={ImportExportScreen} />
        <Stack.Screen
          name="TrashScreen"
          component={TrashScreen}
          options={{
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppRoot() {
  const [isLocked, setIsLocked] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthSetting = async () => {
      try {
        const isBiometricEnabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        
        if (isBiometricEnabled === 'true') {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthSetting();
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return <AppNavigator />;
}

export default function App() {
  
  const [fontsLoaded, fontsError] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-Italic': Montserrat_400Regular_Italic,
  });

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
        
        // Wait for fonts to load
        if (fontsLoaded || fontsError) {
          setAppIsReady(true);
        }
      } 
    prepare();
  }, [fontsLoaded, fontsError]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
        await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <StatusBar barStyle="light-content" />
        <AppRoot />
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});