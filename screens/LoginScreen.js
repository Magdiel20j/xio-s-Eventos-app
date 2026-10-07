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

export const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validación de formato de correo estándar
  const isValidEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleLogin = async () => {
    const currentErrors = {};

    if (!email.trim()) {
      currentErrors.email = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(email.trim())) {
      currentErrors.email = 'Formato de correo inválido (ejemplo@dominio.com)';
    }

    if (!password) {
      currentErrors.password = 'La contraseña es obligatoria';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      Alert.alert('Campos Incompletos', 'Por favor verifica los campos resaltados.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Petición nativa Fetch API a través de AuthContext
      const res = await login(email.trim(), password, false);

      if (res.success && res.requiresVerification) {
        Alert.alert(
          'Código de Seguridad',
          `Tu código de verificación es: ${res.verificationCode}. Ingrésalo para confirmar tu sesión.`,
          [
            {
              text: 'Ingresar Código',
              onPress: () =>
                navigation.navigate('VerificationCode', {
                  email: res.email,
                  role: res.role || 'client',
                  verificationCode: res.verificationCode
                })
            }
          ]
        );
      } else if (res.success) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error de Autenticación', res.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servicio. Intenta nuevamente.');
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
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
          <Text style={styles.subtitle}>Inicia sesión para gestionar tus eventos y pedidos</Text>
        </View>

        <View style={styles.formCard}>
          <CustomInput
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
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

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Iniciar Sesión"
            variant="primary"
            loading={loading}
            onPress={handleLogin}
            style={styles.submitBtn}
          />

          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>¿Aún no tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.adminDividerRow}>
            <View style={styles.adminDividerLine} />
            <Text style={styles.adminDividerText}>O</Text>
            <View style={styles.adminDividerLine} />
          </View>

          <TouchableOpacity
            style={styles.adminPortalBtn}
            onPress={() => navigation.navigate('AdminLogin')}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.adminPortalText}>Acceso Exclusivo Administrador</Text>
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
    marginBottom: 26
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
    backgroundColor: Colors.primaryDark,
    marginBottom: 16,
    elevation: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10
  },
  logo: {
    width: '100%',
    height: '100%'
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0E6F7'
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  submitBtn: {
    marginBottom: 18
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  promptText: {
    color: Colors.textSecondary,
    fontSize: 14
  },
  registerLink: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: 'bold'
  },
  adminDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },
  adminDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB'
  },
  adminDividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700'
  },
  adminPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D8B4FE'
  },
  adminPortalText: {
    color: Colors.primaryDark,
    fontSize: 13,
    fontWeight: '800'
  }
});

export default LoginScreen;
