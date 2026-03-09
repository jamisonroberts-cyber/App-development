import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';

export default function HiveDetailScreen({ route, navigation }) {
  const { hiveId } = route.params;
  const { hives, apiaries, getHiveInspections, getHiveHarvests, deleteInspection, deleteHarvest, addHarvest } = useApp();
  const hive = hives.find(h => h.id === hiveId);
  const inspections = getHiveInspections(hiveId);
  const harvests = getHiveHarvests(hiveId);

  const [tab, setTab] = useState('overview');

  if (!hive) return null;

  const apiary = apiaries.find(a => a.id === hive.apiaryId);
  const totalHoney = harvests.reduce((s, h) => s + (parseFloat(h.amountLbs) || 0), 0);
  const latestInspection = inspections[0] || null;

  const statusColor = {
    Active: colors.success, Weak: colors.warning,
    'Queen Issues': colors.danger, Deadout: '#888', Absconded: '#888',
  }[hive.status] || colors.textLight;

  return (
    <View style={styles.container}>
      {/* Hive Header */}
      <View style={[styles.hiveHeader, { borderBottomColor: hive.color || colors.primary }]}>
        <View style={[styles.hiveColorAccent, { backgroundColor: hive.color || colors.primary }]} />
        <View style={styles.hiveHeaderContent}>
          <View style={styles.hiveHeaderTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hiveName}>{hive.name}</Text>
              <Text style={styles.hiveType}>{hive.type} {apiary ? `• ${apiary.name}` : ''}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{hive.status || 'Active'}</Text>
            </View>
          </View>
          <View style={styles.hiveStats}>
            <StatPill label="Inspections" value={inspections.length} />
            <StatPill label="Harvests" value={harvests.length} />
            <StatPill label="Honey (lbs)" value={totalHoney.toFixed(1)} color={colors.primary} />
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {['overview','inspections','harvests'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <>
            <InfoSection title="Queen Information">
              <InfoRow label="Breed / Genetics" value={hive.queenBreed || '—'} />
              <InfoRow label="Source" value={hive.queenSource || '—'} />
              <InfoRow label="Year" value={hive.queenYear || '—'} />
              <InfoRow label="Marked" value={hive.queenMarked ? `Yes — ${hive.queenColor || 'Color not set'}` : 'No'} />
            </InfoSection>

            <InfoSection title="Equipment">
              <InfoRow label="Hive Type" value={hive.type || '—'} />
              <InfoRow label="Box Configuration" value={hive.boxes || '—'} />
              <InfoRow label="Last Weight" value={hive.weight ? `${hive.weight} lbs` : '—'} />
              <InfoRow label="Established" value={hive.established || '—'} />
            </InfoSection>

            {hive.notes ? (
              <InfoSection title="Notes">
                <Text style={styles.notes}>{hive.notes}</Text>
              </InfoSection>
            ) : null}

            {latestInspection && (
              <InfoSection title="Last Inspection Summary">
                <InfoRow label="Date" value={new Date(latestInspection.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                <InfoRow label="Type" value={latestInspection.type === 'quick' ? 'Quick Check' : 'Full Inspection'} />
                <InfoRow label="Queen Seen" value={latestInspection.queenSeen ? 'Yes' : latestInspection.eggsPresent ? 'No (eggs present)' : 'No'} />
                {latestInspection.miteCount ? <InfoRow label="Mite Count" value={`${latestInspection.miteCount}% (${latestInspection.miteMethod || 'wash'})`} warning={parseFloat(latestInspection.miteCount) >= 2} /> : null}
                {latestInspection.notes ? <InfoRow label="Notes" value={latestInspection.notes} /> : null}
              </InfoSection>
            )}

            {/* Inspection Buttons */}
            <View style={styles.inspectBtnRow}>
              <TouchableOpacity style={styles.quickInspBtn} onPress={() => navigation.navigate('QuickInspection', { hiveId })}>
                <Ionicons name="flash" size={20} color={colors.primary} />
                <Text style={styles.quickInspBtnText}>Quick Check</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fullInspBtn} onPress={() => navigation.navigate('DetailedInspection', { hiveId })}>
                <Ionicons name="clipboard" size={20} color="#FFF" />
                <Text style={styles.fullInspBtnText}>Full Inspection</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* INSPECTIONS TAB */}
        {tab === 'inspections' && (
          <>
            <View style={styles.inspectBtnRow}>
              <TouchableOpacity style={styles.quickInspBtn} onPress={() => navigation.navigate('QuickInspection', { hiveId })}>
                <Ionicons name="flash" size={18} color={colors.primary} />
                <Text style={styles.quickInspBtnText}>Quick Check</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fullInspBtn} onPress={() => navigation.navigate('DetailedInspection', { hiveId })}>
                <Ionicons name="clipboard" size={18} color="#FFF" />
                <Text style={styles.fullInspBtnText}>Full Inspection</Text>
              </TouchableOpacity>
            </View>

            {inspections.length === 0 ? (
              <EmptyState icon="clipboard-outline" title="No Inspections" text="Record your first inspection to track this hive." />
            ) : (
              inspections.map(insp => (
                <InspectionCard key={insp.id} inspection={insp} onDelete={() => {
                  Alert.alert('Delete Inspection', 'Remove this inspection record?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteInspection(insp.id) },
                  ]);
                }} />
              ))
            )}
          </>
        )}

        {/* HARVESTS TAB */}
        {tab === 'harvests' && (
          <>
            <TouchableOpacity style={[styles.fullInspBtn, { marginBottom: spacing.md }]} onPress={() => navigation.navigate('AddHarvest', { hiveId })}>
              <Ionicons name="water" size={18} color="#FFF" />
              <Text style={styles.fullInspBtnText}>Record Harvest</Text>
            </TouchableOpacity>

            {harvests.length === 0 ? (
              <EmptyState icon="water-outline" title="No Harvests" text="Record your first honey harvest." />
            ) : (
              harvests.map(harv => (
                <HarvestCard key={harv.id} harvest={harv} onDelete={() => {
                  Alert.alert('Delete Harvest', 'Remove this harvest record?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteHarvest(harv.id) },
                  ]);
                }} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatPill({ label, value, color }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statPillValue, { color: color || colors.text }]}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

function InfoSection({ title, children }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoSectionTitle}>{title}</Text>
      <View style={styles.infoCard}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value, warning }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, warning && { color: colors.danger, fontWeight: '700' }]} numberOfLines={3}>{value}</Text>
    </View>
  );
}

function InspectionCard({ inspection, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isDetailed = inspection.type === 'detailed';
  const date = new Date(inspection.date);
  const mite = parseFloat(inspection.miteCount);

  return (
    <TouchableOpacity style={styles.inspCard} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
      <View style={styles.inspCardHeader}>
        <View style={[styles.inspTypeBadge, { backgroundColor: isDetailed ? colors.successLight : colors.infoLight }]}>
          <Text style={[styles.inspTypeText, { color: isDetailed ? colors.success : colors.info }]}>
            {isDetailed ? 'Full' : 'Quick'}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.inspDate}>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
          <View style={styles.inspBadges}>
            {inspection.queenSeen && <Badge label="👑 Queen Seen" color={colors.success} />}
            {!inspection.queenSeen && inspection.eggsPresent && <Badge label="🥚 Eggs" color={colors.warning} />}
            {inspection.queenCells && <Badge label="⚠️ Queen Cells" color={colors.danger} />}
            {mite > 0 && <Badge label={`🕷 ${mite}%`} color={mite >= 3 ? colors.danger : mite >= 2 ? colors.warning : colors.success} />}
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.inspDetail}>
          {isDetailed && (
            <>
              <DetailRow label="Brood Pattern" value={inspection.broodPattern} />
              <DetailRow label="Population" value={inspection.populationEstimate} />
              <DetailRow label="Pollen Stores" value={inspection.pollen ? 'Present' : 'Low/None'} />
              <DetailRow label="Stores Adequate" value={inspection.storesAdequate ? 'Yes' : 'No'} />
              <DetailRow label="Treatment" value={inspection.treatment || 'None'} />
              {inspection.weight && <DetailRow label="Weight" value={`${inspection.weight} lbs`} />}
            </>
          )}
          <DetailRow label="Temperament" value={`${inspection.temperament || '—'}/5`} />
          {inspection.notes && <Text style={styles.inspNotes}>{inspection.notes}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

function HarvestCard({ harvest, onDelete }) {
  const lbs = parseFloat(harvest.amountLbs) || 0;
  return (
    <View style={styles.harvestCard}>
      <View style={styles.harvestIcon}>
        <Text style={{ fontSize: 28 }}>🍯</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.harvestAmount}>{lbs} lbs {harvest.honeyType ? `• ${harvest.honeyType}` : ''}</Text>
        <Text style={styles.harvestDate}>{new Date(harvest.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        {harvest.frames && <Text style={styles.harvestMeta}>{harvest.frames} frames extracted</Text>}
        {harvest.notes && <Text style={styles.harvestNotes}>{harvest.notes}</Text>}
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

function Badge({ label, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={colors.border} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiveHeader: { backgroundColor: colors.surface, borderBottomWidth: 3, ...shadow.sm },
  hiveColorAccent: { height: 4 },
  hiveHeaderContent: { padding: spacing.md },
  hiveHeaderTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  hiveName: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.text },
  hiveType: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.round },
  statusText: { fontSize: fonts.sizes.sm, fontWeight: '700' },
  hiveStats: { flexDirection: 'row', gap: spacing.sm },
  statPill: { backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.md, alignItems: 'center' },
  statPillValue: { fontSize: fonts.sizes.md, fontWeight: '800' },
  statPillLabel: { fontSize: fonts.sizes.xs, color: colors.textLight },

  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.textLight },
  tabTextActive: { color: colors.primary, fontWeight: '800' },

  content: { padding: spacing.md, paddingBottom: 40 },
  notes: { fontSize: fonts.sizes.sm, color: colors.textMid, lineHeight: 21 },

  infoSection: { marginBottom: spacing.md },
  infoSectionTitle: { fontSize: fonts.sizes.sm, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs },
  infoCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadow.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.divider },
  infoLabel: { fontSize: fonts.sizes.sm, color: colors.textLight, flex: 1 },
  infoValue: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600', flex: 2, textAlign: 'right' },

  inspectBtnRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  quickInspBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderWidth: 2, borderColor: colors.primary, borderRadius: radius.round, paddingVertical: spacing.sm },
  quickInspBtnText: { color: colors.primary, fontWeight: '800', fontSize: fonts.sizes.sm },
  fullInspBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.primary, borderRadius: radius.round, paddingVertical: spacing.sm },
  fullInspBtnText: { color: '#FFF', fontWeight: '800', fontSize: fonts.sizes.sm },

  inspCard: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.sm, padding: spacing.md, ...shadow.sm },
  inspCardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  inspTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.round },
  inspTypeText: { fontSize: fonts.sizes.xs, fontWeight: '800' },
  inspDate: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  inspBadges: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.round },
  badgeText: { fontSize: fonts.sizes.xs, fontWeight: '700' },
  inspDetail: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
  detailRow: { flexDirection: 'row', paddingVertical: 3 },
  detailLabel: { fontSize: fonts.sizes.sm, color: colors.textLight, width: 120 },
  detailValue: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600', flex: 1 },
  inspNotes: { fontSize: fonts.sizes.sm, color: colors.textMid, marginTop: spacing.xs, fontStyle: 'italic' },

  harvestCard: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.sm, padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, ...shadow.sm },
  harvestIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  harvestAmount: { fontSize: fonts.sizes.md, fontWeight: '800', color: colors.text },
  harvestDate: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  harvestMeta: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: 2 },
  harvestNotes: { fontSize: fonts.sizes.sm, color: colors.textMid, marginTop: 4, fontStyle: 'italic' },

  empty: { alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptyText: { fontSize: fonts.sizes.sm, color: colors.textLight, textAlign: 'center', marginTop: spacing.xs },
});
