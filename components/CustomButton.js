import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Colors from '../constants/colors';

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'purple' | 'outline' | 'danger' | 'accent' | 'disabled'
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle
}) => {
  const isButtonDisabled = disabled || variant === 'disabled';

  let bgStyle = styles.primary;
  let textVariantStyle = styles.textPrimary;

  if (variant === 'secondary') {
    bgStyle = styles.secondary;
    textVariantStyle = styles.textSecondary;
  } else if (variant === 'purple') {
    bgStyle = styles.purple;
    textVariantStyle = styles.textPurple;
  } else if (variant === 'accent') {
    bgStyle = styles.accent;
    textVariantStyle = styles.textAccent;
  } else if (variant === 'outline') {
    bgStyle = styles.outline;
    textVariantStyle = styles.textOutline;
  } else if (variant === 'danger') {
    bgStyle = styles.danger;
    textVariantStyle = styles.textDanger;
  } else if (variant === 'disabled') {
    bgStyle = styles.disabled;
    textVariantStyle = styles.textDisabled;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isButtonDisabled || loading}
      style={[
        styles.button,
        bgStyle,
        isButtonDisabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#FFFFFF'} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, textVariantStyle, isButtonDisabled && styles.textDisabled, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    marginRight: 8
  },
  primary: {
    backgroundColor: Colors.primary // Rosa Fiesta #FF2A8A
  },
  secondary: {
    backgroundColor: Colors.secondary // Naranja #FF8C00
  },
  purple: {
    backgroundColor: Colors.primaryDark // Morado Vibrante #5E17EB
  },
  accent: {
    backgroundColor: Colors.accent // Celeste #00C2FF
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    elevation: 0,
    shadowOpacity: 0
  },
  danger: {
    backgroundColor: Colors.danger
  },
  disabled: {
    backgroundColor: '#E9ECEF',
    borderColor: '#E9ECEF',
    opacity: 0.8,
    elevation: 0,
    shadowOpacity: 0
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  textPrimary: {
    color: '#FFFFFF'
  },
  textSecondary: {
    color: '#FFFFFF'
  },
  textPurple: {
    color: '#FFFFFF'
  },
  textAccent: {
    color: '#FFFFFF'
  },
  textOutline: {
    color: Colors.primary
  },
  textDanger: {
    color: '#FFFFFF'
  },
  textDisabled: {
    color: '#6C757D'
  }
});

export default CustomButton;
