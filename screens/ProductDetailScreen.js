import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';
import AppHeader from '../components/AppHeader';
import StockBadge from '../components/StockBadge';
import RatingStars from '../components/RatingStars';
import CustomButton from '../components/CustomButton';
import ReviewModal from '../components/ReviewModal';
import { formatUSD, contactWhatsApp, BUSINESS_INFO } from '../constants/business';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { product: initialProduct } = route.params;
  const { user } = useContext(AuthContext);
  const { products, hasUserPurchasedProduct, addReview } = useContext(ProductContext);
  const { addToCart } = useContext(CartContext);

  // Mantener producto sincronizado con el contexto global
  const product = products.find((p) => p.id === initialProduct.id) || initialProduct;

  const [quantity, setQuantity] = useState(1);
  const [selectedZone, setSelectedZone] = useState('san_salvador');
  const [modalVisible, setModalVisible] = useState(false);

  const isOutOfStock = product.stock <= 0;
  // REGLA ESTRICTA: Un usuario solo puede valorar o comentar un producto si ya lo ha comprado
  const canReview = hasUserPurchasedProduct(product.id);

  // Cálculo de precio dinámico según zona en El Salvador
  const currentUnitPrice = selectedZone === 'otros_deptos'
    ? (product.priceOtherZones || product.price + 15)
    : (product.priceSanSalvador || product.price);

  const totalPrice = currentUnitPrice * quantity;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else {
      Alert.alert('Inventario Máximo', `Solo hay ${product.stock} unidades disponibles de este servicio.`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    const zoneLabel = selectedZone === 'otros_deptos'
      ? 'Otros Departamentos (Fuera de S.S.)'
      : 'San Salvador (Área Metropolitana)';

    const productWithZone = {
      ...product,
      price: currentUnitPrice,
      selectedZone: zoneLabel,
      displayName: `${product.name} - ${zoneLabel}`
    };

    const success = addToCart(productWithZone, quantity);
    if (success) {
      Alert.alert(
        '¡Agregado al Carrito!',
        `Se han añadido ${quantity} reservación(es) para ${zoneLabel} por un total de ${formatUSD(totalPrice)}.`,
        [
          { text: 'Seguir viendo', style: 'cancel' },
          {
            text: 'Ir al Carrito',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Carrito' })
          }
        ]
      );
    }
  };

  const handleWhatsAppInquiry = () => {
    const zoneLabel = selectedZone === 'otros_deptos'
      ? 'Otros Departamentos / Fuera de San Salvador'
      : 'San Salvador (Área Metropolitana)';

    contactWhatsApp({
      comboName: product.name,
      zoneName: zoneLabel,
      price: totalPrice,
      customMessage: `Hola, me interesa reservar el paquete "${product.name}" para la zona de ${zoneLabel}. ¿Tienen disponibilidad y qué información necesitan?`
    });
  };

  const handleReviewSubmit = async (reviewData) => {
    const res = await addReview(product.id, {
      userId: user.id,
      userName: user.name,
      rating: reviewData.rating,
      comment: reviewData.comment
    });

    if (res.success) {
      Alert.alert('¡Muchas gracias!', 'Tu reseña ha sido publicada con éxito.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Detalle del Paquete" showBack={true} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Imagen Principal */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          <View style={styles.badgeOverlay}>
            <StockBadge stock={product.stock} />
          </View>
        </View>

        {/* Información del Servicio */}
        <View style={styles.contentCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{product.category}</Text>
            <View style={styles.ratingBox}>
              <RatingStars rating={product.rating} size={16} />
              <Text style={styles.reviewsCountText}>({product.reviews?.length || 0} opiniones)</Text>
            </View>
          </View>

          <Text style={styles.title}>{product.name}</Text>
          {product.subtitle && (
            <Text style={styles.subtitleTag}>{product.subtitle}</Text>
          )}

          {/* Banner de Globoflexia de Cortesía */}
          {product.cortesia && (
            <View style={styles.cortesiaBanner}>
              <View style={styles.cortesiaIconWrap}>
                <Ionicons name="gift-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.cortesiaTextWrapper}>
                <Text style={styles.cortesiaBannerTitle}>CORTESÍA ESPECIAL DE XIO'S EVENTOS</Text>
                <Text style={styles.cortesiaBannerDesc}>
                  Este paquete incluye <Text style={{ fontWeight: '800', color: Colors.primary }}>Globoflexia GRATIS</Text> con figuras divertidas en globos para todos los niños invitados.
                </Text>
              </View>
            </View>
          )}

          {/* SELECTOR DE ZONA EN EL SALVADOR */}
          <View style={styles.zoneSection}>
            <View style={styles.zoneHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={17} color={Colors.primaryDark} style={{ marginRight: 6 }} />
                <Text style={styles.sectionHeading}>Selecciona tu Zona:</Text>
              </View>
              <Text style={styles.zoneNotice}>Tarifa según cobertura</Text>
            </View>

            <View style={styles.zoneCardsRow}>
              <TouchableOpacity
                style={[
                  styles.zoneCard,
                  selectedZone === 'san_salvador' && styles.zoneCardActive
                ]}
                onPress={() => setSelectedZone('san_salvador')}
                activeOpacity={0.8}
              >
                <View style={styles.zoneCardTop}>
                  <Ionicons
                    name="business-outline"
                    size={16}
                    color={selectedZone === 'san_salvador' ? Colors.primary : Colors.textSecondary}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.zoneCardTitle, selectedZone === 'san_salvador' && styles.zoneTextActive]}>
                    San Salvador
                  </Text>
                </View>
                <Text style={styles.zoneCardCoverage}>Área Metropolitana</Text>
                <Text style={[styles.zoneCardPrice, selectedZone === 'san_salvador' && styles.zonePriceActive]}>
                  {formatUSD(product.priceSanSalvador || product.price)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.zoneCard,
                  selectedZone === 'otros_deptos' && styles.zoneCardActive
                ]}
                onPress={() => setSelectedZone('otros_deptos')}
                activeOpacity={0.8}
              >
                <View style={styles.zoneCardTop}>
                  <Ionicons
                    name="car-outline"
                    size={16}
                    color={selectedZone === 'otros_deptos' ? Colors.primary : Colors.textSecondary}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.zoneCardTitle, selectedZone === 'otros_deptos' && styles.zoneTextActive]}>
                    Otros Deptos.
                  </Text>
                </View>
                <Text style={styles.zoneCardCoverage}>Fuera de San Salvador</Text>
                <Text style={[styles.zoneCardPrice, selectedZone === 'otros_deptos' && styles.zonePriceActive]}>
                  {formatUSD(product.priceOtherZones || product.price + 15)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Precio Actual Destacado */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Precio seleccionado:</Text>
              <Text style={styles.price}>{formatUSD(currentUnitPrice)}</Text>
            </View>
            <View style={styles.zoneBadge}>
              <Text style={styles.zoneBadgeText}>
                {selectedZone === 'otros_deptos' ? 'Otros Departamentos' : 'San Salvador'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* BOTÓN DIRECTO DE WHATSAPP AL 6040-9234 */}
          <TouchableOpacity
            style={styles.whatsAppBtn}
            onPress={handleWhatsAppInquiry}
            activeOpacity={0.85}
          >
            <View style={styles.waIconCircle}>
              <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.waBtnTextContainer}>
              <Text style={styles.waBtnTitle}>Escribir al WhatsApp (+503 {BUSINESS_INFO.phone})</Text>
              <Text style={styles.waBtnSubtitle}>Preguntas, fechas y cotización personalizada</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Descripción del Servicio */}
          <Text style={styles.sectionHeading}>Descripción del Servicio</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* ¿Qué incluye este paquete? */}
          <View style={styles.featuresCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="sparkles-outline" size={17} color={Colors.primaryDark} style={{ marginRight: 6 }} />
              <Text style={styles.featuresHeaderTitle}>¿Qué incluye este servicio?</Text>
            </View>
            {(product.features && product.features.length > 0
              ? product.features
              : [
                  'Animación profesional y dinámica para toda la familia',
                  'Personal capacitado, puntual y con gran carisma',
                  'Materiales seguros, limpios e hipoalergénicos',
                  'Globoflexia de Cortesía GRATIS para los niños',
                  'Garantía de diversión y momentos mágicos inolvidables'
                ]
            ).map((feat, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>

          {/* Selector de Cantidad */}
          {!isOutOfStock && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Cantidad de Paquetes / Horas:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                  onPress={handleDecrement}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={18} color={Colors.primaryDark} />
                </TouchableOpacity>

                <Text style={styles.quantityNumber}>{quantity}</Text>

                <TouchableOpacity
                  style={[styles.qtyBtn, quantity >= product.stock && styles.qtyBtnDisabled]}
                  onPress={handleIncrement}
                  disabled={quantity >= product.stock}
                >
                  <Ionicons name="add" size={18} color={Colors.primaryDark} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Botón de Agregar al Carrito */}
          <CustomButton
            title={isOutOfStock ? 'Servicio Agotado' : `Agregar al Carrito • ${formatUSD(totalPrice)}`}
            variant={isOutOfStock ? 'disabled' : 'primary'}
            disabled={isOutOfStock}
            onPress={handleAddToCart}
            style={styles.addCartBtn}
            icon={!isOutOfStock ? <Ionicons name="cart-outline" size={18} color="#FFFFFF" /> : null}
          />

          <View style={styles.divider} />

          {/* SECCIÓN DE RESEÑAS Y VALORACIONES */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionHeading}>Valoraciones de Clientes</Text>
            {canReview && (
              <TouchableOpacity
                style={styles.addReviewBtn}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="star" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.addReviewBtnText}>Calificar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* REGLA OBLIGATORIA: Mensaje si el usuario NO ha comprado el producto */}
          {!canReview && (
            <View style={styles.cannotReviewBanner}>
              <Ionicons name="lock-closed-outline" size={18} color="#92400E" style={{ marginRight: 8 }} />
              <Text style={styles.cannotReviewText}>
                Solo los clientes que hayan adquirido este servicio pueden dejar una valoración y comentario.
              </Text>
            </View>
          )}

          {/* Lista de Reseñas */}
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{rev.userName.charAt(0)}</Text>
                    </View>
                    <View style={styles.reviewerTextContainer}>
                      <Text
                        style={styles.reviewerName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {rev.userName}
                      </Text>
                      <Text style={styles.reviewDate}>{rev.date}</Text>
                    </View>
                  </View>
                  <View style={styles.starsWrapper}>
                    <RatingStars rating={rev.rating} size={13} showNumber={false} />
                  </View>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noReviewsBox}>
              <Text style={styles.noReviewsText}>Aún no hay opiniones para este servicio. ¡Sé el primero en contratarlo!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal para Dejar Reseña */}
      <ReviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleReviewSubmit}
        productName={product.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollContent: {
    paddingBottom: 40
  },
  imageContainer: {
    width: '100%',
    height: 260,
    backgroundColor: '#F1F3F5',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  badgeOverlay: {
    position: 'absolute',
    top: 16,
    right: 16
  },
  contentCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    padding: 22,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryText: {
    color: Colors.primaryDark,
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reviewsCountText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6
  },
  subtitleTag: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12
  },
  cortesiaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FFE0EC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16
  },
  cortesiaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFD6E8'
  },
  cortesiaTextWrapper: {
    flex: 1
  },
  cortesiaBannerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  cortesiaBannerDesc: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16
  },
  zoneSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  zoneNotice: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  zoneCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  zoneCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center'
  },
  zoneCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF0F5',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  zoneCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  zoneCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  zoneTextActive: {
    color: Colors.primary,
    fontWeight: '900'
  },
  zoneCardCoverage: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center'
  },
  zoneCardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  zonePriceActive: {
    color: Colors.primary,
    fontWeight: '900'
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primaryDark
  },
  zoneBadge: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  zoneBadgeText: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 11
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whatsapp,
    borderRadius: 16,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  waIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  waBtnTextContainer: {
    flex: 1
  },
  waBtnTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  waBtnSubtitle: {
    color: '#E8F5E9',
    fontSize: 11,
    marginTop: 2
  },
  featuresCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  featuresHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  featureText: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden'
  },
  qtyBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  qtyBtnDisabled: {
    opacity: 0.35
  },
  quantityNumber: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  addCartBtn: {
    marginTop: 8
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  addReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderColor: Colors.primary,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14
  },
  addReviewBtnText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13
  },
  cannotReviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14
  },
  cannotReviewText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16
  },
  reviewCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden'
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%'
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    minWidth: 0
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  },
  reviewerTextContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center'
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  reviewDate: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2
  },
  starsWrapper: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18
  },
  noReviewsBox: {
    padding: 16,
    alignItems: 'center'
  },
  noReviewsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginBottom: 6
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14
  }
});

export default ProductDetailScreen;
