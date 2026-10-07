import React, { useState, useContext, useEffect } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AuthContext } from '../context/AuthContext';

export const VerificationCodeScreen = ({ navigation, route }) => {
  const { verifyCode, pendingAuth, setPendingAuth } = useContext(AuthContext);

  const email = route.params?.email || pendingAuth?.email || '';
  const role = route.params?.role || pendingAuth?.role || 'client';
  const initialCode = route.params?.verificationCode || pendingAuth?.verificationCode || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState(initialCode);

  useEffect(() => {
    if (initialCode) {
      setDemoCode(initialCode);
    }
  }, [initialCode]);

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Código Requerido', 'Por favor ingresa el código de 6 dígitos.');
      return;
    }

    if (code.trim().length !== 6) {
      Alert.alert('Código Incompleto', 'El código de seguridad debe tener exactamente 6 dígitos.');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyCode(email, code.trim());

      if (res.success) {
        if (res.user.role === 'admin') {
          navigation.replace('AdminTabs');
        } else {
          navigation.replace('MainTabs');
        }
      } else {
        Alert.alert(
          'Código Inválido',
          res.message || 'El código ingresado no es válido. Puedes usar el código maestro 123456.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servicio de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoCode = () => {
    if (demoCode) {
      setCode(demoCode);
    } else {
      setCode('123456');
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
            <Ionicons
              name={role === 'admin' ? 'shield-checkmark' : 'key-outline'}
              size={40}
              color={role === 'admin' ? Colors.primaryDark : Colors.primary}
            />
          </View>
          <Text style={styles.title}>
            {role === 'admin' ? 'Verificación de Administrador' : 'Verificación de Seguridad'}
          </Text>
          <Text style={styles.subtitle}>
            Hemos generado un código de verificación obligatorio para validar tu acceso a la app.
          </Text>
          <Text style={styles.emailBadge}>{email}</Text>
        </View>

        <View style={styles.card}>
          {/* Banner demostrativo del código para pruebas instantáneas */}
          <TouchableOpacity
            style={styles.demoBox}
            activeOpacity={0.8}
            onPress={handleUseDemoCode}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.primaryDark} style={{ marginRight: 6 }} />
              <Text style={styles.demoTitle}>Código de verificación generado:</Text>
            </View>
            <Text style={styles.demoCodeText}>{demoCode || '123456'}</Text>
            <Text style={styles.demoTip}>Toca aquí para autocompletar este código</Text>
          </TouchableOpacity>

          <CustomInput
            label="Código de 6 Dígitos"
            placeholder="123456"
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />

          <CustomButton
            title="Validar y Acceder"
            variant={role === 'admin' ? 'purple' : 'primary'}
            loading={loading}
            onPress={handleVerify}
            style={styles.verifyBtn}
            icon={<Ionicons name="checkmark-done" size={18} color="#FFFFFF" />}
          />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setPendingAuth(null);
              navigation.replace('Login');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color={Colors.secondary} style={{ marginRight: 6 }} />
            <Text style={styles.backText}>Volver a iniciar sesión</Text>
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
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE0EB',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
    marginBottom: 10
  },
  emailBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD1E3'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border
  },
  demoBox: {
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark
  },
  demoCodeText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 4,
    marginVertical: 4
  },
  demoTip: {
    fontSize: 11,
    color: Colors.textSecondary,
    textDecorationLine: 'underline'
  },
  verifyBtn: {
    marginTop: 8,
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

export default VerificationCodeScreen;
