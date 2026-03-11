import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.md * 2 - spacing.md * 2;

const chartConfig = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  color: (opacity = 1) => `rgba(245, 166, 35, ${opacity})`,
  labelColor: () => colors.textLight,
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 0,
  propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primaryDark },
};

function ChartCard({ title, icon, children, isEmpty, emptyMessage }) {
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Ionicons name={icon} size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.chartTitle}>{title}</Text>
      </View>
      {isEmpty ? (
        <View style={styles.emptyChart}>
          <Ionicons name="bar-chart-outline" size={32} color={colors.border} />
          <Text style={styles.emptyChartText}>{emptyMessage || 'No data yet'}</Text>
        </View>
      ) : children}
    </View>
  );
}

export default function DataScreen() {
  const { hives, harvests, inspections, financialRecords, getTotalRevenue, getTotalExpenses } = useApp();

  // ── Hive count by year ──────────────────────────────────────────
  const hivesByYear = useMemo(() => {
    const years = {};
    hives.forEach(h => {
      const yr = parseInt(h.established) || new Date().getFullYear();
      years[yr] = (years[yr] || 0) + 1;
    });
    const sorted = Object.entries(years).sort((a, b) => a[0] - b[0]);
    let cumulative = 0;
    return sorted.map(([yr, count]) => {
      cumulative += count;
      return { year: yr.toString(), count: cumulative };
    });
  }, [hives]);

  // ── Honey yield by month (last 6 months) ───────────────────────
  const honeyByMonth = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const kg = harvests
        .filter(h => h.date.startsWith(key))
        .reduce((sum, h) => sum + (parseFloat(h.amountKg) || 0), 0);
      result.push({ label, kg });
    }
    return result;
  }, [harvests]);

  // ── Health distribution ────────────────────────────────────────
  const healthData = useMemo(() => {
    const counts = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 };
    hives.forEach(h => {
      if (h.health && counts[h.health] !== undefined) counts[h.health]++;
    });
    const pieColors = {
      Excellent: '#5B8A3C',
      Good: '#7BC67E',
      Fair: '#F39C12',
      Poor: '#C0392B',
    };
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, population]) => ({
        name,
        population,
        color: pieColors[name],
        legendFontColor: colors.textLight,
        legendFontSize: 12,
      }));
  }, [hives]);

  // ── Financial summary ──────────────────────────────────────────
  const totalRevenue = getTotalRevenue();
  const totalExpenses = getTotalExpenses();
  const netProfit = totalRevenue - totalExpenses;

  // Recent monthly financials (last 6 months)
  const financialByMonth = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const rev = financialRecords
        .filter(r => r.type === 'revenue' && (r.date || '').startsWith(key))
        .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
      const exp = financialRecords
        .filter(r => r.type === 'expense' && (r.date || '').startsWith(key))
        .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
      result.push({ label, rev, exp });
    }
    return result;
  }, [financialRecords]);

  const hasHiveHistory = hivesByYear.length > 0;
  const hasHarvests = harvests.length > 0;
  const hasHealthData = healthData.length > 0;
  const hasFinancials = financialRecords.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="layers-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{hives.length}</Text>
            <Text style={styles.statLabel}>Total Hives</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{inspections.length}</Text>
            <Text style={styles.statLabel}>Inspections</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="water-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>
              {harvests.reduce((s, h) => s + (parseFloat(h.amountKg) || 0), 0).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>kg Honey</Text>
          </View>
        </View>

        {/* Hive Count Trend */}
        <ChartCard
          title="Hive Count Growth"
          icon="layers-outline"
          isEmpty={!hasHiveHistory}
          emptyMessage="Add hives with established years to see growth trends"
        >
          {hasHiveHistory && (
            <LineChart
              data={{
                labels: hivesByYear.map(d => d.year),
                datasets: [{ data: hivesByYear.map(d => d.count) }],
              }}
              width={CHART_WIDTH}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </ChartCard>

        {/* Honey Yield by Month */}
        <ChartCard
          title="Honey Yield — Last 6 Months (kg)"
          icon="water-outline"
          isEmpty={!hasHarvests}
          emptyMessage="Record your first harvest to see yield trends"
        >
          {hasHarvests && (
            <BarChart
              data={{
                labels: honeyByMonth.map(d => d.label),
                datasets: [{ data: honeyByMonth.map(d => d.kg) }],
              }}
              width={CHART_WIDTH}
              height={180}
              chartConfig={{ ...chartConfig, decimalPlaces: 1 }}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          )}
        </ChartCard>

        {/* Colony Health Distribution */}
        <ChartCard
          title="Colony Health Distribution"
          icon="heart-outline"
          isEmpty={!hasHealthData}
          emptyMessage="Add hives with health status to see distribution"
        >
          {hasHealthData && (
            <PieChart
              data={healthData}
              width={CHART_WIDTH}
              height={160}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="16"
              style={styles.chart}
            />
          )}
        </ChartCard>

        {/* Financial Overview */}
        <ChartCard
          title="Financial Overview"
          icon="cash-outline"
          isEmpty={!hasFinancials}
          emptyMessage="Add financial records to track your business performance"
        >
          {hasFinancials && (
            <>
              <View style={styles.financeSummary}>
                <View style={styles.financeItem}>
                  <Text style={styles.financeLabel}>Revenue</Text>
                  <Text style={[styles.financeValue, { color: colors.success }]}>${totalRevenue.toFixed(0)}</Text>
                </View>
                <View style={styles.financeDivider} />
                <View style={styles.financeItem}>
                  <Text style={styles.financeLabel}>Expenses</Text>
                  <Text style={[styles.financeValue, { color: colors.danger }]}>${totalExpenses.toFixed(0)}</Text>
                </View>
                <View style={styles.financeDivider} />
                <View style={styles.financeItem}>
                  <Text style={styles.financeLabel}>Net Profit</Text>
                  <Text style={[styles.financeValue, { color: netProfit >= 0 ? colors.success : colors.danger }]}>
                    {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(0)}
                  </Text>
                </View>
              </View>
              {financialByMonth.some(m => m.rev > 0 || m.exp > 0) && (
                <BarChart
                  data={{
                    labels: financialByMonth.map(d => d.label),
                    datasets: [
                      { data: financialByMonth.map(d => d.rev), color: () => colors.success },
                    ],
                  }}
                  width={CHART_WIDTH}
                  height={160}
                  chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(91, 138, 60, ${opacity})` }}
                  style={styles.chart}
                  showValuesOnTopOfBars
                />
              )}
            </>
          )}
        </ChartCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
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
  statValue: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginTop: 6 },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2, textAlign: 'center' },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  chartTitle: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  chart: { borderRadius: 8, marginLeft: -spacing.sm },
  emptyChart: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyChartText: { fontSize: fonts.sizes.sm, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm },
  financeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  financeItem: { alignItems: 'center' },
  financeLabel: { fontSize: fonts.sizes.sm, color: colors.textLight, marginBottom: 4 },
  financeValue: { fontSize: fonts.sizes.xl, fontWeight: '700' },
  financeDivider: { width: 1, backgroundColor: colors.border },
});
