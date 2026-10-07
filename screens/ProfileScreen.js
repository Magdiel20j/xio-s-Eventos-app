import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { contactWhatsApp, BUSINESS_INFO } from '../constants/business';

export const ProfileScreen = ({ navigation }) => {
  const { user, updateProfile, logout } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Formateador para teléfonos de El Salvador (8 dígitos: XXXX-XXXX, 9 caracteres con guión)
  const formatPhoneSV = (text) => {
    if (!text) return '';
    const clean = text.replace(/[^0-9]/g, '').slice(0, 8);
    if (clean.length > 4) {
      return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    }
    return clean;
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAge(user.age ? String(user.age) : '');
      setPhone(formatPhoneSV(user.phone || ''));
    }
  }, [user]);

  const handleUpdate = async () => {
    const currentErrors = {};

    if (!name.trim()) {
      currentErrors.name = 'El nombre completo no puede estar vacío';
    }

    if (!age.trim()) {
      currentErrors.age = 'La edad es obligatoria';
    } else {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        currentErrors.age = 'La edad debe ser un número positivo mayor a 0';
      } else if (parsedAge < 18) {
        currentErrors.age = 'Debes tener al menos 18 años';
      }
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      currentErrors.phone = 'El teléfono es obligatorio';
    } else if (cleanPhone.length < 8) {
      currentErrors.phone = 'El teléfono debe tener 8 dígitos (ej. 1234-5678)';
    }

    if (password && password.length < 6) {
      currentErrors.password = 'La contraseña debe tener mínimo 6 caracteres';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      Alert.alert('Datos Inválidos', 'Revisa los campos señalados antes de guardar.');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const payload = {
        id: user.id,
        name: name.trim(),
        age: parseInt(age, 10),
        phone: phone.trim()
      };

      if (password) {
        payload.password = password;
      }

      const res = await updateProfile(payload);

      if (res.success) {
        Alert.alert('¡Perfil Actualizado!', 'Tus datos se guardaron correctamente en la base de datos.');
        setPassword('');
      } else {
        Alert.alert('Error', res.message || 'No se pudo actualizar el perfil.');
      }
    } catch (error) {
      Alert.alert('Error de Red', 'Fallo en la comunicación con Fetch API.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Mi Perfil" showCart={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Tarjeta de Encabezado de Usuario */}
          <View style={styles.userCard}>
            <View style={styles.avatarBorder}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.avatarLogo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={[styles.badgeTag, user?.role === 'admin' && { backgroundColor: Colors.primaryDark }]}>
              <Ionicons
                name={user?.role === 'admin' ? 'shield-checkmark' : 'sparkles'}
                size={12}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.badgeTagText}>
                {user?.role === 'admin' ? 'ADMINISTRADOR GENERAL' : "CLIENTE VIP XIO'S"}
              </Text>
            </View>
          </View>

          {/* Formulario de Edición */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Editar Información Personal</Text>

            <CustomInput
              label="Nombre Completo"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              placeholder="Tu nombre real"
            />

            <CustomInput
              label="Correo Electrónico (Solo Lectura)"
              value={email}
              editable={false}
              placeholder="correo@ejemplo.com"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomInput
                  label="Edad"
                  value={age}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9]/g, '');
                    setAge(clean);
                    if (errors.age) setErrors((prev) => ({ ...prev, age: '' }));
                  }}
                  keyboardType="numeric"
                  error={errors.age}
                  placeholder="Ej. 28"
                />
              </View>

              <View style={{ flex: 1.4 }}>
                <CustomInput
                  label="Teléfono Móvil"
                  value={phone}
                  onChangeText={(text) => {
                    const formatted = formatPhoneSV(text);
                    setPhone(formatted);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  keyboardType="phone-pad"
                  maxLength={9}
                  error={errors.phone}
                  placeholder="1234-5678"
                />
              </View>
            </View>

            <CustomInput
              label="Nueva Contraseña (Opcional)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              secureTextEntry
              placeholder="Dejar en blanco si no deseas cambiarla"
              error={errors.password}
            />

            <CustomButton
              title="Guardar Cambios"
              variant="primary"
              loading={saving}
              onPress={handleUpdate}
              style={styles.saveBtn}
              icon={<Ionicons name="save-outline" size={18} color="#FFFFFF" />}
            />

            {/* Tarjeta de Asistencia WhatsApp */}
            <TouchableOpacity
              style={styles.waContactBtn}
              onPress={() => contactWhatsApp({
                customMessage: `Hola Xio's Eventos, soy ${user?.name || 'un cliente'} y deseo consultar sobre cotizaciones para eventos.`
              })}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.waContactText}>Atención al Cliente (+503 {BUSINESS_INFO.phone})</Text>
            </TouchableOpacity>

            <CustomButton
              title="Cerrar Sesión"
              variant="outline"
              onPress={handleLogout}
              style={styles.logoutBtn}
              icon={<Ionicons name="log-out-outline" size={18} color={Colors.primary} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3
  },
  avatarBorder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    borderColor: Colors.primaryDark,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden'
  },
  avatarLogo: {
    width: 76,
    height: 76
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10
  },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12
  },
  badgeTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    width: '100%'
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 10
  },
  waContactBtn: {
    backgroundColor: Colors.whatsapp,
    borderRadius: 16,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  waContactText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  logoutBtn: {
    marginTop: 2
  }
});

export default ProfileScreen;
