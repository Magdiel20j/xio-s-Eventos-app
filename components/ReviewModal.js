import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';
import RatingStars from './RatingStars';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';

export const ReviewModal = ({ visible, onClose, onSubmit, productName }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Por favor escribe tu opinión sobre este servicio.');
      return;
    }
    if (rating < 1 || rating > 5) {
      Alert.alert('Valoración requerida', 'Por favor selecciona una calificación entre 1 y 5 estrellas.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit({ rating, comment: comment.trim() });
      setComment('');
      setRating(5);
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo enviar la reseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Calificar Servicio</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Cerrar modal">
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>

          <Text style={styles.subtitle}>
            ¿Cómo fue tu experiencia en tu evento?
          </Text>

          <View style={styles.starsContainer}>
            <RatingStars
              rating={rating}
              size={36}
              interactive={true}
              onRatingChange={(newVal) => setRating(newVal)}
              showNumber={false}
            />
            <Text style={styles.ratingNumberText}>{rating} de 5 Estrellas</Text>
          </View>

          <CustomInput
            label="Tu Reseña"
            placeholder="Cuéntanos qué te pareció la diversión, animación o calidad..."
            value={comment}
            onChangeText={(text) => {
              setComment(text);
              if (error) setError('');
            }}
            multiline
            numberOfLines={4}
            error={error}
          />

          <View style={styles.actions}>
            <CustomButton
              title="Cancelar"
              variant="outline"
              onPress={onClose}
              style={styles.cancelBtn}
            />
            <CustomButton
              title="Publicar Reseña"
              variant="primary"
              loading={submitting}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 31, 31, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 22,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  closeBtn: {
    padding: 4
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  ratingNumberText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  cancelBtn: {
    flex: 1,
    marginRight: 10,
    height: 48
  },
  submitBtn: {
    flex: 1.5,
    height: 48
  }
});

export default ReviewModal;
