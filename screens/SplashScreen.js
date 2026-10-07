import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import Colors from '../constants/colors';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const SplashScreen = ({ navigation }) => {
  const { user, isLoggedIn, loading } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animación de entrada suave y vibrante
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();

    // Esperar a que la carga termine y luego redirigir según el rol
    const timer = setTimeout(() => {
      if (!loading) {
        if (isLoggedIn) {
          if (user?.role === 'admin') {
            navigation.replace('AdminTabs');
          } else {
            navigation.replace('MainTabs');
          }
        } else {
          navigation.replace('Login');
        }
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [loading, isLoggedIn, user, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.brandTitle}>Xio's Eventos</Text>
        <Text style={styles.slogan}>¡DIVERSIÓN Y COLOR PARA TODOS!</Text>

        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: Colors.accent }]} />
          <View style={[styles.dot, { backgroundColor: Colors.gold }]} />
          <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
        </View>
      </Animated.View>

      <Text style={styles.footerText}>Tienda Oficial Móvil</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    padding: 4,
    backgroundColor: Colors.gold,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 26
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 88
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowColor: Colors.secondary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10
  },
  slogan: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 28
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 5
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1
  }
});

export default SplashScreen;
