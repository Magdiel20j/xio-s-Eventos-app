import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/colors';

export const RatingStars = ({ rating = 0, size = 16, interactive = false, onRatingChange, showNumber = true }) => {
  const stars = [1, 2, 3, 4, 5];

  const handlePress = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {stars.map((star) => {
          const isFilled = star <= Math.round(rating);
          return (
            <TouchableOpacity
              key={star}
              disabled={!interactive}
              onPress={() => handlePress(star)}
              activeOpacity={0.7}
              style={{ marginHorizontal: 1 }}
            >
              <Ionicons
                name={isFilled ? 'star' : 'star-outline'}
                size={size}
                color={isFilled ? Colors.gold : '#CED4DA'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {showNumber && !interactive && (
        <Text style={[styles.ratingText, { fontSize: size * 0.85 }]}>
          {Number(rating).toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    marginLeft: 5,
    fontWeight: '700',
    color: Colors.textSecondary
  }
});

export default RatingStars;
