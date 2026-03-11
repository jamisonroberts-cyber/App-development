import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { fetchWeatherForecast } from '../utils/weatherApi';
import { colors, spacing, fonts } from '../utils/theme';
import { WEATHER_CITY } from '../utils/config';

const RATING_CONFIG = {
  Good: {
    color: colors.success,
    bg: '#EBF5E1',
    icon: 'checkmark-circle',
    message: 'Great day to inspect',
  },
  Marginal: {
    color: colors.warning,
    bg: '#FEF3E2',
    icon: 'alert-circle',
    message: 'Inspect with caution',
  },
  Bad: {
    color: colors.danger,
    bg: '#FDECEA',
    icon: 'close-circle',
    message: 'Not ideal for inspections',
  },
};

function TodayCard({ day }) {
  const cfg = RATING_CONFIG[day.rating];
  return (
    <View style={[styles.todayCard, { borderLeftColor: cfg.color }]}>
      <View style={styles.todayTop}>
        <View>
          <Text style={styles.todayLabel}>TODAY</Text>
          <Text style={styles.todayDay}>{day.dayName}</Text>
          <Text style={styles.todayDate}>{new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={styles.todayRight}>
          <Ionicons name={day.icon} size={52} color={cfg.color} />
          <Text style={[styles.todayTemp, { color: colors.text }]}>{day.tempMax}° / {day.tempMin}°</Text>
        </View>
      </View>
      <View style={styles.todayDivider} />
      <View style={[styles.ratingBadge, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={18} color={cfg.color} style={{ marginRight: 6 }} />
        <Text style={[styles.ratingText, { color: cfg.color }]}>{cfg.message}</Text>
      </View>
      <Text style={styles.todayDescription}>{day.description}</Text>
    </View>
  );
}

function DayCard({ day }) {
  const cfg = RATING_CONFIG[day.rating];
  return (
    <View style={[styles.dayCard, { borderTopColor: cfg.color }]}>
      <Text style={styles.dayName}>{day.dayName}</Text>
      <Ionicons name={day.icon} size={24} color={cfg.color} style={{ marginVertical: 6 }} />
      <Text style={styles.dayTemp}>{day.tempMax}°</Text>
      <Text style={styles.dayTempMin}>{day.tempMin}°</Text>
      <View style={[styles.dayRatingDot, { backgroundColor: cfg.color }]} />
    </View>
  );
}

export default function HomeScreen() {
  const { hives, inspections, getTotalHoneyKg } = useApp();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherForecast();
      setForecast(data);
    } catch (e) {
      setError('Could not load weather. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const lastInspection = inspections.length > 0
    ? inspections.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  const lastInspectionText = lastInspection
    ? new Date(lastInspection.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'None yet';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Weather & Inspection Outlook</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={13} color={colors.textLight} /> {WEATHER_CITY}
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading forecast...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="cloud-offline-outline" size={36} color={colors.textLight} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {forecast && !loading && (
          <>
            <TodayCard day={forecast[0]} />

            <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
              {forecast.map((day, i) => (
                <DayCard key={day.date} day={day} />
              ))}
            </ScrollView>

            <View style={styles.legendRow}>
              {Object.entries(RATING_CONFIG).map(([rating, cfg]) => (
                <View key={rating} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
                  <Text style={styles.legendLabel}>{rating}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="layers-outline" size={22} color={colors.primary} />
            <Text style={styles.statValue}>{hives.length}</Text>
            <Text style={styles.statLabel}>Total Hives</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="clipboard-outline" size={22} color={colors.primary} />
            <Text style={styles.statValue}>{lastInspectionText}</Text>
            <Text style={styles.statLabel}>Last Inspection</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="water-outline" size={22} color={colors.primary} />
            <Text style={styles.statValue}>{getTotalHoneyKg().toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>Honey This Year</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },

  header: { marginBottom: spacing.md },
  greeting: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text },
  location: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },

  loadingBox: { alignItems: 'center', paddingVertical: spacing.xl },
  loadingText: { marginTop: spacing.sm, color: colors.textLight, fontSize: fonts.sizes.md },

  errorBox: { alignItems: 'center', paddingVertical: spacing.xl },
  errorText: { color: colors.textLight, fontSize: fonts.sizes.md, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: fonts.sizes.md },

  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  todayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  todayLabel: { fontSize: 11, fontWeight: '700', color: colors.textLight, letterSpacing: 1, marginBottom: 2 },
  todayDay: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text },
  todayDate: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  todayRight: { alignItems: 'center' },
  todayTemp: { fontSize: fonts.sizes.md, fontWeight: '600', marginTop: 4 },
  todayDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  ratingText: { fontWeight: '700', fontSize: fonts.sizes.md },
  todayDescription: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },

  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  forecastScroll: { marginBottom: spacing.sm },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 72,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dayName: { fontSize: 12, fontWeight: '600', color: colors.textLight },
  dayTemp: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  dayTempMin: { fontSize: fonts.sizes.sm, color: colors.textLight },
  dayRatingDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendLabel: { fontSize: fonts.sizes.sm, color: colors.textLight },

  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text, marginTop: 6, textAlign: 'center' },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2, textAlign: 'center' },
});
