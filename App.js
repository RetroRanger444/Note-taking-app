import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import { ThemeProvider } from './src/theme/ThemeContext';
import MainTabs from './src/navigation/MainTabs';

// Import screens
import ImportExportScreen from './src/screens/ImportExportScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ThemeScreen from './src/screens/ThemeScreen';
import DisplayScreen from './src/screens/DisplayScreen';
import FontSizeScreen from './src/screens/FontSizeScreen';
import StorageScreen from './src/screens/StorageScreen';
import PerformanceScreen from './src/screens/PerformanceScreen';
import LanguageScreen from './src/screens/LanguageScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Theme" component={ThemeScreen} />
        <Stack.Screen name="FontSize" component={FontSizeScreen} />
        <Stack.Screen name="Display" component={DisplayScreen} />
        <Stack.Screen name="ImportExport" component={ImportExportScreen} />
        <Stack.Screen name="Storage" component={StorageScreen} />
        <Stack.Screen name="Performance" component={PerformanceScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
    PressStart2P_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
