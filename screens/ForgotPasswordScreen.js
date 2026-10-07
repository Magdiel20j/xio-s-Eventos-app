import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Colors from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AuthContext } from '../context/AuthContext';

export const ForgotPasswordScreen = ({ navigation }) => {
  const { forgotPassword } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isValidEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleResetPassword = async () => {
    const currentErrors = {};

    if (!email.trim()) {
      currentErrors.email = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(email.trim())) {
      currentErrors.email = 'Ingresa un correo electrónico con formato válido';
    }

    if (!newPassword) {
      currentErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (newPassword.length < 6) {
      currentErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!confirmPassword) {
      currentErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (newPassword !== confirmPassword) {
      currentErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      Alert.alert('Formulario Incompleto', 'Por favor verifica la información ingresada.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await forgotPassword(email.trim(), newPassword);

      if (res.success) {
        Alert.alert(
          '¡Contraseña Actualizada!',
          'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.',
          [
            {
              text: 'Iniciar Sesión',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', res.message || 'No fue posible actualizar la contraseña.');
      }
    } catch (error) {
      Alert.alert('Error de Red', 'Fallo al conectar con el servidor Fetch API.');
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
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa el correo asociado a tu cuenta y establece tu nueva clave de acceso
          </Text>
        </View>

        <View style={styles.card}>
          <CustomInput
            label="Correo de la Cuenta"
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
            label="Nueva Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
            }}
            secureTextEntry
            error={errors.newPassword}
          />

          <CustomInput
            label="Confirmar Nueva Contraseña"
            placeholder="Repite la nueva contraseña"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <CustomButton
            title="Restablecer Contraseña"
            variant="primary"
            loading={loading}
            onPress={handleResetPassword}
            style={styles.submitBtn}
          />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={Colors.secondary} style={{ marginRight: 6 }} />
            <Text style={styles.backText}>Volver al inicio de sesión</Text>
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
    padding: 22,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE0EB'
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300
  },
  card: {
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
  submitBtn: {
    marginTop: 6,
    marginBottom: 16
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  backText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default ForgotPasswordScreen;
