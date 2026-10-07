import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import { ProductContext } from '../context/ProductContext';
import AppHeader from '../components/AppHeader';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['Todos', 'Combos', 'Animación', 'Pintacaritas', 'Glitter Bar', 'Juegos'];

export const CatalogScreen = ({ navigation, route }) => {
  const { products, loading, loadProducts } = useContext(ProductContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);

  // Si viene una categoría por parámetros de navegación (ej. desde el Home)
  useEffect(() => {
    if (route.params?.filterCategory) {
      setSelectedCategory(route.params.filterCategory);
    }
  }, [route.params?.filterCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'Todos' || product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <AppHeader title="Catálogo de Servicios" />

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={19} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar shows, glitter, pintacaritas..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} accessibilityLabel="Borrar búsqueda">
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chips de Categorías */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Lista de Productos del Catálogo */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Cargando servicios infantiles...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary, Colors.secondary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="search-outline"
              title="Sin Resultados"
              message="No encontramos servicios que coincidan con tu búsqueda o categoría seleccionada."
              actionText="Ver Todos los Servicios"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary
  },
  clearBtn: {
    padding: 4
  },
  categoriesContainer: {
    paddingVertical: 8
  },
  categoriesList: {
    paddingHorizontal: 16
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary
  },
  categoryChipTextSelected: {
    color: '#FFFFFF'
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 30
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600'
  }
});

export default CatalogScreen;
