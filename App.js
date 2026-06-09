import 'react-native-gesture-handler';
import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
import { colors, fonts } from './src/utils/theme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ApiaryListScreen from './src/screens/ApiaryListScreen';
import AddApiaryScreen from './src/screens/AddApiaryScreen';
import ApiaryDetailScreen from './src/screens/ApiaryDetailScreen';
import AddHiveScreen from './src/screens/AddHiveScreen';
import HiveDetailScreen from './src/screens/HiveDetailScreen';
import AddInspectionScreen from './src/screens/AddInspectionScreen';
import AddHarvestScreen from './src/screens/AddHarvestScreen';
import HiveInventoryScreen from './src/screens/HiveInventoryScreen';
import FloraScreen from './src/screens/FloraScreen';
import DataScreen from './src/screens/DataScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AddInventoryItemScreen from './src/screens/AddInventoryItemScreen';
import FinancialScreen from './src/screens/FinancialScreen';
import AddFinancialRecordScreen from './src/screens/AddFinancialRecordScreen';
import TasksScreen from './src/screens/TasksScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600', fontSize: fonts.sizes.lg },
  headerBackTitleVisible: false,
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'BeeKeeper' }} />
    </Stack.Navigator>
  );
}

function ApiaryStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="ApiaryList" component={ApiaryListScreen} options={{ title: 'My Apiaries' }} />
      <Stack.Screen name="AddApiary" component={AddApiaryScreen} options={{ title: 'Add Apiary' }} />
      <Stack.Screen name="EditApiary" component={AddApiaryScreen} options={{ title: 'Edit Apiary' }} />
      <Stack.Screen name="ApiaryDetail" component={ApiaryDetailScreen} />
      <Stack.Screen name="AddHive" component={AddHiveScreen} options={{ title: 'Add Hive' }} />
      <Stack.Screen name="EditHive" component={AddHiveScreen} options={{ title: 'Edit Hive' }} />
      <Stack.Screen name="HiveDetail" component={HiveDetailScreen} options={{ title: 'Hive Detail' }} />
      <Stack.Screen name="AddInspection" component={AddInspectionScreen} options={{ title: 'New Inspection' }} />
      <Stack.Screen name="AddHarvest" component={AddHarvestScreen} options={{ title: 'Record Harvest' }} />
      <Stack.Screen name="HiveInventory" component={HiveInventoryScreen} options={{ title: 'Hive Inventory' }} />
    </Stack.Navigator>
  );
}

function FloraStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="FloraMain" component={FloraScreen} options={{ title: 'Flora Calendar' }} />
    </Stack.Navigator>
  );
}

function DataStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="DataMain" component={DataScreen} options={{ title: 'Analytics' }} />
    </Stack.Navigator>
  );
}

function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="InventoryMain" component={InventoryScreen} options={{ title: 'Inventory' }} />
      <Stack.Screen name="AddInventoryItem" component={AddInventoryItemScreen} options={{ title: 'Add Item' }} />
      <Stack.Screen name="EditInventoryItem" component={AddInventoryItemScreen} options={{ title: 'Edit Item' }} />
      <Stack.Screen name="Financial" component={FinancialScreen} options={{ title: 'Finances' }} />
      <Stack.Screen name="AddFinancialRecord" component={AddFinancialRecordScreen} options={{ title: 'Add Record' }} />
    </Stack.Navigator>
  );
}

const tasksStackOptions = {
  headerStyle: { backgroundColor: '#4A7C3F' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600', fontSize: fonts.sizes.lg },
  headerBackTitleVisible: false,
};

function TasksStack() {
  return (
    <Stack.Navigator screenOptions={tasksStackOptions}>
      <Stack.Screen name="TasksMain" component={TasksScreen} options={{ title: 'Homestead Tasks' }} />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={({ route }) => ({ title: route.params?.task ? 'Edit Task' : 'New Task' })}
      />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Home: { inactive: 'sunny-outline', active: 'sunny' },
  Apiary: { inactive: 'grid-outline', active: 'grid' },
  Flora: { inactive: 'leaf-outline', active: 'leaf' },
  Data: { inactive: 'bar-chart-outline', active: 'bar-chart' },
  Inventory: { inactive: 'cube-outline', active: 'cube' },
  Tasks: { inactive: 'checkmark-circle-outline', active: 'checkmark-circle' },
};

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        {Platform.OS !== 'web' && <StatusBar style="light" />}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textLight,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingBottom: 4,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
              marginBottom: 2,
            },
            tabBarIcon: ({ focused, color, size }) => {
              const icons = TAB_ICONS[route.name];
              const iconName = focused ? icons.active : icons.inactive;
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="Apiary" component={ApiaryStack} />
          <Tab.Screen name="Flora" component={FloraStack} />
          <Tab.Screen name="Data" component={DataStack} />
          <Tab.Screen name="Inventory" component={InventoryStack} />
          <Tab.Screen
            name="Tasks"
            component={TasksStack}
            options={{
              tabBarActiveTintColor: '#4A7C3F',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
