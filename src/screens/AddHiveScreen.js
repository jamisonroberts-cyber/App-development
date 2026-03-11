import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

const HIVE_TYPES = ['Langstroth', 'Top Bar', 'Warré', 'Flow Hive', 'Other'];
const HEALTH_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

export default function AddHiveScreen({ navigation, route }) {
  const { addHive, updateHive, hives, apiaries } = useApp();
  const editingId = route.params?.hiveId;
  const presetApiaryId = route.params?.apiaryId;
  const isEditing = !!editingId;

  const [name, setName] = useState('');
  const [type, setType] = useState('Langstroth');
  const [health, setHealth] = useState('Good');
  const [location, setLocation] = useState('');
  const [established, setEstablished] = useState('');
  const [notes, setNotes] = useState('');
  const [queenYear, setQueenYear] = useState('');
  const [apiaryId, setApiaryId] = useState(presetApiaryId || null);

  useEffect(() => {
    if (isEditing) {
      const hive = hives.find(h => h.id === editingId);
      if (hive) {
        setName(hive.name || '');
        setType(hive.type || 'Langstroth');
        setHealth(hive.health || 'Good');
        setLocation(hive.location || '');
        setEstablished(hive.established || '');
        setNotes(hive.notes || '');
        setQueenYear(hive.queenYear || '');
        setApiaryId(hive.apiaryId || null);
      }
    }
  }, []);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a hive name.');
      return;
    }
    const data = { name: name.trim(), type, health, location, established, notes, queenYear, apiaryId };
    if (isEditing) {
      updateHive(editingId, data);
    } else {
      addHive(data);
    }
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field label="Hive Name *">
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Garden Hive 1" placeholderTextColor={colors.border} />
      </Field>

      <Field label="Hive Type">
        <View style={styles.chipRow}>
          {HIVE_TYPES.map(t => (
            <TouchableOpacity
              key={t} style={[styles.chip, type === t && styles.chipSelected]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.chipText, type === t && styles.chipTextSelected]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Health Status">
        <View style={styles.chipRow}>
          {HEALTH_OPTIONS.map(h => (
            <TouchableOpacity
              key={h} style={[styles.chip, health === h && styles.chipSelected]}
              onPress={() => setHealth(h)}
            >
              <Text style={[styles.chipText, health === h && styles.chipTextSelected]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Location">
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Backyard, North field" placeholderTextColor={colors.border} />
      </Field>

      <Field label="Established (Year)">
        <TextInput style={styles.input} value={established} onChangeText={setEstablished} placeholder="e.g. 2024" placeholderTextColor={colors.border} keyboardType="numeric" maxLength={4} />
      </Field>

      <Field label="Queen Year">
        <TextInput style={styles.input} value={queenYear} onChangeText={setQueenYear} placeholder="e.g. 2025" placeholderTextColor={colors.border} keyboardType="numeric" maxLength={4} />
      </Field>

      {/* Apiary assignment — only show picker if there are multiple apiaries and no preset */}
      {apiaries.length > 0 && !presetApiaryId && (
        <Field label="Apiary">
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, !apiaryId && styles.chipSelected]}
              onPress={() => setApiaryId(null)}
            >
              <Text style={[styles.chipText, !apiaryId && styles.chipTextSelected]}>Unassigned</Text>
            </TouchableOpacity>
            {apiaries.map(a => (
              <TouchableOpacity
                key={a.id}
                style={[styles.chip, apiaryId === a.id && styles.chipSelected]}
                onPress={() => setApiaryId(a.id)}
              >
                <Text style={[styles.chipText, apiaryId === a.id && styles.chipTextSelected]}>{a.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
      )}

      <Field label="Notes">
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes} onChangeText={setNotes}
          placeholder="Any additional notes about this hive..."
          placeholderTextColor={colors.border}
          multiline numberOfLines={4} textAlignVertical="top"
        />
      </Field>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Add Hive'}</Text>
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
  saveButtonText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700' },
});
