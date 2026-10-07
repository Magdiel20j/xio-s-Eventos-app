import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';

import AdminCalendarScreen from '../screens/AdminCalendarScreen';
import AdminCreateComboScreen from '../screens/AdminCreateComboScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel
      }}
    >
      <Tab.Screen
        name="Calendario"
        component={AdminCalendarScreen}
        options={{
          tabBarLabel: 'Calendario',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={22}
              color={focused ? Colors.primaryDark : color}
            />
          )
        }}
      />

      <Tab.Screen
        name="CrearCombo"
        component={AdminCreateComboScreen}
        options={{
          tabBarLabel: 'Crear Combo',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={24}
              color={focused ? Colors.primary : color}
            />
          )
        }}
      />

      <Tab.Screen
        name="AdminPedidos"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Supervisión',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={22}
              color={focused ? Colors.primaryDark : color}
            />
          )
        }}
      />

      <Tab.Screen
        name="AdminPerfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Admin Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
              size={22}
              color={focused ? Colors.primaryDark : color}
            />
          )
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E9D5FF',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2
  }
});

export default AdminTabNavigator;
