import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { ProductContext } from '../context/ProductContext';
import AppHeader from '../components/AppHeader';
import ProductCard from '../components/ProductCard';
import { contactWhatsApp, BUSINESS_INFO } from '../constants/business';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { products } = useContext(ProductContext);

  // REGLA ESTRICTA: Debe decir "Bienvenido" seguido ÚNICAMENTE del nombre real del usuario logueado
  const getUserRealName = () => {
    if (!user || !user.name) return 'Invitado Especial';
    return user.name.trim();
  };

  const categories = [
    { id: '1', name: 'Combos', iconName: 'gift-outline', color: Colors.primary },
    { id: '2', name: 'Animación', iconName: 'happy-outline', color: Colors.primaryDark },
    { id: '3', name: 'Pintacaritas', iconName: 'brush-outline', color: Colors.secondary },
    { id: '4', name: 'Glitter Bar', iconName: 'sparkles-outline', color: Colors.accent },
    { id: '5', name: 'Juegos', iconName: 'game-controller-outline', color: Colors.gold }
  ];

  const featuredProducts = products.slice(0, 3);

  return (
    <View style={styles.container}>
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner de Saludo Personalizado */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeSubtitle}>¡Hola, qué alegría verte!</Text>
            {/* SALUDO OBLIGATORIO: Únicamente el nombre real */}
            <Text style={styles.welcomeTitle}>
              Bienvenido, {getUserRealName()}
            </Text>
            <Text style={styles.bannerTagline}>
              Servicios profesionales para fiestas infantiles en El Salvador
            </Text>
          </View>
          <View style={styles.magicIconBox}>
            <Ionicons name="sparkles" size={26} color={Colors.gold} />
          </View>
        </View>

        {/* Tarjeta de Promoción Destacada: Combos + Globoflexia de Cortesía */}
        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <View style={styles.promoBadge}>
              <Ionicons name="gift-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.promoBadgeText}>CORTESÍA ESPECIAL</Text>
            </View>
            <Text style={styles.promoTitle}>Globoflexia de Cortesía en tus Paquetes</Text>
            <Text style={styles.promoText}>
              Nuestros combos incluyen Animación, Pintacaritas y Juegos con figuras en globos de cortesía para todos los niños. Precios especiales para San Salvador y todo el país.
            </Text>
            <TouchableOpacity
              style={styles.promoBtn}
              onPress={() => navigation.navigate('Catalogo', { filterCategory: 'Combos' })}
              activeOpacity={0.85}
            >
              <Text style={styles.promoBtnText}>Ver Paquetes y Combos</Text>
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categorías Rápidas de Servicios */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nuestras Especialidades</Text>
          <Text style={styles.sectionSubtitle}>Diversión garantizada para peques</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, { borderColor: Colors.border }]}
              onPress={() => navigation.navigate('Catalogo', { filterCategory: cat.name })}
              activeOpacity={0.8}
            >
              <View style={[styles.categoryIconBg, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.iconName} size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Servicios Destacados */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Servicios Populares</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalogo')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>Los más solicitados por mamás y papás</Text>
        </View>

        <View style={styles.productsList}>
          {featuredProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            />
          ))}
        </View>

        {/* Resumen de Garantías Xio's Eventos */}
        <View style={styles.guaranteeBox}>
          <Text style={styles.guaranteeTitle}>¿Por qué elegir Xio's Eventos?</Text>
          
          <View style={styles.guaranteeItem}>
            <View style={styles.guaranteeIconCircle}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.guaranteeText}>Pinturas y glitter 100% hipoalergénicos grado cosmético.</Text>
          </View>

          <View style={styles.guaranteeItem}>
            <View style={styles.guaranteeIconCircle}>
              <Ionicons name="time" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.guaranteeText}>Puntualidad impecable y animadores profesionales capacitados.</Text>
          </View>

          <View style={styles.guaranteeItem}>
            <View style={styles.guaranteeIconCircle}>
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.guaranteeText}>Materiales limpios, desinfectados y de alta calidad.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30
  },
  welcomeBanner: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  welcomeInfo: {
    flex: 1,
    paddingRight: 10
  },
  welcomeSubtitle: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4
  },
  bannerTagline: {
    color: '#EDE9FE',
    fontSize: 12,
    lineHeight: 16
  },
  magicIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold
  },
  promoCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  promoContent: {
    zIndex: 2
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6
  },
  promoText: {
    color: '#FFFFFF',
    opacity: 0.95,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14
  },
  promoBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14
  },
  promoBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.textPrimary
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13
  },
  categoriesRow: {
    paddingVertical: 6,
    paddingRight: 10,
    marginBottom: 20
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    width: 90,
    borderWidth: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  categoryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center'
  },
  productsList: {
    marginBottom: 14
  },
  guaranteeBox: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border
  },
  guaranteeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: 12
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  guaranteeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  guaranteeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16
  }
});

export default HomeScreen;
