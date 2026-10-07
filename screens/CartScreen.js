import React, { useContext, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Linking
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import { CartContext } from '../context/CartContext';
import { ProductContext } from '../context/ProductContext';
import AppHeader from '../components/AppHeader';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';
import { formatUSD, contactWhatsApp, BUSINESS_INFO } from '../constants/business';

export const CartScreen = ({ navigation }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, checkout, totalAmount, totalItems } =
    useContext(CartContext);
  const { checkDateCapacity, allOrders } = useContext(ProductContext);

  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Fecha del evento seleccionada
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedEventDate, setSelectedEventDate] = useState(todayStr);
  const [dateCapacity, setDateCapacity] = useState({ count: 0, isFull: false });

  // Modal de cupo lleno (cuando se superan los 2 eventos por día)
  const [capacityModalVisible, setCapacityModalVisible] = useState(false);

  const isCartEmpty = cart.length === 0;

  // Generar los próximos 10 días para selección rápida de fecha
  const upcomingDates = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      list.push({
        iso,
        label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : `${dayNamesShort[d.getDay()]} ${dayNum}`,
        subLabel: `${monthNamesShort[d.getMonth()]}`
      });
    }
    return list;
  }, []);

  // Verificar capacidad de la fecha seleccionada
  useEffect(() => {
    let isMounted = true;
    const fetchCapacity = async () => {
      const res = await checkDateCapacity(selectedEventDate);
      if (isMounted) {
        setDateCapacity({
          count: res.count || 0,
          isFull: (res.count || 0) >= 2
        });
      }
    };
    fetchCapacity();
    return () => {
      isMounted = false;
    };
  }, [selectedEventDate, allOrders]);

  const handleSelectDate = (dateStr) => {
    setSelectedEventDate(dateStr);
  };

  const handleCheckout = async () => {
    // REGLA ESTRICTA: Bloquear compra si el carrito está vacío
    if (isCartEmpty) {
      Alert.alert('Carrito Vacío', 'No tienes servicios en tu carrito para finalizar la compra.');
      return;
    }

    // REGLA DE CAPACIDAD: Validar si la fecha ya tiene 2 reservaciones confirmadas
    if (dateCapacity.isFull) {
      setCapacityModalVisible(true);
      return;
    }

    Alert.alert(
      'Confirmar Reservación',
      `¿Deseas confirmar tu reservación para la fecha ${selectedEventDate} por un total de ${formatUSD(totalAmount)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar y Agendar',
          onPress: async () => {
            setLoadingCheckout(true);
            const res = await checkout({
              eventDate: selectedEventDate,
              eventLocation: 'San Salvador (Área Metropolitana)'
            });
            setLoadingCheckout(false);

            if (res.success) {
              Alert.alert(
                '¡Reservación Confirmada!',
                `Tu evento ${res.order.id} ha sido agendado para el ${selectedEventDate} con éxito.`,
                [
                  {
                    text: 'Ver Mis Pedidos',
                    onPress: () => navigation.navigate('MainTabs', { screen: 'Pedidos' })
                  }
                ]
              );
            } else if (res.capacityReached) {
              setCapacityModalVisible(true);
            }
          }
        }
      ]
    );
  };

  const handleOpenInstagram = () => {
    Linking.openURL('https://www.instagram.com/xio_eventos/').catch(() => {
      Alert.alert('Enlace', 'No se pudo abrir Instagram.');
    });
  };

  const handleWhatsAppSpecialQuota = () => {
    contactWhatsApp({
      customMessage: `¡Hola Xio's Eventos! Vi que la fecha ${selectedEventDate} tiene los 2 cupos automáticos ocupados en la aplicación. ¿Habría posibilidad de coordinar un cupo especial para mi evento?`
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Mi Carrito" showBack={false} />

      {isCartEmpty ? (
        <EmptyState
          iconName="cart-outline"
          title="Tu Carrito está Vacío"
          message="Aún no has agregado paquetes ni shows para tu fiesta. Explora nuestro catálogo y agenda momentos inolvidables."
          actionText="Ver Catálogo de Servicios"
          onAction={() => navigation.navigate('Catalogo')}
        />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerInfo}>
            <Text style={styles.itemsCount}>
              {totalItems} {totalItems === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}
            </Text>
            <TouchableOpacity onPress={clearCart} style={styles.clearCartBtn}>
              <Ionicons name="trash-outline" size={14} color={Colors.danger} style={{ marginRight: 4 }} />
              <Text style={styles.clearCartText}>Vaciar carrito</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Servicios en el Carrito */}
          <View style={styles.itemsListContainer}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemUnitPrice}>{formatUSD(item.price)} c/u</Text>

                  <View style={styles.itemFooter}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={14} color={Colors.primary} />
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={14} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.subtotalText}>
                      {formatUSD(item.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* SELECCIÓN DE FECHA DEL EVENTO Y CONTROL DE CAPACIDAD (MAX 2/DÍA) */}
          <View style={styles.dateSelectorCard}>
            <View style={styles.dateSelectorHeader}>
              <View style={styles.dateIconCircle}>
                <Ionicons name="calendar-outline" size={20} color={Colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateSectionTitle}>Fecha de tu Evento</Text>
                <Text style={styles.dateSectionSubtitle}>
                  Selecciona el día de tu fiesta (Máximo 2 eventos diarios)
                </Text>
              </View>
            </View>

            {/* Carrusel de Fechas */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesRow}
            >
              {upcomingDates.map((d) => {
                const isSelected = selectedEventDate === d.iso;
                return (
                  <TouchableOpacity
                    key={d.iso}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => handleSelectDate(d.iso)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateChipLabel, isSelected && styles.dateChipTextSelected]}>
                      {d.label}
                    </Text>
                    <Text style={[styles.dateChipSub, isSelected && styles.dateChipSubSelected]}>
                      {d.subLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Estado de disponibilidad del día seleccionado */}
            <View
              style={[
                styles.capacityNoticeBox,
                dateCapacity.isFull ? styles.noticeFull : styles.noticeAvailable
              ]}
            >
              <Ionicons
                name={dateCapacity.isFull ? 'alert-circle' : 'checkmark-circle'}
                size={16}
                color={dateCapacity.isFull ? '#DC2626' : Colors.success}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.capacityNoticeText,
                  dateCapacity.isFull ? { color: '#DC2626' } : { color: Colors.success }
                ]}
              >
                {dateCapacity.isFull
                  ? `Fecha seleccionada (${selectedEventDate}): ¡CUPO LLENO (2/2 eventos confirmados)!`
                  : `Fecha seleccionada (${selectedEventDate}): ${dateCapacity.count}/2 cupos reservados. ¡Disponible!`}
              </Text>
            </View>
          </View>

          {/* Resumen de Compra y Botón Finalizar */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatUSD(totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Globoflexia de Cortesía</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary, fontWeight: '800' }]}>
                GRATIS
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fecha Agendada</Text>
              <Text style={[styles.summaryValue, { color: Colors.primaryDark, fontWeight: '800' }]}>
                {selectedEventDate}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <Text style={styles.totalValue}>{formatUSD(totalAmount)}</Text>
            </View>

            {/* Enlace de consulta rápida por WhatsApp */}
            <TouchableOpacity
              style={styles.cartWaHelp}
              onPress={() =>
                contactWhatsApp({
                  customMessage: `Hola Xio's Eventos, tengo ${totalItems} servicio(s) en mi carrito por un total de ${formatUSD(
                    totalAmount
                  )} para la fecha ${selectedEventDate} y deseo consultar disponibilidad.`
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={16} color={Colors.whatsapp} style={{ marginRight: 6 }} />
              <Text style={styles.cartWaText}>¿Dudas con la fecha? Escríbenos al WhatsApp</Text>
            </TouchableOpacity>

            {/* Botón Finalizar Reserva */}
            <CustomButton
              title={
                isCartEmpty
                  ? 'Carrito Vacío (Bloqueado)'
                  : dateCapacity.isFull
                  ? 'Fecha Llena (Consultar Cupo)'
                  : 'Confirmar y Agendar Reserva'
              }
              variant={isCartEmpty ? 'disabled' : dateCapacity.isFull ? 'secondary' : 'primary'}
              disabled={isCartEmpty || loadingCheckout}
              loading={loadingCheckout}
              onPress={handleCheckout}
              style={styles.checkoutBtn}
              icon={
                dateCapacity.isFull ? (
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
                ) : (
                  <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                )
              }
            />
          </View>
        </ScrollView>
      )}

      {/* MODAL DE MANEJO DE CUPO LLENO (3° INTENTO DE RESERVACIÓN EN EL DÍA) */}
      <Modal
        visible={capacityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCapacityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="calendar" size={36} color="#DC2626" />
            </View>

            <Text style={styles.modalTitle}>¡Cupo Lleno para esta Fecha!</Text>
            <Text style={styles.modalDateBadge}>{selectedEventDate}</Text>

            <Text style={styles.modalDescription}>
              Lo sentimos mucho. Para garantizar la calidad y puntualidad de nuestros shows, la aplicación permite un
              máximo de <Text style={{ fontWeight: '800' }}>2 eventos por día</Text>, y esta fecha ya cuenta con sus 2
              cupos reservados.
            </Text>

            <Text style={styles.modalSubDescription}>
              ¡No te preocupes! Puedes consultar directamente si es posible coordinar un horario especial o verificar
              nuestro calendario en redes:
            </Text>

            {/* BOTÓN OFICIAL DE WHATSAPP AL 6040-9234 */}
            <TouchableOpacity
              style={styles.modalWhatsAppBtn}
              onPress={() => {
                setCapacityModalVisible(false);
                handleWhatsAppSpecialQuota();
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.modalWhatsAppBtnText}>Consultar Cupo por WhatsApp</Text>
            </TouchableOpacity>

            {/* BOTÓN OFICIAL DE INSTAGRAM A https://www.instagram.com/xio_eventos/ */}
            <TouchableOpacity
              style={styles.modalInstagramBtn}
              onPress={() => {
                setCapacityModalVisible(false);
                handleOpenInstagram();
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-instagram" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.modalInstagramBtnText}>Visitar Instagram (@xio_eventos)</Text>
            </TouchableOpacity>

            {/* Botón Cerrar y Elegir Otra Fecha */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setCapacityModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseBtnText}>Elegir otra fecha en la app</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  content: {
    flex: 1
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary
  },
  clearCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4
  },
  clearCartText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '700'
  },
  itemsListContainer: {
    paddingHorizontal: 16
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F3F5'
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 6
  },
  deleteBtn: {
    padding: 2
  },
  itemCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  itemUnitPrice: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '700',
    marginTop: 2
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    paddingHorizontal: 8
  },
  subtotalText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primary
  },
  dateSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2
  },
  dateSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  dateIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  dateSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  dateSectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1
  },
  datesRow: {
    paddingVertical: 4
  },
  dateChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 70
  },
  dateChipSelected: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark
  },
  dateChipLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  dateChipTextSelected: {
    color: '#FFFFFF'
  },
  dateChipSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2
  },
  dateChipSubSelected: {
    color: Colors.accent
  },
  capacityNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1
  },
  noticeAvailable: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  noticeFull: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  capacityNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primaryDark
  },
  cartWaHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  cartWaText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700'
  },
  checkoutBtn: {
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    elevation: 10
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FECACA'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 6
  },
  modalDateBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12
  },
  modalDescription: {
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8
  },
  modalSubDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 18
  },
  modalWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whatsapp,
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 3
  },
  modalWhatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  modalInstagramBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1306C',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 3
  },
  modalInstagramBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  modalCloseBtn: {
    paddingVertical: 6
  },
  modalCloseBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline'
  }
});

export default CartScreen;
