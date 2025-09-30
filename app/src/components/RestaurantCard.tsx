import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Restaurant } from '../types/restaurant';
import { formatDistance, formatPriceLevel } from '../utils/text';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onNavigate: () => void;
  onCall: () => void;
  onOpenWebsite: () => void;
  onReroll: () => void;
  onFavorite: () => void;
  onDislike: () => void;
  isFavorite: boolean;
  isBlacklisted: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onNavigate,
  onCall,
  onOpenWebsite,
  onReroll,
  onFavorite,
  onDislike,
  isFavorite,
  isBlacklisted,
}) => {
  return (
    <View style={styles.card}>
      {restaurant.photoUrl ? (
        <Image source={{ uri: restaurant.photoUrl }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Ionicons name="restaurant" size={32} color="#888" />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#facc15" />
          <Text style={styles.ratingText}>
            {restaurant.rating.toFixed(1)} · {restaurant.userRatingsTotal} 則評論
          </Text>
        </View>
        <Text style={styles.meta}>
          {[formatPriceLevel(restaurant.priceLevel), formatDistance(restaurant.distanceMeters)]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <Text style={styles.address}>{restaurant.address}</Text>
        <View style={styles.actionRow}>
          <ActionButton icon="navigate" label="導航" onPress={onNavigate} />
          <ActionButton icon="call" label="打電話" onPress={onCall} disabled={!restaurant.phoneNumber} />
          <ActionButton icon="globe" label="網站" onPress={onOpenWebsite} disabled={!restaurant.website} />
          <ActionButton icon="refresh" label="再抽" onPress={onReroll} />
        </View>
        <View style={styles.footerRow}>
          <Pressable style={styles.footerButton} onPress={onFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color="#ef4444" />
            <Text style={styles.footerButtonText}>{isFavorite ? '已收藏' : '收藏'}</Text>
          </Pressable>
          <Pressable style={styles.footerButton} onPress={onDislike}>
            <Ionicons name={isBlacklisted ? 'ban' : 'thumbs-down'} size={20} color="#6b7280" />
            <Text style={styles.footerButtonText}>{isBlacklisted ? '已排除' : '不喜歡'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, disabled }) => (
  <Pressable style={[styles.actionButton, disabled && styles.actionButtonDisabled]} onPress={onPress} disabled={disabled}>
    <Ionicons name={icon} size={18} color={disabled ? '#9ca3af' : '#2563eb'} />
    <Text style={[styles.actionButtonText, disabled && styles.actionButtonTextDisabled]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  photo: {
    width: '100%',
    height: 180,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#4b5563',
    fontSize: 14,
  },
  meta: {
    color: '#6b7280',
    fontSize: 13,
  },
  address: {
    color: '#4b5563',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
  },
  actionButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  actionButtonText: {
    color: '#1d4ed8',
    fontSize: 13,
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerButtonText: {
    color: '#374151',
    fontSize: 14,
  },
});

export default RestaurantCard;
