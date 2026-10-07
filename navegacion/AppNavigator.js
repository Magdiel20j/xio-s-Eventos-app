import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import VerificationCodeScreen from '../screens/VerificationCodeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import TabNavigator from './TabNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom'
        }}
      >
        {/* Splash Screen */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Flujo de Autenticación Dual & Códigos de Verificación */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Navegación para Clientes (Catálogo, Carrito, Pedidos, Perfil) */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />

        {/* Navegación Exclusiva para Administradores (Combos, Calendario, Pedidos) */}
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />

        {/* Pantallas de Detalle */}
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
