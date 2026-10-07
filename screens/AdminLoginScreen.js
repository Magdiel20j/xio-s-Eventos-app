import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AuthContext } from '../context/AuthContext';

export const AdminLoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('admin@xioeventos.com');
  const [password, setPassword] = useState('Admin123!');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isValidEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleAdminLogin = async () => {
    const currentErrors = {};

    if (!email.trim()) {
      currentErrors.email = 'El correo de administrador es obligatorio';
    } else if (!isValidEmail(email.trim())) {
      currentErrors.email = 'Formato de correo inválido';
    }

    if (!password) {
      currentErrors.password = 'La contraseña es obligatoria';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      Alert.alert('Campos Incompletos', 'Por favor completa tus credenciales de administrador.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await login(email.trim(), password, true);

      if (res.success && res.requiresVerification) {
        Alert.alert(
          'Código Generado',
          `Código de verificación: ${res.verificationCode}. Ingresa este código para confirmar tu sesión.`,
          [
            {
              text: 'Continuar',
              onPress: () =>
                navigation.navigate('VerificationCode', {
                  email: res.email,
                  role: 'admin',
                  verificationCode: res.verificationCode
                })
            }
          ]
        );
      } else if (res.success) {
        navigation.replace('AdminTabs');
      } else {
        Alert.alert('Error de Administrador', res.message || 'Credenciales inválidas.');
      }
    } catch (error) {
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servicio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.badgeShield}>
            <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>Xio's Eventos</Text>
          <Text style={styles.adminTitle}>Acceso de Administrador</Text>
          <Text style={styles.subtitle}>
            Panel de control para gestión de combos, calendario y supervisión de pedidos
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.adminNotice}>
            <Ionicons name="lock-closed" size={16} color={Colors.primaryDark} style={{ marginRight: 6 }} />
            <Text style={styles.adminNoticeText}>Acceso restringido a personal autorizado</Text>
          </View>

          <CustomInput
            label="Correo de Administrador"
            placeholder="admin@xioeventos.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <CustomInput
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            secureTextEntry
            error={errors.password}
          />

          <CustomButton
            title="Ingresar como Admin"
            variant="purple"
            loading={loading}
            onPress={handleAdminLogin}
            style={styles.submitBtn}
            icon={<Ionicons name="log-in-outline" size={18} color="#FFFFFF" />}
          />

          <TouchableOpacity
            style={styles.backToClientBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.backToClientText}>Volver al Portal de Clientes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  badgeShield: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Colors.gold,
    elevation: 6,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2
  },
  adminTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 18
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E9D5FF'
  },
  adminNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  adminNoticeText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '700'
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 16
  },
  backToClientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  backToClientText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default AdminLoginScreen;
