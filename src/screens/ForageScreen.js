import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  FORAGE_PLANTS, MONTHS, MONTH_SHORT,
  getPlantsForMonth, getMonthForageScore,
  getSourceLabel, getImportanceLabel,
  SOURCE_NECTAR, SOURCE_POLLEN, SOURCE_BOTH,
  IMPORTANCE_MAJOR, IMPORTANCE_MODERATE,
} from '../utils/forageData';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';

const CURRENT_MONTH = new Date().getMonth();

export default function ForageScreen() {
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [filterSource, setFilterSource] = useState('all');

  const plants = getPlantsForMonth(selectedMonth).filter(p => {
    if (filterSource === 'nectar') return p.source === SOURCE_NECTAR || p.source === SOURCE_BOTH;
    if (filterSource === 'pollen') return p.source === SOURCE_POLLEN || p.source === SOURCE_BOTH;
    return true;
  });

  const monthScore = getMonthForageScore(selectedMonth);
  const maxScore = 15;
  const barWidth = Math.min(100, (monthScore.score / maxScore) * 100);

  function getFlowLabel(score) {
    if (score >= 12) return { label: 'Excellent Flow', color: colors.success };
    if (score >= 8) return { label: 'Good Flow', color: '#7BB83A' };
    if (score >= 5) return { label: 'Moderate', color: colors.primary };
    if (score >= 2) return { label: 'Light', color: colors.warning };
    return { label: 'Dearth', color: colors.danger };
  }

  const flowInfo = getFlowLabel(monthScore.score);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Forage Calendar</Text>
          <Text style={styles.pageSubtitle}>Randolph County, NC — Piedmont Region, Zone 7b</Text>
        </View>

        {/* Month Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {MONTH_SHORT.map((m, i) => {
            const score = getMonthForageScore(i).score;
            const isActive = i === selectedMonth;
            const isCurrent = i === CURRENT_MONTH;
            return (
              <TouchableOpacity key={i} style={[styles.monthBtn, isActive && styles.monthBtnActive]} onPress={() => setSelectedMonth(i)}>
                {isCurrent && !isActive && <View style={styles.currentDot} />}
                <Text style={[styles.monthBtnText, isActive && styles.monthBtnTextActive]}>{m}</Text>
                <View style={styles.monthScoreBar}>
                  <View style={[styles.monthScoreBarFill, {
                    width: `${Math.max(8, (score / maxScore) * 100)}%`,
                    backgroundColor: isActive ? '#FFF8' : (score >= 8 ? colors.success : score >= 4 ? colors.primary : colors.border),
                  }]} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Month Summary */}
        <View style={styles.monthSummaryCard}>
          <View style={styles.monthSummaryTop}>
            <View>
              <Text style={styles.selectedMonthName}>{MONTHS[selectedMonth]}</Text>
              <Text style={[styles.flowLabel, { color: flowInfo.color }]}>{flowInfo.label}</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{plants.length}</Text>
                <Text style={styles.summaryStatLabel}>Plants</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{plants.filter(p => p.importance === IMPORTANCE_MAJOR).length}</Text>
                <Text style={styles.summaryStatLabel}>Major</Text>
              </View>
            </View>
          </View>
          <View style={styles.flowBar}>
            <View style={[styles.flowBarFill, { width: `${barWidth}%`, backgroundColor: flowInfo.color }]} />
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {[['all','🌸 All'], ['nectar','🍯 Nectar'], ['pollen','🌼 Pollen']].map(([val, label]) => (
            <TouchableOpacity key={val} style={[styles.filterBtn, filterSource === val && styles.filterBtnActive]} onPress={() => setFilterSource(val)}>
              <Text style={[styles.filterBtnText, filterSource === val && styles.filterBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plant List */}
        {plants.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌿</Text>
            <Text style={styles.emptyTitle}>Little to No Forage</Text>
            <Text style={styles.emptyText}>This is a dearth period. Focus on colony management and feeding if needed.</Text>
          </View>
        ) : (
          plants.map((plant, i) => (
            <TouchableOpacity key={`${plant.name}-${i}`} style={styles.plantCard} onPress={() => setSelectedPlant(plant)} activeOpacity={0.8}>
              <View style={[styles.plantColorBar, { backgroundColor: plant.color }]} />
              <View style={styles.plantContent}>
                <View style={styles.plantTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <Text style={styles.plantNote} numberOfLines={2}>{plant.notes}</Text>
                  </View>
                  <View style={styles.plantBadges}>
                    <ImportanceBadge importance={plant.importance} />
                    <SourceBadge source={plant.source} />
                  </View>
                </View>
                <View style={styles.plantMonths}>
                  {MONTH_SHORT.map((m, mi) => (
                    <View key={mi} style={[styles.plantMonthDot, plant.months.includes(mi) && { backgroundColor: plant.color }]} />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Year Overview */}
        <Text style={styles.overviewTitle}>Year-Round Overview</Text>
        <View style={styles.overviewCard}>
          {MONTHS.map((m, i) => {
            const score = getMonthForageScore(i).score;
            const isCurrent = i === CURRENT_MONTH;
            return (
              <TouchableOpacity key={i} style={styles.overviewRow} onPress={() => setSelectedMonth(i)}>
                <Text style={[styles.overviewMonth, isCurrent && styles.overviewMonthCurrent]}>{MONTH_SHORT[i]}</Text>
                <View style={styles.overviewBarBg}>
                  <View style={[styles.overviewBarFill, {
                    width: `${Math.max(2, (score / maxScore) * 100)}%`,
                    backgroundColor: score >= 8 ? colors.success : score >= 4 ? colors.primary : score >= 2 ? colors.warning : colors.border,
                  }]} />
                </View>
                <Text style={styles.overviewScore}>{score}</Text>
                {isCurrent && <View style={styles.overviewCurrentDot} />}
              </TouchableOpacity>
            );
          })}
          <Text style={styles.overviewNote}>Score = forage abundance index (higher = more active nectar/pollen sources)</Text>
        </View>
      </ScrollView>

      {/* Plant Detail Modal */}
      <Modal visible={!!selectedPlant} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedPlant(null)}>
        {selectedPlant && (
          <View style={styles.modal}>
            <View style={[styles.modalColorBar, { backgroundColor: selectedPlant.color }]} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPlant.name}</Text>
              <TouchableOpacity onPress={() => setSelectedPlant(null)}>
                <Ionicons name="close-circle" size={28} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalBadges}>
                <ImportanceBadge importance={selectedPlant.importance} />
                <SourceBadge source={selectedPlant.source} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Bloom Months</Text>
                <View style={styles.bloomMonths}>
                  {MONTH_SHORT.map((m, i) => (
                    <View key={i} style={[styles.bloomMonthPill, selectedPlant.months.includes(i) && { backgroundColor: selectedPlant.color, borderColor: selectedPlant.color }]}>
                      <Text style={[styles.bloomMonthText, selectedPlant.months.includes(i) && styles.bloomMonthTextActive]}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Notes for Beekeepers</Text>
                <Text style={styles.modalNotes}>{selectedPlant.notes}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Source Type</Text>
                <View style={styles.sourceInfo}>
                  <SourceIcon source={selectedPlant.source} />
                  <Text style={styles.sourceInfoText}>{getSourceLabel(selectedPlant.source)}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Importance</Text>
                <Text style={styles.importanceText}>{getImportanceLabel(selectedPlant.importance)} forage source for Randolph County area</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

function ImportanceBadge({ importance }) {
  const config = {
    major: { label: 'Major', bg: colors.successLight, text: colors.success },
    moderate: { label: 'Moderate', bg: colors.infoLight, text: colors.info },
    minor: { label: 'Minor', bg: colors.surfaceAlt, text: colors.textLight },
  }[importance] || {};
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function SourceBadge({ source }) {
  const config = {
    nectar: { label: '🍯 Nectar', bg: '#FFF3D0', text: '#A05000' },
    pollen: { label: '🌼 Pollen', bg: '#FFFDE7', text: '#A07000' },
    both: { label: '🌸 Both', bg: '#F3E5F5', text: '#7B1FA2' },
  }[source] || {};
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function SourceIcon({ source }) {
  if (source === SOURCE_NECTAR) return <Text style={{ fontSize: 32 }}>🍯</Text>;
  if (source === SOURCE_POLLEN) return <Text style={{ fontSize: 32 }}>🌼</Text>;
  return <Text style={{ fontSize: 32 }}>🌸</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },

  pageHeader: { padding: spacing.md, paddingBottom: spacing.sm },
  pageTitle: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.text },
  pageSubtitle: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },

  monthScroll: { paddingLeft: spacing.md, paddingBottom: spacing.sm },
  monthBtn: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md, marginRight: spacing.xs, minWidth: 52, backgroundColor: colors.surface, ...shadow.sm },
  monthBtnActive: { backgroundColor: colors.primary },
  currentDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  monthBtnText: { fontSize: fonts.sizes.xs, fontWeight: '700', color: colors.textMid },
  monthBtnTextActive: { color: '#FFF' },
  monthScoreBar: { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  monthScoreBarFill: { height: '100%', borderRadius: 2 },

  monthSummaryCard: { margin: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, ...shadow.md },
  monthSummaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  selectedMonthName: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.text },
  flowLabel: { fontSize: fonts.sizes.md, fontWeight: '700', marginTop: 2 },
  summaryStats: { flexDirection: 'row', gap: spacing.md },
  summaryStat: { alignItems: 'center' },
  summaryStatValue: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.primary },
  summaryStatLabel: { fontSize: fonts.sizes.xs, color: colors.textLight },
  flowBar: { height: 8, backgroundColor: colors.divider, borderRadius: 4, overflow: 'hidden' },
  flowBarFill: { height: '100%', borderRadius: 4 },

  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  filterBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.round, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterBtnText: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.textMid },
  filterBtnTextActive: { color: '#FFF' },

  empty: { alignItems: 'center', padding: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: fonts.sizes.sm, color: colors.textLight, textAlign: 'center' },

  plantCard: { backgroundColor: colors.surface, borderRadius: radius.lg, marginHorizontal: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', overflow: 'hidden', ...shadow.sm },
  plantColorBar: { width: 5 },
  plantContent: { flex: 1, padding: spacing.md },
  plantTop: { flexDirection: 'row', marginBottom: spacing.sm },
  plantName: { fontSize: fonts.sizes.md, fontWeight: '800', color: colors.text },
  plantNote: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2, lineHeight: 18 },
  plantBadges: { gap: 4, alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.round },
  badgeText: { fontSize: fonts.sizes.xs, fontWeight: '700' },
  plantMonths: { flexDirection: 'row', gap: 3 },
  plantMonthDot: { width: 16, height: 6, borderRadius: 3, backgroundColor: colors.border },

  overviewTitle: { fontSize: fonts.sizes.md, fontWeight: '800', color: colors.text, marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  overviewCard: { backgroundColor: colors.surface, borderRadius: radius.xl, marginHorizontal: spacing.md, padding: spacing.md, ...shadow.sm },
  overviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: spacing.sm },
  overviewMonth: { width: 28, fontSize: fonts.sizes.xs, fontWeight: '600', color: colors.textLight },
  overviewMonthCurrent: { color: colors.primary, fontWeight: '800' },
  overviewBarBg: { flex: 1, height: 8, backgroundColor: colors.divider, borderRadius: 4, overflow: 'hidden' },
  overviewBarFill: { height: '100%', borderRadius: 4 },
  overviewScore: { width: 20, fontSize: fonts.sizes.xs, color: colors.textMuted, textAlign: 'right' },
  overviewCurrentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  overviewNote: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic', lineHeight: 16 },

  modal: { flex: 1, backgroundColor: colors.background },
  modalColorBar: { height: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  modalTitle: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.text, flex: 1, paddingRight: spacing.sm },
  modalContent: { padding: spacing.md },
  modalBadges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  modalSection: { marginBottom: spacing.lg },
  modalSectionTitle: { fontSize: fonts.sizes.sm, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  bloomMonths: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  bloomMonthPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.round, borderWidth: 1.5, borderColor: colors.border },
  bloomMonthText: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.textLight },
  bloomMonthTextActive: { color: '#FFF' },
  modalNotes: { fontSize: fonts.sizes.md, color: colors.textMid, lineHeight: 24 },
  sourceInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sourceInfoText: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text },
  importanceText: { fontSize: fonts.sizes.md, color: colors.textMid },
});
