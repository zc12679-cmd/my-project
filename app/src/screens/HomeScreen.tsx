import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FiltersSheet from '../components/FiltersSheet';
import RestaurantCard from '../components/RestaurantCard';
import { usePreferences } from '../context/PreferencesContext';
import { useRestaurantPicker } from '../hooks/useRestaurantPicker';
import { Restaurant } from '../types/restaurant';
import { haversineDistance } from '../utils/location';
import { formatDistance, formatPriceLevel } from '../utils/text';

const HomeScreen: React.FC = () => {
  const { filters, toggleFavorite, toggleBlacklist, favorites, blacklist } = usePreferences();
  const [location, setLocation] = useState<Location.LocationObject | undefined>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFiltersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          setHasPermission(false);
          Alert.alert('需要定位權限', '請到設定中開啟定位權限');
          return;
        }
        setHasPermission(true);
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(current);
      } catch (error) {
        console.error('Failed to acquire location', error);
        setHasPermission(false);
        Alert.alert('定位失敗', '暫時無法取得您的定位，請稍後再試。');
      }
    })();
  }, []);

  const picker = useRestaurantPicker({
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
    filters,
    blacklist,
  });

  const currentRestaurant: Restaurant | undefined = useMemo(() => {
    if (!picker.current || !location) {
      return picker.current;
    }
    return {
      ...picker.current,
      distanceMeters: haversineDistance(
        { lat: location.coords.latitude, lng: location.coords.longitude },
        picker.current.location,
      ),
    };
  }, [picker.current, location]);

  const onNavigate = () => {
    if (!currentRestaurant) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentRestaurant.location.lat},${currentRestaurant.location.lng}&destination_place_id=${currentRestaurant.id}`;
    Linking.openURL(url).catch(() => Alert.alert('無法開啟 Google Maps'));
  };

  const onCall = () => {
    if (!currentRestaurant?.phoneNumber) return;
    Linking.openURL(`tel:${currentRestaurant.phoneNumber}`).catch(() =>
      Alert.alert('無法撥打電話'),
    );
  };

  const onOpenWebsite = () => {
    if (!currentRestaurant?.website) return;
    Linking.openURL(currentRestaurant.website).catch(() => Alert.alert('無法開啟網站'));
  };

  const onFavorite = () => {
    if (!currentRestaurant) return;
    toggleFavorite(currentRestaurant.id);
  };

  const onDislike = () => {
    if (!currentRestaurant) return;
    toggleBlacklist(currentRestaurant.id);
    picker.refresh().catch(() => {
      /* handled via hook state */
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>附近吃什麼？</Text>
          <Text style={styles.subheading}>按一下，幫你隨機推薦高評價餐廳</Text>
        </View>
        <Pressable style={styles.filterButton} onPress={() => setFiltersOpen(true)}>
          <Text style={styles.filterButtonText}>調整條件</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!hasPermission && hasPermission !== null && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>需要定位權限</Text>
            <Text style={styles.emptyStateDescription}>開啟定位才能推薦附近的餐廳唷！</Text>
          </View>
        )}
        {picker.loading && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>正在為你尋找美食…</Text>
          </View>
        )}
        {picker.error && !picker.loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>哎呀！</Text>
            <Text style={styles.emptyStateDescription}>{picker.error}</Text>
            <Pressable style={styles.primaryButton} onPress={picker.refresh}>
              <Text style={styles.primaryButtonText}>重新搜尋</Text>
            </Pressable>
          </View>
        )}
        {currentRestaurant && !picker.loading && (
          <RestaurantCard
            restaurant={currentRestaurant}
            onNavigate={onNavigate}
            onCall={onCall}
            onOpenWebsite={onOpenWebsite}
            onReroll={picker.reroll}
            onFavorite={onFavorite}
            onDislike={onDislike}
            isFavorite={favorites.includes(currentRestaurant.id)}
            isBlacklisted={blacklist.includes(currentRestaurant.id)}
          />
        )}
        {!picker.loading && !currentRestaurant && hasPermission && (
          <Pressable style={styles.primaryButton} onPress={picker.refresh}>
            <Text style={styles.primaryButtonText}>開始抽餐廳</Text>
          </Pressable>
        )}
        {picker.history.length > 1 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>最近抽過</Text>
            {picker.history.slice(1, 6).map((restaurant) => (
              <View key={restaurant.id} style={styles.historyItem}>
                <Text style={styles.historyName}>{restaurant.name}</Text>
                <Text style={styles.historyMeta}>
                  {[
                    formatPriceLevel(restaurant.priceLevel),
                    `${restaurant.rating.toFixed(1)} 星`,
                    formatDistance(restaurant.distanceMeters),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <FiltersSheet visible={isFiltersOpen} onClose={() => setFiltersOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subheading: {
    color: '#475569',
    marginTop: 4,
  },
  filterButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  loadingState: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#1e293b',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  emptyStateDescription: {
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    gap: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 4,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  historyMeta: {
    color: '#475569',
    fontSize: 13,
  },
});

export default HomeScreen;
