import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';

const BREED_COLORS = {
  'Italian': '#F5A623',
  'Carniolan': '#5B8A3C',
  'Russian': '#2980B9',
  'Buckfast': '#8E44AD',
  'VSH (Varroa Sensitive Hygienic)': '#16A085',
  'Cordovan': '#E74C3C',
  'Local Survivor': '#27AE60',
  'Unknown': '#BDC3C7',
};

function getBreedColor(breed) {
  return BREED_COLORS[breed] || '#888';
}

export default function DataScreen() {
  const { hives, inspections, harvests, getMiteCountHistory, getHivesByGenetics, getHoneyByYear } = useApp();
  const [activeSection, setActiveSection] = useState('overview');

  const miteHistory = getMiteCountHistory();
  const geneticsMap = getHivesByGenetics();
  const honeyByYear = getHoneyByYear();

  const totalHoney = harvests.reduce((s, h) => s + (parseFloat(h.amountLbs) || 0), 0);
  const avgMite = miteHistory.length > 0
    ? (miteHistory.reduce((s, m) => s + m.count, 0) / miteHistory.length).toFixed(2)
    : null;
  const highMiteInspections = miteHistory.filter(m => m.count >= 2).length;

  // Honey by type
  const honeyByType = {};
  harvests.forEach(h => {
    const t = h.honeyType || 'Unknown';
    honeyByType[t] = (honeyByType[t] || 0) + (parseFloat(h.amountLbs) || 0);
  });

  // Honey per hive
  const honeyPerHive = hives.map(hive => {
    const hiveHarvests = harvests.filter(h => h.hiveId === hive.id);
    const total = hiveHarvests.reduce((s, h) => s + (parseFloat(h.amountLbs) || 0), 0);
    return { hive, total, count: hiveHarvests.length };
  }).sort((a, b) => b.total - a.total);

  const maxHoney = Math.max(...honeyPerHive.map(h => h.total), 1);

  // Mite trends per hive
  const mitePerHive = hives.map(hive => {
    const hiveMites = miteHistory.filter(m => m.hiveId === hive.id);
    const avg = hiveMites.length > 0
      ? hiveMites.reduce((s, m) => s + m.count, 0) / hiveMites.length
      : null;
    const latest = hiveMites.length > 0 ? hiveMites[hiveMites.length - 1].count : null;
    return { hive, avg, latest, count: hiveMites.length };
  });

  const maxMite = Math.max(...mitePerHive.filter(m => m.avg !== null).map(m => m.avg), 4);

  const sections = ['overview', 'mites', 'honey', 'genetics'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Data & Trends</Text>
        <Text style={styles.pageSubtitle}>Hive analytics for your Randolph County operation</Text>
      </View>

      {/* Section Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {[['overview','📊 Overview'], ['mites','🕷 Mites'], ['honey','🍯 Honey'], ['genetics','🧬 Genetics']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.sectionTab, activeSection === key && styles.sectionTabActive]} onPress={() => setActiveSection(key)}>
            <Text style={[styles.sectionTabText, activeSection === key && styles.sectionTabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── OVERVIEW ── */}
      {activeSection === 'overview' && (
        <>
          <View style={styles.statsGrid}>
            <StatBox label="Total Hives" value={hives.length} icon="layers-outline" color={colors.primary} />
            <StatBox label="Total Inspections" value={inspections.length} icon="clipboard-outline" color={colors.info} />
            <StatBox label="Total Honey (lbs)" value={totalHoney.toFixed(1)} icon="water-outline" color={colors.success} />
            <StatBox label="Avg Mite %" value={avgMite || '—'} icon="bug-outline" color={avgMite >= 2 ? colors.danger : colors.success} />
          </View>

          {highMiteInspections > 0 && (
            <AlertBanner
              icon="warning"
              color={colors.warning}
              text={`${highMiteInspections} inspection${highMiteInspections !== 1 ? 's' : ''} recorded mite counts at or above 2% treatment threshold.`}
            />
          )}

          <SectionTitle title="Hive Status Breakdown" />
          <HiveStatusChart hives={hives} />

          <SectionTitle title="Honey by Type" />
          {Object.keys(honeyByType).length === 0 ? (
            <EmptyCard text="No harvest data recorded yet." />
          ) : (
            <View style={styles.card}>
              {Object.entries(honeyByType).sort((a, b) => b[1] - a[1]).map(([type, lbs]) => {
                const pct = (lbs / totalHoney) * 100;
                return (
                  <View key={type} style={styles.barRow}>
                    <Text style={styles.barLabel} numberOfLines={1}>{type}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={styles.barValue}>{lbs.toFixed(1)} lbs</Text>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      {/* ── MITE TRENDS ── */}
      {activeSection === 'mites' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Treatment Thresholds (NC Extension)</Text>
            <ThresholdRow color={colors.success} label="Safe Zone" range="< 2%" desc="No treatment needed" />
            <ThresholdRow color={colors.warning} label="Caution" range="2–3%" desc="Plan treatment soon" />
            <ThresholdRow color={colors.danger} label="Critical" range="> 3%" desc="Treat immediately" />
          </View>

          {miteHistory.length === 0 ? (
            <EmptyCard text="No mite counts recorded. Add mite data during inspections." />
          ) : (
            <>
              <SectionTitle title="Mite Counts by Hive" />
              <View style={styles.card}>
                {mitePerHive.filter(m => m.count > 0).map(({ hive, avg, latest }) => {
                  const pct = (avg / maxMite) * 100;
                  const danger = avg >= 3;
                  const warning = avg >= 2;
                  const barColor = danger ? colors.danger : warning ? colors.warning : colors.success;
                  return (
                    <View key={hive.id} style={styles.barRow}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: hive.color || colors.primary, marginRight: 4, marginTop: 2 }} />
                      <Text style={styles.barLabel} numberOfLines={1}>{hive.name}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                        {avg >= 2 && <View style={[styles.thresholdLine, { left: `${(2 / maxMite) * 100}%` }]} />}
                      </View>
                      <Text style={[styles.barValue, { color: barColor }]}>{avg ? avg.toFixed(1) + '%' : '—'}</Text>
                    </View>
                  );
                })}
                <Text style={styles.chartNote}>Bar = average mite %. Vertical line = 2% threshold.</Text>
              </View>

              <SectionTitle title="Mite Count History" />
              <View style={styles.card}>
                {miteHistory.slice().reverse().slice(0, 15).map((entry, i) => {
                  const hive = hives.find(h => h.id === entry.hiveId);
                  const danger = entry.count >= 3;
                  const warning = entry.count >= 2;
                  return (
                    <View key={i} style={[styles.historyRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                      <View style={[styles.miteIndicator, { backgroundColor: danger ? colors.danger : warning ? colors.warning : colors.success }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyHive}>{entry.hiveName}</Text>
                        <Text style={styles.historyDate}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — {entry.method}</Text>
                      </View>
                      <Text style={[styles.historyCount, { color: danger ? colors.danger : warning ? colors.warning : colors.success }]}>{entry.count}%</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </>
      )}

      {/* ── HONEY TRENDS ── */}
      {activeSection === 'honey' && (
        <>
          <View style={styles.statsGrid}>
            <StatBox label="Total Lbs" value={totalHoney.toFixed(1)} icon="water-outline" color={colors.primary} />
            <StatBox label="Harvests" value={harvests.length} icon="archive-outline" color={colors.success} />
          </View>

          <SectionTitle title="Honey Yield by Year" />
          {Object.keys(honeyByYear).length === 0 ? (
            <EmptyCard text="No harvest data yet. Record harvests in the Apiary tab." />
          ) : (
            <View style={styles.card}>
              {Object.entries(honeyByYear).sort().map(([year, lbs]) => {
                const maxYear = Math.max(...Object.values(honeyByYear));
                return (
                  <View key={year} style={styles.barRow}>
                    <Text style={styles.barLabel}>{year}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${(lbs / maxYear) * 100}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={styles.barValue}>{lbs.toFixed(1)} lbs</Text>
                  </View>
                );
              })}
            </View>
          )}

          <SectionTitle title="Honey Per Hive (All Time)" />
          {honeyPerHive.filter(h => h.total > 0).length === 0 ? (
            <EmptyCard text="No harvest data recorded." />
          ) : (
            <View style={styles.card}>
              {honeyPerHive.filter(h => h.total > 0).map(({ hive, total, count }) => (
                <View key={hive.id} style={styles.barRow}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: hive.color || colors.primary, marginRight: 4 }} />
                  <Text style={styles.barLabel} numberOfLines={1}>{hive.name}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(total / maxHoney) * 100}%`, backgroundColor: hive.color || colors.primary }]} />
                  </View>
                  <Text style={styles.barValue}>{total.toFixed(1)} lbs</Text>
                </View>
              ))}
              <Text style={styles.chartNote}>Showing total honey harvested per hive.</Text>
            </View>
          )}

          <SectionTitle title="Recent Harvests" />
          {harvests.length === 0 ? (
            <EmptyCard text="No harvests recorded." />
          ) : (
            <View style={styles.card}>
              {harvests.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((h, i) => {
                const hive = hives.find(hv => hv.id === h.hiveId);
                return (
                  <View key={h.id} style={[styles.historyRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                    <Text style={{ fontSize: 22 }}>🍯</Text>
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.historyHive}>{hive?.name || 'Unknown'}</Text>
                      <Text style={styles.historyDate}>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {h.honeyType ? `• ${h.honeyType}` : ''}</Text>
                    </View>
                    <Text style={styles.historyCount}>{parseFloat(h.amountLbs).toFixed(1)} lbs</Text>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      {/* ── GENETICS ── */}
      {activeSection === 'genetics' && (
        <>
          <SectionTitle title="Queen Genetics Distribution" />
          {Object.keys(geneticsMap).length === 0 ? (
            <EmptyCard text="No hive data yet. Add hives with queen information." />
          ) : (
            <View style={styles.card}>
              {Object.entries(geneticsMap).map(([breed, data]) => {
                const pct = (data.count / hives.length) * 100;
                const bc = getBreedColor(breed);
                return (
                  <View key={breed} style={styles.barRow}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: bc, marginRight: 4 }} />
                    <Text style={styles.barLabel} numberOfLines={1}>{breed}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: bc }]} />
                    </View>
                    <Text style={styles.barValue}>{data.count}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <SectionTitle title="Performance by Genetics" />
          {Object.keys(geneticsMap).length === 0 ? (
            <EmptyCard text="No genetics data available." />
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Average Honey Yield by Queen Breed</Text>
              {Object.entries(geneticsMap).map(([breed, data]) => {
                const breedHarvests = data.hives.flatMap(h => harvests.filter(hv => hv.hiveId === h.id));
                const totalLbs = breedHarvests.reduce((s, h) => s + (parseFloat(h.amountLbs) || 0), 0);
                const avgPerHive = data.count > 0 ? (totalLbs / data.count).toFixed(1) : '0';
                const maxAvg = 40;
                const bc = getBreedColor(breed);
                return (
                  <View key={breed} style={styles.geneticsRow}>
                    <View style={styles.geneticsTop}>
                      <View style={[styles.breedDot, { backgroundColor: bc }]} />
                      <Text style={styles.breedName}>{breed}</Text>
                      <Text style={styles.breedCount}>{data.count} hive{data.count !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.barRow}>
                      <Text style={styles.barLabel}>Avg yield</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${Math.min(100, (parseFloat(avgPerHive) / maxAvg) * 100)}%`, backgroundColor: bc }]} />
                      </View>
                      <Text style={styles.barValue}>{avgPerHive} lbs</Text>
                    </View>
                  </View>
                );
              })}
              <Text style={styles.chartNote}>Average total honey yield per hive by queen genetics. More data = more accurate trends.</Text>
            </View>
          )}

          <SectionTitle title="Queen Age & Requeening" />
          <View style={styles.card}>
            {hives.map(hive => {
              const year = parseInt(hive.queenYear) || null;
              const age = year ? new Date().getFullYear() - year : null;
              const ageWarning = age !== null && age >= 2;
              const ageCritical = age !== null && age >= 3;
              return (
                <View key={hive.id} style={styles.queenRow}>
                  <View style={[styles.hiveColorDot, { backgroundColor: hive.color || colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.queenHiveName}>{hive.name}</Text>
                    <Text style={styles.queenBreed}>{hive.queenBreed || 'Unknown'} {hive.queenMarked ? `• Marked ${hive.queenColor || ''}` : ''}</Text>
                  </View>
                  <View style={[styles.ageBadge, { backgroundColor: ageCritical ? colors.dangerLight : ageWarning ? colors.warningLight : colors.successLight }]}>
                    <Text style={[styles.ageText, { color: ageCritical ? colors.danger : ageWarning ? colors.warning : colors.success }]}>
                      {age !== null ? `${age} yr${age !== 1 ? 's' : ''}` : '—'}
                    </Text>
                  </View>
                </View>
              );
            })}
            <Text style={styles.chartNote}>Queens over 2 years may show decreased egg-laying and increased swarming tendency. Consider requeening.</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatBox({ label, value, icon, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statBoxValue, { color: colors.text }]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function EmptyCard({ text }) {
  return (
    <View style={[styles.card, styles.emptyCard]}>
      <Ionicons name="bar-chart-outline" size={32} color={colors.border} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function AlertBanner({ icon, color, text }) {
  return (
    <View style={[styles.alertBanner, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.alertText, { color }]}>{text}</Text>
    </View>
  );
}

function ThresholdRow({ color, label, range, desc }) {
  return (
    <View style={styles.thresholdRow}>
      <View style={[styles.thresholdDot, { backgroundColor: color }]} />
      <Text style={[styles.thresholdLabel, { color }]}>{range}</Text>
      <Text style={styles.thresholdDesc}>{label} — {desc}</Text>
    </View>
  );
}

function HiveStatusChart({ hives }) {
  const counts = hives.reduce((acc, h) => {
    const s = h.status || 'Active';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const statusColors = { Active: colors.success, Weak: colors.warning, 'Queen Issues': colors.danger, Deadout: '#888', Absconded: '#888' };
  const total = hives.length;
  return (
    <View style={styles.card}>
      {Object.entries(counts).map(([status, count]) => {
        const c = statusColors[status] || colors.textLight;
        return (
          <View key={status} style={styles.barRow}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c, marginRight: 4 }} />
            <Text style={styles.barLabel}>{status}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(count / total) * 100}%`, backgroundColor: c }]} />
            </View>
            <Text style={styles.barValue}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },

  pageHeader: { padding: spacing.md, paddingBottom: spacing.sm },
  pageTitle: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.text },
  pageSubtitle: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },

  tabScroll: { paddingLeft: spacing.md, paddingBottom: spacing.sm },
  sectionTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.round, marginRight: spacing.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  sectionTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sectionTabText: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.textMid },
  sectionTabTextActive: { color: '#FFF' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.sm },
  statBox: { flex: 1, minWidth: 140, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', borderTopWidth: 3, ...shadow.sm },
  statBoxValue: { fontSize: fonts.sizes.xl, fontWeight: '800', marginTop: 4 },
  statBoxLabel: { fontSize: fonts.sizes.xs, color: colors.textLight, textAlign: 'center' },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginHorizontal: spacing.md, padding: spacing.md, ...shadow.sm, marginBottom: spacing.sm },
  cardTitle: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  sectionTitle: { fontSize: fonts.sizes.md, fontWeight: '800', color: colors.text, marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },

  barRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: spacing.xs },
  barLabel: { width: 90, fontSize: fonts.sizes.sm, color: colors.textMid, flexShrink: 1 },
  barTrack: { flex: 1, height: 10, backgroundColor: colors.divider, borderRadius: 5, overflow: 'hidden', position: 'relative' },
  barFill: { height: '100%', borderRadius: 5 },
  barValue: { width: 52, fontSize: fonts.sizes.xs, fontWeight: '700', color: colors.text, textAlign: 'right' },
  thresholdLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.danger + '80' },
  chartNote: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: spacing.sm },
  miteIndicator: { width: 10, height: 10, borderRadius: 5 },
  historyHive: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text },
  historyDate: { fontSize: fonts.sizes.xs, color: colors.textLight, marginTop: 1 },
  historyCount: { fontSize: fonts.sizes.md, fontWeight: '800', color: colors.text },

  alertBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  alertText: { flex: 1, fontSize: fonts.sizes.sm, fontWeight: '600', lineHeight: 20 },

  thresholdRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: spacing.sm },
  thresholdDot: { width: 10, height: 10, borderRadius: 5 },
  thresholdLabel: { width: 44, fontSize: fonts.sizes.sm, fontWeight: '800' },
  thresholdDesc: { flex: 1, fontSize: fonts.sizes.sm, color: colors.textMid },

  emptyCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  emptyText: { fontSize: fonts.sizes.sm, color: colors.textLight, textAlign: 'center' },

  geneticsRow: { marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  geneticsTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: spacing.xs },
  breedDot: { width: 12, height: 12, borderRadius: 6 },
  breedName: { flex: 1, fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text },
  breedCount: { fontSize: fonts.sizes.xs, color: colors.textLight },

  queenRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  hiveColorDot: { width: 12, height: 12, borderRadius: 6 },
  queenHiveName: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text },
  queenBreed: { fontSize: fonts.sizes.xs, color: colors.textLight, marginTop: 1 },
  ageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.round },
  ageText: { fontSize: fonts.sizes.sm, fontWeight: '800' },
});
