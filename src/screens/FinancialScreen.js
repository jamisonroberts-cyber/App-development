import React from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

function RecordRow({ record, hiveName, onDelete }) {
  const isRevenue = record.type === 'revenue';
  return (
    <View style={styles.recordRow}>
      <View style={[styles.typeIndicator, { backgroundColor: isRevenue ? '#EBF5E1' : '#FDECEA' }]}>
        <Ionicons
          name={isRevenue ? 'trending-up' : 'trending-down'}
          size={16}
          color={isRevenue ? colors.success : colors.danger}
        />
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.recordCategory}>{record.category}</Text>
        {hiveName ? <Text style={styles.recordHive}>{hiveName}</Text> : null}
        <Text style={styles.recordDate}>
          {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        {record.notes ? <Text style={styles.recordNotes}>{record.notes}</Text> : null}
      </View>
      <View style={styles.recordRight}>
        <Text style={[styles.recordAmount, { color: isRevenue ? colors.success : colors.danger }]}>
          {isRevenue ? '+' : '-'}${parseFloat(record.amount || 0).toFixed(2)}
        </Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FinancialScreen({ navigation }) {
  const { financialRecords, deleteFinancialRecord, hives, getTotalRevenue, getTotalExpenses } = useApp();

  const revenue = getTotalRevenue();
  const expenses = getTotalExpenses();
  const netProfit = revenue - expenses;

  function handleDelete(record) {
    Alert.alert('Delete Record', 'Remove this financial record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFinancialRecord(record.id) },
    ]);
  }

  const revenueRecords = financialRecords.filter(r => r.type === 'revenue')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const expenseRecords = financialRecords.filter(r => r.type === 'expense')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const sections = [];
  if (revenueRecords.length > 0) sections.push({ title: 'Revenue', data: revenueRecords });
  if (expenseRecords.length > 0) sections.push({ title: 'Expenses', data: expenseRecords });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: colors.success }]}>
          <Text style={styles.summaryLabel}>Revenue</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>${revenue.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.danger }]}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>${expenses.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: netProfit >= 0 ? colors.success : colors.danger }]}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[styles.summaryValue, { color: netProfit >= 0 ? colors.success : colors.danger }]}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
          </Text>
        </View>
      </View>

      {financialRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cash-outline" size={56} color={colors.border} />
          <Text style={styles.emptyTitle}>No Financial Records</Text>
          <Text style={styles.emptyText}>Track honey sales, equipment purchases, and other business transactions.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <RecordRow
              record={item}
              hiveName={item.hiveId ? hives.find(h => h.id === item.hiveId)?.name : null}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddFinancialRecord')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  summaryRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  summaryLabel: { fontSize: 11, color: colors.textLight, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: fonts.sizes.lg, fontWeight: '700', marginTop: 4 },
  list: { padding: spacing.md, paddingBottom: 80 },
  sectionHeader: {
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  recordRow: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  typeIndicator: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  recordInfo: { flex: 1 },
  recordCategory: { fontSize: fonts.sizes.md, fontWeight: '600', color: colors.text },
  recordHive: { fontSize: fonts.sizes.sm, color: colors.primary, marginTop: 1 },
  recordDate: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 1 },
  recordNotes: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2, fontStyle: 'italic' },
  recordRight: { alignItems: 'flex-end', gap: 8 },
  recordAmount: { fontSize: fonts.sizes.lg, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
