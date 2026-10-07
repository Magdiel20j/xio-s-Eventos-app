import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import Colors from './constants/colors';
import AppNavigator from './navegacion/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.primaryDark} />
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
