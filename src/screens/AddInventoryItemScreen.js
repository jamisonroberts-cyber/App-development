import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

const CATEGORIES = [
  'Equipment',
  'Medications/Treatments',
  'Feeding Supplies',
  'Protective Gear',
  'Extraction Equipment',
  'Packaging',
  'Other',
];

export default function AddInventoryItemScreen({ navigation, route }) {
  const { inventoryItems, addInventoryItem, updateInventoryItem } = useApp();
  const editId = route.params?.itemId;
  const existing = inventoryItems.find(i => i.id === editId);

  const [name, setName] = useState(existing?.name || '');
  const [category, setCategory] = useState(existing?.category || 'Equipment');
  const [quantity, setQuantity] = useState(existing?.quantity?.toString() || '');
  const [unitCost, setUnitCost] = useState(existing?.unitCost?.toString() || '');
  const [notes, setNotes] = useState(existing?.notes || '');

  function handleSave() {
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      category,
      quantity: parseFloat(quantity) || 0,
      unitCost: parseFloat(unitCost) || 0,
      notes: notes.trim(),
    };
    if (editId) {
      updateInventoryItem(editId, data);
    } else {
      addInventoryItem(data);
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Deep Super, Mite Strips, Smoker"
              placeholderTextColor={colors.textLight}
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {CATEGORIES.map(cat => (
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

          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Unit Cost ($)</Text>
              <TextInput
                style={styles.input}
                value={unitCost}
                onChangeText={setUnitCost}
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {quantity && unitCost ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Value:</Text>
              <Text style={styles.totalValue}>
                ${((parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0)).toFixed(2)}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Supplier, model number, usage notes..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <Text style={styles.saveBtnText}>{editId ? 'Save Changes' : 'Add to Inventory'}</Text>
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
  row: { flexDirection: 'row' },
  label: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.textLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
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
  chipScroll: { flexDirection: 'row' },
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EBF5E1',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  totalLabel: { fontSize: fonts.sizes.md, color: colors.text, fontWeight: '600' },
  totalValue: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.success },
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
