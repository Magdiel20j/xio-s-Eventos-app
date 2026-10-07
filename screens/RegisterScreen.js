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
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AuthContext } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Expresión regular para validar formato de correo
  const isValidEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  // Formateador para teléfonos de El Salvador (8 dígitos: XXXX-XXXX, 9 caracteres con guión)
  const formatPhoneSV = (text) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 8);
    if (clean.length > 4) {
      return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    }
    return clean;
  };

  const handleRegister = async () => {
    const currentErrors = {};

    // 1. Validación de nombre
    if (!name.trim()) {
      currentErrors.name = 'El nombre completo es obligatorio';
    }

    // 2. Validación de correo
    if (!email.trim()) {
      currentErrors.email = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(email.trim())) {
      currentErrors.email = 'Ingresa un formato de correo válido (ej: nombre@correo.com)';
    }

    // 3. Validación de edad y valores negativos
    if (!age.trim()) {
      currentErrors.age = 'La edad es obligatoria';
    } else {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        currentErrors.age = 'La edad debe ser un número positivo mayor a 0';
      } else if (parsedAge < 18) {
        currentErrors.age = 'Debes tener al menos 18 años para contratar eventos';
      } else if (parsedAge > 110) {
        currentErrors.age = 'Ingresa una edad válida';
      }
    }

    // 4. Validación de teléfono (El Salvador: 8 dígitos, ej: 1234-5678)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      currentErrors.phone = 'El teléfono de contacto es obligatorio';
    } else if (cleanPhone.length < 8) {
      currentErrors.phone = 'Debe tener 8 dígitos (ej. 1234-5678)';
    }

    // 5. Validación de contraseña
    if (!password) {
      currentErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      currentErrors.password = 'La contraseña debe contener al menos 6 caracteres';
    }

    // 6. Confirmación de contraseña
    if (!confirmPassword) {
      currentErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (password !== confirmPassword) {
      currentErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      Alert.alert('Formulario Incompleto', 'Por favor corrige los errores señalados en rojo.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Petición nativa Fetch API a través de AuthContext
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        age: parseInt(age, 10),
        phone: phone.trim(),
        password
      });

      if (res.success) {
        Alert.alert(
          '¡Registro Exitoso!',
          `Bienvenido a la familia Xio's Eventos, ${name.trim()}.`,
          [{ text: 'Comenzar', onPress: () => navigation.replace('MainTabs') }]
        );
      } else {
        Alert.alert('Error en Registro', res.message || 'No se pudo crear la cuenta.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió una falla en la conexión de red.');
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
          <Text style={styles.title}>Crear Nueva Cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para reservar los mejores shows infantiles, glitter bar y animación
          </Text>
        </View>

        <View style={styles.card}>
          <CustomInput
            label="Nombre Completo"
            placeholder="Ej. Sofía Ramírez López"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            autoCapitalize="words"
          />

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

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomInput
                label="Edad"
                placeholder="Ej. 25"
                value={age}
                onChangeText={(text) => {
                  // Prevenir números negativos en la entrada
                  const clean = text.replace(/[^0-9]/g, '');
                  setAge(clean);
                  if (errors.age) setErrors((prev) => ({ ...prev, age: '' }));
                }}
                keyboardType="numeric"
                error={errors.age}
              />
            </View>

            <View style={{ flex: 1.4 }}>
              <CustomInput
                label="Teléfono Móvil"
                placeholder="1234-5678"
                value={phone}
                onChangeText={(text) => {
                  const formatted = formatPhoneSV(text);
                  setPhone(formatted);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                keyboardType="phone-pad"
                maxLength={9}
                error={errors.phone}
              />
            </View>
          </View>

          <CustomInput
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            secureTextEntry
            error={errors.password}
          />

          <CustomInput
            label="Confirmar Contraseña"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <CustomButton
            title="Crear Cuenta"
            variant="secondary"
            loading={loading}
            onPress={handleRegister}
            style={styles.submitBtn}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0E6F7'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 16
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  promptText: {
    color: Colors.textSecondary,
    fontSize: 14
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default RegisterScreen;
