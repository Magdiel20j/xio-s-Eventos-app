import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Image
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import { ProductContext } from '../context/ProductContext';
import AppHeader from '../components/AppHeader';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';
import { formatUSD } from '../constants/business';

export const OrdersScreen = ({ navigation }) => {
  const { userOrders, cancelOrder, loadUserOrders } = useContext(ProductContext);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelOrder = (order) => {
    if (order.status === 'Cancelado') {
      Alert.alert('Aviso', 'Este pedido ya se encuentra cancelado.');
      return;
    }

    Alert.alert(
      'Cancelar Pedido',
      `¿Estás seguro de cancelar el pedido ${order.id}? El inventario de los servicios se restaurará inmediatamente.`,
      [
        { text: 'No cancelar', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(order.id);
            const res = await cancelOrder(order.id);
            setCancellingId(null);
            if (res.success) {
              Alert.alert(
                'Pedido Cancelado',
                'El pedido ha sido cancelado y el stock de los servicios se ha restaurado con éxito.'
              );
              if (selectedOrder && selectedOrder.id === order.id) {
                setSelectedOrder(null);
              }
            } else {
              Alert.alert('Error', res.message || 'No se pudo cancelar el pedido.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Historial de Pedidos" />

      {userOrders.length === 0 ? (
        <EmptyState
          iconName="receipt-outline"
          title="Sin Pedidos Registrados"
          message="Aún no has realizado ninguna compra de servicios en Xio's Eventos."
          actionText="Explorar Catálogo"
          onAction={() => navigation.navigate('Catalogo')}
        />
      ) : (
        <FlatList
          data={userOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCancelled = item.status === 'Cancelado';
            return (
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>{item.id}</Text>
                    <Text style={styles.orderDate}>{item.date}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: isCancelled ? '#FEE2E2' : '#DCFCE7' }
                    ]}
                  >
                    <Ionicons
                      name={isCancelled ? 'close-circle' : 'checkmark-circle'}
                      size={13}
                      color={isCancelled ? Colors.danger : Colors.success}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: isCancelled ? Colors.danger : Colors.success }
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Resumen de Artículos */}
                <View style={styles.itemsPreview}>
                  {item.items.map((prod, idx) => (
                    <Text key={idx} style={styles.itemPreviewLine} numberOfLines={1}>
                      • {prod.quantity}x {prod.name} ({formatUSD(prod.price * prod.quantity)})
                    </Text>
                  ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total Pagado:</Text>
                    <Text style={styles.totalAmount}>{formatUSD(item.total)}</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => setSelectedOrder(item)}
                    >
                      <Text style={styles.detailsBtnText}>Ver Detalle</Text>
                    </TouchableOpacity>

                    {!isCancelled && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancelOrder(item)}
                        disabled={cancellingId === item.id}
                      >
                        <Text style={styles.cancelBtnText}>
                          {cancellingId === item.id ? 'Cancelando...' : 'Cancelar'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Modal con Detalle Completo de la Orden */}
      <Modal
        visible={!!selectedOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del Pedido</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.closeBtn} accessibilityLabel="Cerrar modal">
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalLabel}>No. Pedido:</Text>
                  <Text style={styles.modalVal}>{selectedOrder.id}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalLabel}>Fecha:</Text>
                  <Text style={styles.modalVal}>{selectedOrder.date}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalLabel}>Cliente:</Text>
                  <Text style={styles.modalVal}>{selectedOrder.userName}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalLabel}>Estado:</Text>
                  <Text
                    style={[
                      styles.modalVal,
                      {
                        color:
                          selectedOrder.status === 'Cancelado'
                            ? Colors.danger
                            : Colors.success,
                        fontWeight: 'bold'
                      }
                    ]}
                  >
                    {selectedOrder.status}
                  </Text>
                </View>

                <Text style={styles.modalSectionTitle}>Servicios Contratados</Text>

                {selectedOrder.items.map((it, i) => (
                  <View key={i} style={styles.modalItemRow}>
                    <Image source={{ uri: it.image }} style={styles.modalItemImg} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.modalItemName}>{it.name}</Text>
                      <Text style={styles.modalItemSub}>
                        {it.quantity} x {formatUSD(it.price)}
                      </Text>
                    </View>
                    <Text style={styles.modalItemPrice}>
                      {formatUSD(it.price * it.quantity)}
                    </Text>
                  </View>
                ))}

                <View style={styles.modalTotalBox}>
                  <Text style={styles.modalTotalLabel}>Total Final</Text>
                  <Text style={styles.modalTotalVal}>
                    {formatUSD(selectedOrder.total)}
                  </Text>
                </View>

                {selectedOrder.status !== 'Cancelado' && (
                  <CustomButton
                    title="Cancelar Pedido (Restaurar Inventario)"
                    variant="danger"
                    onPress={() => handleCancelOrder(selectedOrder)}
                    style={{ marginTop: 14 }}
                  />
                )}
              </ScrollView>
            )}
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
  listContent: {
    padding: 16,
    paddingBottom: 30
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  orderDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800'
  },
  itemsPreview: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10
  },
  itemPreviewLine: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 3
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase'
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primaryDark
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailsBtn: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFE0EC'
  },
  detailsBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800'
  },
  cancelBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12
  },
  cancelBtnText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 31, 31, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  closeBtn: {
    padding: 4
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  modalLabel: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  modalVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 10
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 8,
    marginBottom: 8
  },
  modalItemImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E9ECEF'
  },
  modalItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  modalItemSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  modalItemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  modalTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border
  },
  modalTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  modalTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark
  }
});

export default OrdersScreen;
