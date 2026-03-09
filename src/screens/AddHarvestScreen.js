import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

const HONEY_TYPES = ['Wildflower', 'Clover', 'Manuka', 'Buckwheat', 'Orange Blossom', 'Acacia', 'Other'];

export default function AddHarvestScreen({ navigation, route }) {
  const { addHarvest, hives } = useApp();
  const hiveId = route.params?.hiveId;
  const hive = hives.find(h => h.id === hiveId);

  const [amountKg, setAmountKg] = useState('');
  const [honeyType, setHoneyType] = useState('Wildflower');
  const [frames, setFrames] = useState('');
  const [notes, setNotes] = useState('');

  function handleSave() {
    if (!amountKg.trim() || isNaN(parseFloat(amountKg))) {
      return;
    }
    addHarvest({ hiveId, amountKg, honeyType, frames, notes });
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {hive && <Text style={styles.hiveLabel}>Harvest from: {hive.name}</Text>}

      <Field label="Amount Harvested (kg) *">
        <TextInput
          style={styles.input} value={amountKg} onChangeText={setAmountKg}
          placeholder="e.g. 12.5" placeholderTextColor={colors.border}
          keyboardType="decimal-pad"
        />
      </Field>

      <Field label="Honey Type">
        <View style={styles.chipRow}>
          {HONEY_TYPES.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, honeyType === t && styles.chipSelected]} onPress={() => setHoneyType(t)}>
              <Text style={[styles.chipText, honeyType === t && styles.chipTextSelected]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Frames Extracted">
        <TextInput
          style={styles.input} value={frames} onChangeText={setFrames}
          placeholder="e.g. 6" placeholderTextColor={colors.border}
          keyboardType="numeric"
        />
      </Field>

      <Field label="Notes">
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes} onChangeText={setNotes}
          placeholder="Quality, color, extraction method..."
          placeholderTextColor={colors.border}
          multiline numberOfLines={4} textAlignVertical="top"
        />
      </Field>

      <TouchableOpacity style={[styles.saveButton, !amountKg && styles.saveButtonDisabled]} onPress={handleSave} disabled={!amountKg}>
        <Text style={styles.saveButtonText}>Record Harvest</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  hiveLabel: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  field: { marginBottom: spacing.md },
  label: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.textLight, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md,
    fontSize: fonts.sizes.md, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  textArea: { height: 100 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { fontSize: fonts.sizes.sm, color: colors.textLight, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  saveButton: {
    backgroundColor: colors.primary, borderRadius: 14, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.md,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700' },
});
