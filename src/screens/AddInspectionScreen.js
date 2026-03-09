import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

const TEMPERAMENTS = ['Calm', 'Mild', 'Defensive', 'Aggressive'];
const BROOD_PATTERNS = ['Solid', 'Patchy', 'Spotty', 'None'];

export default function AddInspectionScreen({ navigation, route }) {
  const { addInspection, hives } = useApp();
  const hiveId = route.params?.hiveId;
  const hive = hives.find(h => h.id === hiveId);

  const [queenSeen, setQueenSeen] = useState(false);
  const [eggsPresent, setEggsPresent] = useState(false);
  const [swarmCells, setSwarmCells] = useState(false);
  const [frames, setFrames] = useState('');
  const [brood, setBrood] = useState('Solid');
  const [temperament, setTemperament] = useState('Calm');
  const [varroa, setVarroa] = useState('');
  const [notes, setNotes] = useState('');

  function handleSave() {
    addInspection({ hiveId, queenSeen, eggsPresent, swarmCells, frames, brood, temperament, varroa, notes });
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {hive && <Text style={styles.hiveLabel}>Inspecting: {hive.name}</Text>}

      <Field label="Queen Status">
        <SwitchRow label="Queen Seen" value={queenSeen} onChange={setQueenSeen} />
        <SwitchRow label="Eggs Present" value={eggsPresent} onChange={setEggsPresent} />
        <SwitchRow label="Swarm / Queen Cells" value={swarmCells} onChange={setSwarmCells} />
      </Field>

      <Field label="Number of Frames Covered">
        <TextInput style={styles.input} value={frames} onChangeText={setFrames} placeholder="e.g. 8" placeholderTextColor={colors.border} keyboardType="numeric" />
      </Field>

      <Field label="Brood Pattern">
        <View style={styles.chipRow}>
          {BROOD_PATTERNS.map(b => (
            <TouchableOpacity key={b} style={[styles.chip, brood === b && styles.chipSelected]} onPress={() => setBrood(b)}>
              <Text style={[styles.chipText, brood === b && styles.chipTextSelected]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Temperament">
        <View style={styles.chipRow}>
          {TEMPERAMENTS.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, temperament === t && styles.chipSelected]} onPress={() => setTemperament(t)}>
              <Text style={[styles.chipText, temperament === t && styles.chipTextSelected]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Varroa Mite Count (per 100 bees)">
        <TextInput style={styles.input} value={varroa} onChangeText={setVarroa} placeholder="e.g. 2" placeholderTextColor={colors.border} keyboardType="numeric" />
      </Field>

      <Field label="Notes">
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes} onChangeText={setNotes}
          placeholder="Observations, treatments, actions taken..."
          placeholderTextColor={colors.border}
          multiline numberOfLines={5} textAlignVertical="top"
        />
      </Field>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Inspection</Text>
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

function SwitchRow({ label, value, onChange }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} thumbColor="#fff" />
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
  textArea: { height: 120 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, padding: spacing.md, borderRadius: 10,
    marginBottom: 4, borderWidth: 1, borderColor: colors.border,
  },
  switchLabel: { fontSize: fonts.sizes.md, color: colors.text },
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
  saveButtonText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700' },
});
