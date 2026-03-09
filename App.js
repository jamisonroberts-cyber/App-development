import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

import { AppProvider } from './src/context/AppContext';
import { colors, fonts } from './src/utils/theme';

import HomeScreen from './src/screens/HomeScreen';
import ApiaryScreen from './src/screens/ApiaryScreen';
import ApiaryDetailScreen from './src/screens/ApiaryDetailScreen';
import HiveDetailScreen from './src/screens/HiveDetailScreen';
import QuickInspectionScreen from './src/screens/QuickInspectionScreen';
import DetailedInspectionScreen from './src/screens/DetailedInspectionScreen';
import AddHarvestScreen from './src/screens/AddHarvestScreen';
import ForageScreen from './src/screens/ForageScreen';
import DataScreen from './src/screens/DataScreen';

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
  headerStyle: {
    backgroundColor: colors.surface,
    shadowColor: '#2C1810',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTintColor: colors.primary,
  headerTitleStyle: {
    fontWeight: '800',
    color: colors.text,
    fontSize: fonts.sizes.lg,
  },
  headerBackTitleVisible: false,
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: '🐝 Randolph Bees', headerLargeTitle: false }}
      />
    </Stack.Navigator>
  );
}

function ApiaryStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="ApiaryList" component={ApiaryScreen} options={{ title: 'Apiaries' }} />
      <Stack.Screen name="ApiaryDetail" component={ApiaryDetailScreen} options={({ route }) => ({ title: 'Apiary' })} />
      <Stack.Screen name="HiveDetail" component={HiveDetailScreen} options={({ route }) => ({ title: 'Hive Details' })} />
      <Stack.Screen name="QuickInspection" component={QuickInspectionScreen} options={{ title: 'Quick Check' }} />
      <Stack.Screen name="DetailedInspection" component={DetailedInspectionScreen} options={{ title: 'Full Inspection' }} />
      <Stack.Screen name="AddHarvest" component={AddHarvestScreen} options={{ title: 'Record Harvest' }} />
    </Stack.Navigator>
  );
}

function ForageStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="ForageMain" component={ForageScreen} options={{ title: 'Forage' }} />
    </Stack.Navigator>
  );
}

function DataStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="DataMain" component={DataScreen} options={{ title: 'Data & Trends' }} />
    </Stack.Navigator>
  );
}

function TabIcon({ name, focused, color, size }) {
  const iconMap = {
    Home: focused ? 'home' : 'home-outline',
    Apiary: focused ? 'layers' : 'layers-outline',
    Forage: focused ? 'leaf' : 'leaf-outline',
    Data: focused ? 'bar-chart' : 'bar-chart-outline',
  };
  return <Ionicons name={iconMap[name]} size={size} color={color} />;
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.tabActive,
            tabBarInactiveTintColor: colors.tabInactive,
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingBottom: 6,
              paddingTop: 4,
              height: 62,
            },
            tabBarLabelStyle: {
              fontSize: fonts.sizes.xs,
              fontWeight: '700',
            },
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon name={route.name} focused={focused} color={color} size={size} />
            ),
          })}
        >
          <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
          <Tab.Screen name="Apiary" component={ApiaryStack} options={{ tabBarLabel: 'Apiary' }} />
          <Tab.Screen name="Forage" component={ForageStack} options={{ tabBarLabel: 'Forage' }} />
          <Tab.Screen name="Data" component={DataStack} options={{ tabBarLabel: 'Data' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
