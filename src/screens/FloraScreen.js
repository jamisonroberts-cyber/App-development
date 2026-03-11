import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FLORA_DATA, getPlantsForMonth, MONTH_NAMES, MONTH_SHORT } from '../utils/floraData';
import { colors, spacing, fonts } from '../utils/theme';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const SEASON_LABELS = {
  1: 'Winter', 2: 'Winter', 3: 'Spring', 4: 'Spring', 5: 'Spring',
  6: 'Summer', 7: 'Summer', 8: 'Summer', 9: 'Fall', 10: 'Fall',
  11: 'Fall', 12: 'Winter',
};

function TypeBadge({ type }) {
  const config = {
    pollen: { label: 'Pollen', color: '#F39C12', bg: '#FEF3E2', icon: 'ellipse' },
    nectar: { label: 'Nectar', color: colors.primary, bg: '#FFF3DD', icon: 'water' },
  };
  const c = config[type];
  return (
    <View style={[styles.typeBadge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={10} color={c.color} style={{ marginRight: 4 }} />
      <Text style={[styles.typeBadgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

function PlantCard({ plant }) {
  const bloomText = plant.bloomStart === plant.bloomEnd
    ? MONTH_NAMES[plant.bloomStart]
    : `${MONTH_NAMES[plant.bloomStart]} – ${MONTH_NAMES[plant.bloomEnd]}`;

  return (
    <View style={styles.plantCard}>
      <View style={styles.plantHeader}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <View style={styles.typeBadges}>
          {plant.type.map(t => <TypeBadge key={t} type={t} />)}
        </View>
      </View>
      <View style={styles.bloomRow}>
        <Ionicons name="calendar-outline" size={13} color={colors.textLight} style={{ marginRight: 4 }} />
        <Text style={styles.bloomText}>{bloomText}</Text>
      </View>
      {plant.notes ? <Text style={styles.plantNotes}>{plant.notes}</Text> : null}
    </View>
  );
}

export default function FloraScreen() {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const monthScrollRef = useRef(null);

  const plants = getPlantsForMonth(selectedMonth);
  const season = SEASON_LABELS[selectedMonth];

  useEffect(() => {
    // Auto-scroll to current month
    if (monthScrollRef.current) {
      setTimeout(() => {
        monthScrollRef.current?.scrollTo({ x: (currentMonth - 1) * 60, animated: true });
      }, 300);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Month strip */}
      <View style={styles.monthStripContainer}>
        <ScrollView
          ref={monthScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthStrip}
        >
          {MONTHS.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.monthChip, selectedMonth === m && styles.monthChipActive]}
              onPress={() => setSelectedMonth(m)}
            >
              <Text style={[styles.monthChipText, selectedMonth === m && styles.monthChipTextActive]}>
                {MONTH_SHORT[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Heading */}
        <View style={styles.heading}>
          <View>
            <Text style={styles.monthTitle}>{MONTH_NAMES[selectedMonth]}</Text>
            <Text style={styles.seasonLabel}>{season}</Text>
          </View>
          <Text style={styles.plantCount}>{plants.length} plant{plants.length !== 1 ? 's' : ''} blooming</Text>
        </View>

        {/* "You are here" banner */}
        {selectedMonth === currentMonth && (
          <View style={styles.hereCard}>
            <Ionicons name="location" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.hereText}>
              You are here — {MONTH_NAMES[currentMonth]} {new Date().getFullYear()}
            </Text>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F39C12' }]} />
            <Text style={styles.legendText}>Pollen Producer</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Nectar Producer</Text>
          </View>
        </View>

        {plants.length === 0 ? (
          <View style={styles.emptyMonth}>
            <Ionicons name="leaf-outline" size={44} color={colors.border} />
            <Text style={styles.emptyMonthText}>No major bloom sources this month in the Piedmont Triad. Winter rest period for most plants.</Text>
          </View>
        ) : (
          plants.map(plant => <PlantCard key={plant.name} plant={plant} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  monthStripContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthStrip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 6,
    backgroundColor: colors.background,
  },
  monthChipActive: { backgroundColor: colors.primary },
  monthChipText: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.textLight },
  monthChipTextActive: { color: '#fff' },

  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },

  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md },
  monthTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text },
  seasonLabel: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  plantCount: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: '600' },

  hereCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3DD',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  hereText: { fontSize: fonts.sizes.md, fontWeight: '600', color: colors.text },

  legend: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: fonts.sizes.sm, color: colors.textLight },

  plantCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  plantHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  plantName: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text, flex: 1, marginRight: spacing.sm },
  typeBadges: { flexDirection: 'row', gap: 4 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  bloomRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bloomText: { fontSize: fonts.sizes.sm, color: colors.textLight },
  plantNotes: { fontSize: fonts.sizes.sm, color: colors.textLight, lineHeight: 18 },

  emptyMonth: { alignItems: 'center', paddingTop: spacing.xl },
  emptyMonthText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },
});
