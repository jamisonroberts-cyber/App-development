import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

export default function DashboardScreen({ navigation }) {
  const { hives, inspections, harvests } = useApp();

  const totalHoney = harvests.reduce((sum, h) => sum + (parseFloat(h.amountKg) || 0), 0);
  const recentInspections = inspections.slice(-5).reverse();

  const healthCounts = hives.reduce((acc, h) => {
    acc[h.health] = (acc[h.health] || 0) + 1;
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good day, Beekeeper!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard icon="layers-outline" label="Hives" value={hives.length} color={colors.primary} />
        <StatCard icon="clipboard-outline" label="Inspections" value={inspections.length} color={colors.info} />
        <StatCard icon="beaker-outline" label="Honey (kg)" value={totalHoney.toFixed(1)} color={colors.success} />
      </View>

      {/* Hive Health */}
      {hives.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hive Health Overview</Text>
          <View style={styles.card}>
            {Object.entries(healthCounts).map(([health, count]) => (
              <View key={health} style={styles.healthRow}>
                <View style={[styles.healthDot, { backgroundColor: healthColor(health) }]} />
                <Text style={styles.healthLabel}>{health}</Text>
                <Text style={styles.healthCount}>{count} hive{count !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <QuickAction icon="add-circle" label="Add Hive" color={colors.primary} onPress={() => navigation.navigate('Hives', { screen: 'AddHive' })} />
          <QuickAction icon="search" label="Inspect" color={colors.info} onPress={() => navigation.navigate('Inspections')} />
          <QuickAction icon="water" label="Harvest" color={colors.success} onPress={() => navigation.navigate('Harvests')} />
        </View>
      </View>

      {/* Recent Inspections */}
      {recentInspections.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Inspections</Text>
          <View style={styles.card}>
            {recentInspections.map(insp => {
              const hive = hives.find(h => h.id === insp.hiveId);
              return (
                <View key={insp.id} style={styles.recentRow}>
                  <Ionicons name="clipboard-outline" size={18} color={colors.textLight} />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle}>{hive?.name || 'Unknown Hive'}</Text>
                    <Text style={styles.recentDate}>{new Date(insp.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.recentHealth} numberOfLines={1}>{insp.queenSeen ? 'Queen seen' : 'No queen'}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {hives.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐝</Text>
          <Text style={styles.emptyTitle}>Welcome to BeeKeeper!</Text>
          <Text style={styles.emptyText}>Add your first hive to get started tracking your colony.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Hives', { screen: 'AddHive' })}>
            <Text style={styles.emptyButtonText}>Add First Hive</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function healthColor(health) {
  switch (health) {
    case 'Excellent': return colors.success;
    case 'Good': return '#8BC34A';
    case 'Fair': return colors.warning;
    case 'Poor': return colors.danger;
    default: return colors.textLight;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.lg },
  greeting: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.text },
  date: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 12,
    padding: spacing.sm, alignItems: 'center', borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.text, marginTop: 4 },
  statLabel: { fontSize: fonts.sizes.sm - 1, color: colors.textLight },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  healthRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  healthDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  healthLabel: { flex: 1, fontSize: fonts.sizes.md, color: colors.text },
  healthCount: { fontSize: fonts.sizes.sm, color: colors.textLight },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  quickAction: { alignItems: 'center', gap: spacing.xs },
  quickActionIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  quickActionLabel: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600' },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: fonts.sizes.md, fontWeight: '600', color: colors.text },
  recentDate: { fontSize: fonts.sizes.sm, color: colors.textLight },
  recentHealth: { fontSize: fonts.sizes.sm, color: colors.textLight },
  emptyState: { alignItems: 'center', paddingTop: spacing.xl, paddingHorizontal: spacing.lg },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: fonts.sizes.lg, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center', marginBottom: spacing.lg },
  emptyButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 12 },
  emptyButtonText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700' },
});
