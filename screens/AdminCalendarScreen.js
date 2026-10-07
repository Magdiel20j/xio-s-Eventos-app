import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
  RefreshControl
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import { ProductContext } from '../context/ProductContext';
import { formatUSD } from '../constants/business';

export const AdminCalendarScreen = ({ navigation }) => {
  const { allOrders, loadAllOrders } = useContext(ProductContext);
  const [refreshing, setRefreshing] = useState(false);

  // Fecha seleccionada en el calendario (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Navegación de mes/año actual
  const [currentDate, setCurrentDate] = useState(new Date());

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllOrders();
    setRefreshing(false);
  };

  // Mapear eventos por fecha
  const ordersByDate = useMemo(() => {
    const map = {};
    allOrders.forEach((order) => {
      if (order.status !== 'Cancelado' && order.eventDate) {
        if (!map[order.eventDate]) {
          map[order.eventDate] = [];
        }
        map[order.eventDate].push(order);
      }
    });
    return map;
  }, [allOrders]);

  // Lista de eventos de la fecha seleccionada
  const selectedDateOrders = ordersByDate[selectedDate] || [];

  // Cálculos para la cuadrícula del calendario
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generar cuadrícula de días
  const calendarCells = useMemo(() => {
    const cells = [];
    // Espacios vacíos antes del día 1
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ empty: true, key: `empty-${i}` });
    }
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = ordersByDate[dayStr]?.length || 0;
      cells.push({
        day,
        dateStr: dayStr,
        count,
        isFull: count >= 2,
        isToday: dayStr === todayStr,
        key: `day-${day}`
      });
    }
    return cells;
  }, [year, month, daysInMonth, firstDayIndex, ordersByDate, todayStr]);

  return (
    <View style={styles.container}>
      {/* Header superior */}
      <View style={styles.topHeader}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="calendar" size={24} color={Colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Calendario de Eventos</Text>
          <Text style={styles.headerSubtitle}>Supervisión de cupos y fechas agendadas</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary, Colors.primaryDark]}
          />
        }
      >
        {/* Selector de Mes */}
        <View style={styles.monthHeaderCard}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={Colors.primaryDark} />
          </TouchableOpacity>
          <View style={styles.monthTitleWrapper}>
            <Text style={styles.monthTitleText}>{monthNames[month]} {year}</Text>
          </View>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={22} color={Colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Cuadrícula del Calendario */}
        <View style={styles.calendarCard}>
          {/* Nombres de los días */}
          <View style={styles.daysOfWeekRow}>
            {daysOfWeek.map((d, index) => (
              <Text key={index} style={[styles.dayOfWeekText, index === 0 && { color: Colors.primary }]}>
                {d}
              </Text>
            ))}
          </View>

          {/* Días del mes */}
          <View style={styles.daysGrid}>
            {calendarCells.map((cell) => {
              if (cell.empty) {
                return <View key={cell.key} style={styles.emptyDayCell} />;
              }

              const isSelected = selectedDate === cell.dateStr;

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={[
                    styles.dayCell,
                    cell.isToday && styles.todayCell,
                    isSelected && styles.selectedCell,
                    cell.isFull && !isSelected && styles.fullDayCell
                  ]}
                  onPress={() => setSelectedDate(cell.dateStr)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.selectedDayNumber,
                      cell.isToday && !isSelected && styles.todayDayNumber,
                      cell.isFull && !isSelected && styles.fullDayNumber
                    ]}
                  >
                    {cell.day}
                  </Text>

                  {/* Indicador de eventos */}
                  {cell.count > 0 && (
                    <View
                      style={[
                        styles.eventDotBadge,
                        cell.isFull ? styles.dotFull : styles.dotPartial,
                        isSelected && { backgroundColor: '#FFFFFF' }
                      ]}
                    >
                      <Text
                        style={[
                          styles.dotBadgeText,
                          cell.isFull ? { color: '#DC2626' } : { color: Colors.primary },
                          isSelected && { color: Colors.primaryDark }
                        ]}
                      >
                        {cell.count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Leyenda del Calendario */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: '#DBEAFE', borderColor: Colors.accent }]} />
              <Text style={styles.legendText}>1 Cupo</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: '#FEE2E2', borderColor: '#DC2626' }]} />
              <Text style={styles.legendText}>2 Cupos (Lleno)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: Colors.primaryDark, borderColor: Colors.primaryDark }]} />
              <Text style={styles.legendText}>Seleccionado</Text>
            </View>
          </View>
        </View>

        {/* Panel de Detalle del Día Seleccionado */}
        <View style={styles.eventsCard}>
          <View style={styles.eventsCardHeader}>
            <View>
              <Text style={styles.eventsCardDate}>{selectedDate}</Text>
              <Text style={styles.eventsCardCount}>
                {selectedDateOrders.length === 0
                  ? 'Sin eventos agendados (0/2 cupos)'
                  : selectedDateOrders.length === 1
                  ? '1 evento agendado (1/2 cupos ocupados)'
                  : '2 eventos agendados (¡CUPO COMPLETO 2/2!)'}
              </Text>
            </View>
            <View
              style={[
                styles.capacityBadge,
                selectedDateOrders.length >= 2
                  ? styles.capacityBadgeFull
                  : selectedDateOrders.length === 1
                  ? styles.capacityBadgePartial
                  : styles.capacityBadgeEmpty
              ]}
            >
              <Ionicons
                name={
                  selectedDateOrders.length >= 2
                    ? 'alert-circle'
                    : selectedDateOrders.length === 1
                    ? 'checkmark-circle'
                    : 'calendar-outline'
                }
                size={14}
                color={
                  selectedDateOrders.length >= 2
                    ? '#DC2626'
                    : selectedDateOrders.length === 1
                    ? '#D97706'
                    : Colors.success
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.capacityBadgeText,
                  selectedDateOrders.length >= 2
                    ? { color: '#DC2626' }
                    : selectedDateOrders.length === 1
                    ? { color: '#D97706' }
                    : { color: Colors.success }
                ]}
              >
                {selectedDateOrders.length}/2 Reservas
              </Text>
            </View>
          </View>

          {/* Lista de Reservaciones del Día */}
          {selectedDateOrders.length === 0 ? (
            <View style={styles.emptyEventsBox}>
              <Ionicons name="sparkles-outline" size={36} color={Colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyEventsTitle}>Día Disponible</Text>
              <Text style={styles.emptyEventsDesc}>
                No hay contrataciones agendadas para esta fecha. Los clientes pueden reservar hasta 2 eventos.
              </Text>
            </View>
          ) : (
            selectedDateOrders.map((ord, idx) => (
              <View key={ord.id} style={styles.orderItemCard}>
                <View style={styles.orderItemTop}>
                  <View style={styles.orderItemNumBadge}>
                    <Text style={styles.orderItemNumText}>Evento #{idx + 1}</Text>
                  </View>
                  <Text style={styles.orderItemId}>{ord.id}</Text>
                </View>

                <View style={styles.orderDetailRow}>
                  <Ionicons name="person-outline" size={15} color={Colors.primaryDark} style={{ marginRight: 6 }} />
                  <Text style={styles.clientName}>{ord.userName}</Text>
                  {ord.userPhone && (
                    <Text style={styles.clientPhone}>• Tel: {ord.userPhone}</Text>
                  )}
                </View>

                <View style={styles.orderDetailRow}>
                  <Ionicons name="location-outline" size={15} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.locationText}>{ord.eventLocation || 'San Salvador'}</Text>
                </View>

                <View style={styles.orderDetailRow}>
                  <Ionicons name="gift-outline" size={15} color={Colors.secondary} style={{ marginRight: 6 }} />
                  <Text style={styles.itemsSummary} numberOfLines={2}>
                    {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </Text>
                </View>

                <View style={styles.orderItemFooter}>
                  <View style={styles.statusBox}>
                    <Ionicons name="checkmark-circle" size={13} color={Colors.success} style={{ marginRight: 4 }} />
                    <Text style={styles.statusText}>{ord.status}</Text>
                  </View>
                  <Text style={styles.orderTotal}>{formatUSD(ord.total)}</Text>
                </View>
              </View>
            ))
          )}
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
  topHeader: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: Colors.gold,
    elevation: 6
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '700',
    marginTop: 2
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36
  },
  monthHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  monthTitleWrapper: {
    alignItems: 'center'
  },
  monthTitleText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primaryDark
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8
  },
  dayOfWeekText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  emptyDayCell: {
    width: `${100 / 7}%`,
    height: 48
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative'
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: Colors.accent
  },
  selectedCell: {
    backgroundColor: Colors.primaryDark
  },
  fullDayCell: {
    backgroundColor: '#FEE2E2'
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  todayDayNumber: {
    color: Colors.accent,
    fontWeight: '900'
  },
  selectedDayNumber: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  fullDayNumber: {
    color: '#DC2626',
    fontWeight: '900'
  },
  eventDotBadge: {
    position: 'absolute',
    bottom: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2
  },
  dotPartial: {
    backgroundColor: '#DBEAFE'
  },
  dotFull: {
    backgroundColor: '#FEE2E2'
  },
  dotBadgeText: {
    fontSize: 9,
    fontWeight: '900'
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 5
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary
  },
  eventsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3
  },
  eventsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 14
  },
  eventsCardDate: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primaryDark
  },
  eventsCardCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1
  },
  capacityBadgeEmpty: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  capacityBadgePartial: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  capacityBadgeFull: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  capacityBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  emptyEventsBox: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 16
  },
  emptyEventsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  emptyEventsDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260
  },
  orderItemCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  orderItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  orderItemNumBadge: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  orderItemNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  orderItemId: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700'
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  clientName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  clientPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  itemsSummary: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1
  },
  orderItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 6
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primaryDark
  }
});

export default AdminCalendarScreen;
