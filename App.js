import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
import { colors } from './src/utils/theme';

import DashboardScreen from './src/screens/DashboardScreen';
import HivesScreen from './src/screens/HivesScreen';
import AddHiveScreen from './src/screens/AddHiveScreen';
import HiveDetailScreen from './src/screens/HiveDetailScreen';
import InspectionsScreen from './src/screens/InspectionsScreen';
import AddInspectionScreen from './src/screens/AddInspectionScreen';
import HarvestsScreen from './src/screens/HarvestsScreen';
import AddHarvestScreen from './src/screens/AddHarvestScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const navTheme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

const stackOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '700', color: colors.text },
};

function HivesStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="HivesList" component={HivesScreen} options={{ title: 'My Hives' }} />
      <Stack.Screen name="AddHive" component={AddHiveScreen} options={{ title: 'Add Hive' }} />
      <Stack.Screen name="EditHive" component={AddHiveScreen} options={{ title: 'Edit Hive' }} />
      <Stack.Screen name="HiveDetail" component={HiveDetailScreen} options={{ title: 'Hive Detail' }} />
      <Stack.Screen name="AddInspection" component={AddInspectionScreen} options={{ title: 'New Inspection' }} />
      <Stack.Screen name="AddHarvest" component={AddHarvestScreen} options={{ title: 'Record Harvest' }} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: '🐝 BeeKeeper' }} />
      <Stack.Screen name="AddHive" component={AddHiveScreen} options={{ title: 'Add Hive' }} />
    </Stack.Navigator>
  );
}

function InspectionsStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="InspectionsList" component={InspectionsScreen} options={{ title: 'Inspections' }} />
    </Stack.Navigator>
  );
}

function HarvestsStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="HarvestsList" component={HarvestsScreen} options={{ title: 'Harvests' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textLight,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: 4,
              height: 60,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            tabBarIcon: ({ focused, color, size }) => {
              const icons = {
                Dashboard: focused ? 'home' : 'home-outline',
                Hives: focused ? 'layers' : 'layers-outline',
                Inspections: focused ? 'clipboard' : 'clipboard-outline',
                Harvests: focused ? 'water' : 'water-outline',
              };
              return <Ionicons name={icons[route.name]} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardStack} />
          <Tab.Screen name="Hives" component={HivesStack} />
          <Tab.Screen name="Inspections" component={InspectionsStack} />
          <Tab.Screen name="Harvests" component={HarvestsStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
