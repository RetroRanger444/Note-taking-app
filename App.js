import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Feather } from '@expo/vector-icons';

import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

import NotesScreen from './src/screens/NotesScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AppearanceScreen from './src/screens/AppearanceScreen';
import DeveloperOptionsScreen from './src/screens/DeveloperOptionsScreen';
import ImportExportScreen from './src/screens/ImportExportScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create a placeholder component for missing screens
const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{route.name} Screen</Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#111',
          borderTopColor: '#333',
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#aaa',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'NotesTab') {
            iconName = 'document-text-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Tasks') {
            iconName = 'check-square';
            return <Feather name={iconName} size={size} color={color} />;
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
            return <Feather name={iconName} size={size} color={color} />;
          } else if (route.name === 'SettingsTab') {
            iconName = 'settings';
            return <Feather name={iconName} size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen 
        name="NotesTab" 
        component={NotesScreen} 
        options={{ tabBarLabel: 'Notes' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: 'Inter_700Bold' },
          headerTitleAlign: 'center',
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} />
        <Stack.Screen name="Developer Options" component={DeveloperOptionsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ImportExport" component={ImportExportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
  },
});