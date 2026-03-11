import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

export default function HiveDetailScreen({ navigation, route }) {
  const { hives, getHiveInspections, getHiveHarvests, getHiveInventoryCost } = useApp();
  const { hiveId } = route.params;
  const hive = hives.find(h => h.id === hiveId);
  const [tab, setTab] = useState('info');

  if (!hive) return null;

  const inspections = getHiveInspections(hiveId);
  const harvests = getHiveHarvests(hiveId);
  const totalHoney = harvests.reduce((sum, h) => sum + (parseFloat(h.amountKg) || 0), 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.hiveHeader}>
        <View style={styles.hiveHeaderLeft}>
          <Text style={styles.hiveName}>{hive.name}</Text>
          <Text style={styles.hiveType}>{hive.type} · Est. {hive.established || '?'}</Text>
        </View>
        <View style={[styles.healthBadge, { backgroundColor: healthColor(hive.health) }]}>
          <Text style={styles.healthText}>{hive.health}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['info', 'inspections', 'harvests', 'inventory'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}>
        {tab === 'info' && (
          <View>
            <InfoRow icon="location-outline" label="Location" value={hive.location || 'Not set'} />
            <InfoRow icon="female-outline" label="Queen Year" value={hive.queenYear || 'Unknown'} />
            <InfoRow icon="clipboard-outline" label="Inspections" value={inspections.length.toString()} />
            <InfoRow icon="water-outline" label="Total Honey" value={`${totalHoney.toFixed(1)} kg`} />
            {hive.notes ? (
              <View style={styles.notesCard}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{hive.notes}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditHive', { hiveId })}>
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit Hive</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'inspections' && (
          <View>
            {inspections.length === 0 ? (
              <EmptyTab icon="clipboard-outline" text="No inspections yet" />
            ) : (
              inspections.map(insp => (
                <View key={insp.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardDate}>{new Date(insp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    <View style={[styles.pill, { backgroundColor: insp.queenSeen ? colors.success : colors.warning }]}>
                      <Text style={styles.pillText}>{insp.queenSeen ? 'Queen seen' : 'No queen'}</Text>
                    </View>
                  </View>
                  <View style={styles.inspRow}>
                    <InspItem label="Frames" value={insp.frames || '-'} />
                    <InspItem label="Brood" value={insp.brood || '-'} />
                    <InspItem label="Temper" value={insp.temperament || '-'} />
                  </View>
                  {/* AI flags */}
                  {insp.aiFlags && insp.aiFlags.length > 0 && (
                    <View style={styles.aiFlagsCard}>
                      <View style={styles.aiFlagsHeader}>
                        <Ionicons name="warning-outline" size={14} color={colors.warning} style={{ marginRight: 4 }} />
                        <Text style={styles.aiFlagsTitle}>AI Flags ({insp.aiFlags.length})</Text>
                      </View>
                      {insp.aiFlags.map((flag, i) => (
                        <Text key={i} style={styles.aiFlagText}>• {flag}</Text>
                      ))}
                    </View>
                  )}
                  {insp.notes ? <Text style={styles.cardNotes}>{insp.notes}</Text> : null}
                </View>
              ))
            )}
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddInspection', { hiveId })}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Inspection</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'harvests' && (
          <View>
            {harvests.length === 0 ? (
              <EmptyTab icon="water-outline" text="No harvests recorded" />
            ) : (
              harvests.map(h => (
                <View key={h.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardDate}>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    <Text style={styles.harvestAmount}>{h.amountKg} kg</Text>
                  </View>
                  {h.honeyType ? <Text style={styles.honeyType}>{h.honeyType}</Text> : null}
                  {h.notes ? <Text style={styles.cardNotes}>{h.notes}</Text> : null}
                </View>
              ))
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Harvested</Text>
              <Text style={styles.totalValue}>{totalHoney.toFixed(2)} kg</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddHarvest', { hiveId })}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Record Harvest</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'inventory' && (
          <View>
            <View style={styles.costSummaryCard}>
              <Text style={styles.costSummaryLabel}>Total Investment in This Hive</Text>
              <Text style={styles.costSummaryValue}>${getHiveInventoryCost(hiveId).toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('HiveInventory', { hiveId, hiveName: hive.name })}
            >
              <Ionicons name="cube-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Manage Hive Inventory</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function InspItem({ label, value }) {
  return (
    <View style={styles.inspItem}>
      <Text style={styles.inspValue}>{value}</Text>
      <Text style={styles.inspLabel}>{label}</Text>
    </View>
  );
}

function EmptyTab({ icon, text }) {
  return (
    <View style={styles.emptyTab}>
      <Ionicons name={icon} size={40} color={colors.border} />
      <Text style={styles.emptyTabText}>{text}</Text>
    </View>
  );
}

function healthColor(health) {
  switch (health) {
    case 'Excellent': return colors.success;
    case 'Good': return '#8BC34A';
    case 'Fair': return colors.warning;
    case 'Poor': return colors.danger;
    default: return colors.border;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiveHeader: {
    backgroundColor: colors.surface, padding: spacing.md, flexDirection: 'row',
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  hiveHeaderLeft: { flex: 1 },
  hiveName: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.text },
  hiveType: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  healthBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  healthText: { color: '#fff', fontSize: fonts.sizes.sm, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: fonts.sizes.sm, color: colors.textLight, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  body: { flex: 1 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    padding: spacing.md, marginBottom: 2, gap: spacing.sm,
  },
  infoLabel: { flex: 1, fontSize: fonts.sizes.md, color: colors.text },
  infoValue: { fontSize: fonts.sizes.md, color: colors.textLight, fontWeight: '600' },
  notesCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginTop: spacing.sm },
  notesLabel: { fontSize: fonts.sizes.sm, color: colors.textLight, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  notesText: { fontSize: fonts.sizes.md, color: colors.text },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center', padding: spacing.md, marginTop: spacing.md },
  editButtonText: { fontSize: fonts.sizes.md, color: colors.primary, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardDate: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  pill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  inspRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  inspItem: { flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: spacing.xs, alignItems: 'center' },
  inspValue: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  inspLabel: { fontSize: 11, color: colors.textLight },
  cardNotes: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: spacing.xs },
  harvestAmount: { fontSize: fonts.sizes.lg, fontWeight: 'bold', color: colors.success },
  honeyType: { fontSize: fonts.sizes.sm, color: colors.textLight },
  totalRow: { backgroundColor: colors.primary + '20', borderRadius: 12, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  totalLabel: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.success },
  addButton: {
    backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
  },
  addButtonText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700' },
  emptyTab: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyTabText: { fontSize: fonts.sizes.md, color: colors.textLight },
  aiFlagsCard: {
    backgroundColor: '#FEF3E2',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  aiFlagsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  aiFlagsTitle: { fontSize: 12, fontWeight: '700', color: colors.warning },
  aiFlagText: { fontSize: 12, color: colors.text, marginBottom: 2 },
  costSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  costSummaryLabel: { fontSize: fonts.sizes.sm, color: colors.textLight, marginBottom: 6 },
  costSummaryValue: { fontSize: fonts.sizes.xxl, fontWeight: '700', color: colors.success },
});
