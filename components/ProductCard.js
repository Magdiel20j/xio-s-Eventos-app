import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import StockBadge from './StockBadge';
import RatingStars from './RatingStars';
import CustomButton from './CustomButton';
import { CartContext } from '../context/CartContext';
import { formatUSD } from '../constants/business';

export const ProductCard = ({ product, onPress }) => {
  const { addToCart } = useContext(CartContext);
  const isOutOfStock = product.stock <= 0;

  const handleAdd = (e) => {
    e.stopPropagation?.();
    addToCart(product, 1);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
        <View style={styles.stockPosition}>
          <StockBadge stock={product.stock} />
        </View>

        {product.cortesia && (
          <View style={styles.cortesiaOverlay}>
            <Ionicons name="gift-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.cortesiaOverlayText}>Globoflexia de Cortesía</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingRow}>
          <RatingStars rating={product.rating} size={14} />
          <Text style={styles.reviewsCount}>
            ({product.reviews?.length || 0} reseñas)
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Desde (San Salvador)</Text>
            <Text style={styles.price}>{formatUSD(product.price)}</Text>
          </View>

          <CustomButton
            title={isOutOfStock ? 'Agotado' : 'Reservar'}
            variant={isOutOfStock ? 'disabled' : 'primary'}
            disabled={isOutOfStock}
            onPress={handleAdd}
            style={styles.addBtn}
            textStyle={styles.addBtnText}
            icon={!isOutOfStock ? <Ionicons name="cart-outline" size={15} color="#FFFFFF" /> : null}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden'
  },
  imageContainer: {
    height: 175,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F1F3F5'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(94, 23, 235, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  stockPosition: {
    position: 'absolute',
    top: 12,
    right: 12
  },
  cortesiaOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  cortesiaOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  details: {
    padding: 16
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  reviewsCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark
  },
  addBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800'
  }
});

export default ProductCard;
