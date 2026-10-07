import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export const StockBadge = ({ stock }) => {
  let badgeText = '';
  let badgeColor = Colors.success;
  let bgTint = '#E6F9F3';

  if (stock <= 0) {
    badgeText = 'Agotado';
    badgeColor = Colors.danger;
    bgTint = '#FDE8ED';
  } else if (stock <= 4) {
    badgeText = `¡Últimas ${stock} unid.!`;
    badgeColor = '#D97706';
    bgTint = '#FEF3C7';
  } else {
    badgeText = `${stock} en stock`;
    badgeColor = Colors.success;
    bgTint = '#E6F9F3';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgTint, borderColor: badgeColor }]}>
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text style={[styles.text, { color: badgeColor }]}>{badgeText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  text: {
    fontSize: 11,
    fontWeight: '700'
  }
});

export default StockBadge;
