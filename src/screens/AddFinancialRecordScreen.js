import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

const REVENUE_CATEGORIES = ['Honey Sales', 'Beeswax Sales', 'Nuc/Package Sales', 'Queen Sales', 'Pollination Services', 'Other'];
const EXPENSE_CATEGORIES = ['Equipment', 'Medications/Treatments', 'Feeding Supplies', 'Package Bees/Nucs', 'Queens', 'Protective Gear', 'Extraction', 'Packaging', 'Labor', 'Other'];

export default function AddFinancialRecordScreen({ navigation }) {
  const { addFinancialRecord, hives } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const [type, setType] = useState('revenue');
  const [category, setCategory] = useState('Honey Sales');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [hiveId, setHiveId] = useState(null);

  const categories = type === 'revenue' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(t) {
    setType(t);
    setCategory(t === 'revenue' ? REVENUE_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }

  function handleSave() {
    if (!amount.trim()) return;
    addFinancialRecord({ type, category, amount: parseFloat(amount), date, notes: notes.trim(), hiveId });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'revenue' && styles.typeBtnRevenue]}
                onPress={() => handleTypeChange('revenue')}
              >
                <Ionicons name="trending-up" size={18} color={type === 'revenue' ? '#fff' : colors.success} style={{ marginRight: 6 }} />
                <Text style={[styles.typeText, type === 'revenue' && { color: '#fff' }]}>Revenue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
                onPress={() => handleTypeChange('expense')}
              >
                <Ionicons name="trending-down" size={18} color={type === 'expense' ? '#fff' : colors.danger} style={{ marginRight: 6 }} />
                <Text style={[styles.typeText, type === 'expense' && { color: '#fff' }]}>Expense</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount ($) *</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Hive (optional) */}
          <View style={styles.section}>
            <Text style={styles.label}>Link to Hive (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.chip, !hiveId && styles.chipActive]}
                onPress={() => setHiveId(null)}
              >
                <Text style={[styles.chipText, !hiveId && styles.chipTextActive]}>None</Text>
              </TouchableOpacity>
              {hives.map(hive => (
                <TouchableOpacity
                  key={hive.id}
                  style={[styles.chip, hiveId === hive.id && styles.chipActive]}
                  onPress={() => setHiveId(hive.id)}
                >
                  <Text style={[styles.chipText, hiveId === hive.id && styles.chipTextActive]}>{hive.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Description, buyer, source..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !amount.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!amount.trim()}
          >
            <Text style={styles.saveBtnText}>Save Record</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  section: { marginBottom: spacing.md },
  label: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.textLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeBtnRevenue: { backgroundColor: colors.success, borderColor: colors.success },
  typeBtnExpense: { backgroundColor: colors.danger, borderColor: colors.danger },
  typeText: { fontSize: fonts.sizes.md, fontWeight: '600', color: colors.text },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fonts.sizes.sm, color: colors.textLight, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fonts.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiline: { minHeight: 80, paddingTop: 12 },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.sizes.lg },
});
