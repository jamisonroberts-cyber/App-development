import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';
import { generateWeekForecast } from '../utils/weatherData';
import { getCurrentMonthNotes } from '../utils/monthlyNotes';
import { getPlantsForMonth, IMPORTANCE_MAJOR } from '../utils/forageData';

export default function HomeScreen({ navigation }) {
  const { hives, apiaries, inspections, harvests, getTotalHoneyLbs } = useApp();
  const [forecast, setForecast] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const monthNotes = getCurrentMonthNotes();
  const currentMonth = new Date().getMonth();
  const majorForage = getPlantsForMonth(currentMonth).filter(p => p.importance === IMPORTANCE_MAJOR);

  useEffect(() => {
    setForecast(generateWeekForecast());
  }, []);

  function onRefresh() {
    setRefreshing(true);
    setForecast(generateWeekForecast());
    setTimeout(() => setRefreshing(false), 600);
  }

  const totalHoney = getTotalHoneyLbs();
  const activeHives = hives.filter(h => h.status !== 'Dead' && h.status !== 'Absconded').length;

  const highTasks = monthNotes.tasks.filter(t => t.priority === 'high');

  const today = forecast[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day, Beekeeper! 🐝</Text>
          <Text style={styles.location}>Randolph County, NC</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        </View>
      </View>

      {/* Today's Inspection Rating */}
      {today && (
        <View style={[styles.inspectionBanner, { backgroundColor: today.inspectionRating.color + '18', borderColor: today.inspectionRating.color + '60' }]}>
          <View style={styles.inspectionLeft}>
            <Text style={styles.inspectionEmoji}>{today.inspectionRating.emoji}</Text>
            <View>
              <Text style={styles.inspectionTitle}>Today's Inspection Conditions</Text>
              <Text style={[styles.inspectionRating, { color: today.inspectionRating.color }]}>
                {today.inspectionRating.label}
              </Text>
              <Text style={styles.inspectionTip}>{today.inspectionRating.tip}</Text>
            </View>
          </View>
          <View style={styles.todayWeather}>
            <Text style={styles.todayIcon}>{today.conditionIcon}</Text>
            <Text style={styles.todayTemp}>{today.highTemp}°/{today.lowTemp}°F</Text>
            <Text style={styles.todayWind}>💨 {today.windSpeed}mph</Text>
          </View>
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Apiaries" value={apiaries.length} icon="location" color={colors.primary} />
        <StatCard label="Hives" value={activeHives} icon="layers" color="#5B8A3C" />
        <StatCard label="Honey (lbs)" value={totalHoney.toFixed(1)} icon="water" color="#E8A020" />
      </View>

      {/* 7-Day Forecast */}
      <SectionHeader title="7-Day Forecast" subtitle="Randolph County, NC" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
        {forecast.map((day, i) => (
          <WeatherDayCard key={i} day={day} isToday={i === 0} />
        ))}
      </ScrollView>

      {/* High Priority Tasks */}
      <SectionHeader title={`${monthNotes.month} Priorities`} subtitle="This month's critical tasks" />
      <View style={[styles.card, styles.taskCard]}>
        {highTasks.map((task, i) => (
          <View key={i} style={[styles.taskRow, i < highTasks.length - 1 && styles.taskBorder]}>
            <View style={styles.taskDot} />
            <Text style={styles.taskText}>{task.text}</Text>
          </View>
        ))}
      </View>

      {/* Monthly Forage Note */}
      {majorForage.length > 0 && (
        <>
          <SectionHeader title="Active Forage Now" subtitle="Major sources this month" />
          <View style={styles.card}>
            {majorForage.map((plant, i) => (
              <View key={i} style={[styles.forageRow, i < majorForage.length - 1 && styles.taskBorder]}>
                <View style={[styles.forageDot, { backgroundColor: plant.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.forageName}>{plant.name}</Text>
                  <Text style={styles.forageNote} numberOfLines={2}>{plant.notes}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Monthly Notes */}
      <SectionHeader title="Beekeeper's Notes" subtitle={monthNotes.month} />
      <View style={[styles.card, styles.notesCard]}>
        <Text style={styles.notesBody}>{monthNotes.forageTip}</Text>
        {monthNotes.warning && (
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={16} color={colors.warning} />
            <Text style={styles.warningText}>{monthNotes.warning}</Text>
          </View>
        )}
        {monthNotes.temp && (
          <View style={styles.tempBox}>
            <Ionicons name="thermometer" size={16} color={colors.info} />
            <Text style={styles.tempText}>{monthNotes.temp}</Text>
          </View>
        )}
      </View>

      {/* Recent Inspections */}
      {inspections.length > 0 && (
        <>
          <SectionHeader title="Recent Activity" subtitle="Latest inspections" />
          <View style={styles.card}>
            {inspections
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 4)
              .map((insp, i, arr) => {
                const hive = hives.find(h => h.id === insp.hiveId);
                return (
                  <View key={insp.id} style={[styles.recentRow, i < arr.length - 1 && styles.taskBorder]}>
                    <View style={[styles.recentBadge, { backgroundColor: insp.type === 'quick' ? colors.infoLight : colors.successLight }]}>
                      <Text style={styles.recentBadgeText}>{insp.type === 'quick' ? 'Quick' : 'Full'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentHive} numberOfLines={1}>{hive?.name || 'Unknown Hive'}</Text>
                      <Text style={styles.recentDate}>{new Date(insp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </View>
                    <Text style={styles.recentQueen}>{insp.queenSeen ? '👑 Seen' : insp.eggsPresent ? '🥚 Eggs' : '❓'}</Text>
                  </View>
                );
              })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Ionicons name={icon + '-outline'} size={22} color={color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WeatherDayCard({ day, isToday }) {
  const rating = day.inspectionRating;
  return (
    <View style={[styles.weatherCard, isToday && styles.weatherCardToday]}>
      <Text style={[styles.weatherDay, isToday && styles.weatherDayToday]}>{day.dayLabel}</Text>
      <Text style={styles.weatherDate}>{day.dateLabel}</Text>
      <Text style={styles.weatherIcon}>{day.conditionIcon}</Text>
      <Text style={styles.weatherHigh}>{day.highTemp}°</Text>
      <Text style={styles.weatherLow}>{day.lowTemp}°</Text>
      <View style={[styles.ratingPill, { backgroundColor: rating.color + '22' }]}>
        <Text style={[styles.ratingEmoji]}>{rating.emoji}</Text>
      </View>
      <Text style={[styles.ratingLabel, { color: rating.color }]} numberOfLines={1}>{rating.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: { fontSize: fonts.sizes.xl, fontWeight: '800', color: '#FFF' },
  location: { fontSize: fonts.sizes.sm, color: '#FFF9', marginTop: 2 },
  dateText: { fontSize: fonts.sizes.sm, color: '#FFF9', marginTop: 1 },

  inspectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'space-between',
    ...shadow.sm,
  },
  inspectionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.sm },
  inspectionEmoji: { fontSize: 28 },
  inspectionTitle: { fontSize: fonts.sizes.xs, color: colors.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  inspectionRating: { fontSize: fonts.sizes.lg, fontWeight: '800', marginTop: 1 },
  inspectionTip: { fontSize: fonts.sizes.sm, color: colors.textMid, marginTop: 1 },
  todayWeather: { alignItems: 'flex-end' },
  todayIcon: { fontSize: 24 },
  todayTemp: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text },
  todayWind: { fontSize: fonts.sizes.xs, color: colors.textLight },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 3,
    ...shadow.sm,
  },
  statValue: { fontSize: fonts.sizes.xl, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: fonts.sizes.xs, color: colors.textLight, fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: fonts.sizes.lg, fontWeight: '800', color: colors.text },
  sectionSubtitle: { fontSize: fonts.sizes.xs, color: colors.textLight, fontWeight: '500' },

  forecastScroll: { paddingLeft: spacing.md },
  weatherCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
    width: 82,
    ...shadow.sm,
  },
  weatherCardToday: {
    backgroundColor: colors.primary,
  },
  weatherDay: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text },
  weatherDayToday: { color: '#FFF' },
  weatherDate: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginBottom: 4 },
  weatherIcon: { fontSize: 24, marginVertical: 2 },
  weatherHigh: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  weatherLow: { fontSize: fonts.sizes.xs, color: colors.textLight, marginBottom: 4 },
  ratingPill: { borderRadius: radius.round, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 2 },
  ratingEmoji: { fontSize: 12 },
  ratingLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  taskCard: { padding: spacing.md },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, gap: spacing.sm },
  taskBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  taskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, marginTop: 5 },
  taskText: { flex: 1, fontSize: fonts.sizes.sm, color: colors.textMid, lineHeight: 20 },

  forageRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, gap: spacing.sm },
  forageDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  forageName: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text },
  forageNote: { fontSize: fonts.sizes.xs, color: colors.textLight, marginTop: 1 },

  notesCard: { gap: spacing.sm },
  notesBody: { fontSize: fonts.sizes.sm, color: colors.textMid, lineHeight: 21 },
  warningBox: { flexDirection: 'row', gap: spacing.xs, backgroundColor: colors.warningLight, padding: spacing.sm, borderRadius: radius.sm, alignItems: 'flex-start' },
  warningText: { flex: 1, fontSize: fonts.sizes.sm, color: '#7A4000', lineHeight: 18 },
  tempBox: { flexDirection: 'row', gap: spacing.xs, backgroundColor: colors.infoLight, padding: spacing.sm, borderRadius: radius.sm, alignItems: 'flex-start' },
  tempText: { flex: 1, fontSize: fonts.sizes.sm, color: '#0D47A1', lineHeight: 18 },

  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: spacing.sm },
  recentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.round },
  recentBadgeText: { fontSize: fonts.sizes.xs, fontWeight: '700', color: colors.textMid },
  recentHive: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.text },
  recentDate: { fontSize: fonts.sizes.xs, color: colors.textLight },
  recentQueen: { fontSize: fonts.sizes.sm, color: colors.textMid },
});
