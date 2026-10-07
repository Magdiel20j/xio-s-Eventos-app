import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { ProductContext } from '../context/ProductContext';
import { formatUSD } from '../constants/business';

export const AdminCreateComboScreen = ({ navigation }) => {
  const { createCombo } = useContext(ProductContext);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('San Salvador (Área Metropolitana)');
  const [includesGloboflexia, setIncludesGloboflexia] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const LOCATIONS = [
    'San Salvador (Área Metropolitana)',
    'La Libertad / Santa Tecla',
    'Sonsonate / Ahuachapán',
    'Santa Ana / Zona Occidental',
    'San Miguel / Zona Oriental',
    'Cobertura Nacional (Todo El Salvador)'
  ];

  const handleSaveCombo = async () => {
    const currentErrors = {};

    if (!name.trim()) {
      currentErrors.name = 'El nombre del combo es obligatorio';
    }

    if (!description.trim()) {
      currentErrors.description = 'Ingresa una descripción del combo';
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      currentErrors.price = 'Ingresa un precio válido mayor a 0 USD';
    }

    if (!location.trim()) {
      currentErrors.location = 'Selecciona o ingresa la ubicación de cobertura';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      Alert.alert('Formulario Incompleto', 'Por favor revisa los campos requeridos.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await createCombo({
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        location: location.trim(),
        includesGloboflexia
      });

      if (res.success) {
        Alert.alert(
          '¡Combo Creado con Éxito!',
          `El combo "${name.trim()}" ha sido publicado en el catálogo oficial con precio desde ${formatUSD(parsedPrice)}.`,
          [
            {
              text: 'Crear Otro',
              onPress: () => {
                setName('');
                setDescription('');
                setPrice('');
                setLocation('San Salvador (Área Metropolitana)');
                setIncludesGloboflexia(true);
              }
            },
            {
              text: 'Ver en Catálogo',
              onPress: () => navigation.navigate('AdminTabs', { screen: 'Calendario' })
            }
          ]
        );
      } else {
        Alert.alert('Error', res.message || 'No se pudo registrar el combo.');
      }
    } catch (error) {
      Alert.alert('Error de Red', 'Fallo al conectar con el servicio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.topHeader}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="sparkles" size={24} color={Colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Crear Nuevo Combo</Text>
          <Text style={styles.headerSubtitle}>Módulo de Gestión de Animación y Fiestas</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información del Paquete</Text>

          {/* Nombre del Combo */}
          <CustomInput
            label="Nombre del Combo"
            placeholder="Ej: Combo Neón & Animación VIP"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
          />

          {/* Descripción */}
          <CustomInput
            label="Descripción del Servicio"
            placeholder="Detalla qué incluye: horas de animación, juegos grupales, dinámicas..."
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          {/* Precio en USD */}
          <CustomInput
            label="Precio Base en Dólares ($ USD)"
            placeholder="Ej: 75.00"
            value={price}
            onChangeText={(text) => {
              // Permitir solo números y punto decimal
              const clean = text.replace(/[^0-9.]/g, '');
              setPrice(clean);
              if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
            }}
            keyboardType="decimal-pad"
            error={errors.price}
          />

          {/* Ubicación de Cobertura */}
          <Text style={styles.label}>Ubicación de Cobertura / Evento</Text>
          <View style={styles.locationChips}>
            {LOCATIONS.map((loc) => {
              const isSelected = location === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.locChip, isSelected && styles.locChipSelected]}
                  onPress={() => setLocation(loc)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={isSelected ? '#FFFFFF' : Colors.primaryDark}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.locChipText, isSelected && styles.locChipTextSelected]}>
                    {loc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SWITCH DE CORTESÍA OBLIGATORIO: INCLUYE GLOBOFLEXIA (SÍ / NO) */}
          <View style={styles.cortesiaSwitchCard}>
            <View style={styles.cortesiaSwitchInfo}>
              <View style={styles.giftIconWrap}>
                <Ionicons name="gift-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.cortesiaTitle}>Incluye Globoflexia (Cortesía)</Text>
                <Text style={styles.cortesiaSubtitle}>
                  {includesGloboflexia
                    ? 'SÍ: Se añadirá como cortesía GRATIS para todos los niños'
                    : 'NO: Paquete estándar sin figuras de globoflexia de cortesía'}
                </Text>
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text
                style={[
                  styles.switchStateText,
                  { color: includesGloboflexia ? Colors.primary : Colors.textMuted }
                ]}
              >
                {includesGloboflexia ? 'SÍ' : 'NO'}
              </Text>
              <Switch
                value={includesGloboflexia}
                onValueChange={setIncludesGloboflexia}
                trackColor={{ false: '#D1D5DB', true: Colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>

          {/* Resumen del Combo */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Vista Previa del Paquete:</Text>
            <Text style={styles.summaryName}>{name || 'Nombre del Combo'}</Text>
            <Text style={styles.summaryPrice}>
              Precio: {price ? formatUSD(parseFloat(price) || 0) : '$0.00 USD'}
            </Text>
            <Text style={styles.summaryLocation}>Zona: {location}</Text>
            <View style={styles.previewBadge}>
              <Ionicons
                name={includesGloboflexia ? 'checkmark-circle' : 'close-circle'}
                size={14}
                color={includesGloboflexia ? Colors.success : Colors.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: includesGloboflexia ? Colors.success : Colors.textMuted
                }}
              >
                {includesGloboflexia
                  ? 'Globoflexia GRATIS de Cortesía Incluida'
                  : 'Sin Globoflexia de Cortesía'}
              </Text>
            </View>
          </View>

          {/* Botón Guardar */}
          <CustomButton
            title="Guardar y Publicar Combo"
            variant="purple"
            loading={loading}
            onPress={handleSaveCombo}
            style={styles.submitBtn}
            icon={<Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 18,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 4
  },
  locationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  locChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 8
  },
  locChipSelected: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark
  },
  locChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark
  },
  locChipTextSelected: {
    color: '#FFFFFF'
  },
  cortesiaSwitchCard: {
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FFE0EB',
    marginBottom: 20
  },
  cortesiaSwitchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  giftIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 2
  },
  cortesiaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary
  },
  cortesiaSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#FFE0EB',
    paddingTop: 8
  },
  switchStateText: {
    fontSize: 14,
    fontWeight: '900',
    marginRight: 10
  },
  summaryBox: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  summaryName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  summaryPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2
  },
  summaryLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  submitBtn: {
    marginTop: 4
  }
});

export default AdminCreateComboScreen;
