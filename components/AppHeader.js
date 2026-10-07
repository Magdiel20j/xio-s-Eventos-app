import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import { CartContext } from '../context/CartContext';
import { contactWhatsApp, BUSINESS_INFO } from '../constants/business';

export const AppHeader = ({
  title = "Xio's Eventos",
  showBack = false,
  showCart = true,
  showWhatsApp = true
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { totalItems } = useContext(CartContext);

  const handleWhatsAppHeader = () => {
    contactWhatsApp({
      customMessage: '¡Hola! Vi la app de Xio\'s Eventos y deseo información sobre sus paquetes y disponibilidad.'
    });
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 14 : 10),
          paddingBottom: 12
        }
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Volver"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            El Salvador • Tel: {BUSINESS_INFO.phone}
          </Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        {showWhatsApp && (
          <TouchableOpacity
            style={styles.waBtn}
            onPress={handleWhatsAppHeader}
            activeOpacity={0.8}
            accessibilityLabel="Contactar por WhatsApp"
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Carrito' })}
            activeOpacity={0.8}
            accessibilityLabel="Ver carrito de compras"
          >
            <Ionicons name="cart" size={20} color="#FFFFFF" />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginRight: 10
  },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.gold,
    overflow: 'hidden'
  },
  logo: {
    width: 38,
    height: 38
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  subtitle: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  waBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.whatsapp,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  cartBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 19,
    height: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 3
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900'
  }
});

export default AppHeader;
