import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';

const HONEY_TYPES = ['Tulip Poplar','Black Locust','Sourwood','Goldenrod','Wildflower/Mixed','Clover','Spring Blend','Fall Blend','Other'];

export default function AddHarvestScreen({ route, navigation }) {
  const { hiveId } = route.params;
  const { hives, addHarvest } = useApp();
  const hive = hives.find(h => h.id === hiveId);

  const [amountLbs, setAmountLbs] = useState('');
  const [honeyType, setHoneyType] = useState(HONEY_TYPES[0]);
  const [frames, setFrames] = useState('');
  const [typeOpen, setTypeOpen] = useState(false);
  const [notes, setNotes] = useState('');

  function handleSave() {
    if (!amountLbs || isNaN(parseFloat(amountLbs))) {
      Alert.alert('Required', 'Please enter the honey amount in pounds.');
      return;
    }
    addHarvest({ hiveId, amountLbs, honeyType, frames, notes });
    navigation.goBack();
  }

  if (!hive) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hiveChip}>
          <View style={[styles.hiveColorDot, { backgroundColor: hive.color || colors.primary }]} />
          <Text style={styles.hiveChipText}>{hive.name}</Text>
        </View>

        <View style={styles.honeyIcon}>
          <Text style={{ fontSize: 64 }}>🍯</Text>
          <Text style={styles.honeyTitle}>Record Harvest</Text>
          <Text style={styles.honeySubtitle}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        </View>

        <Text style={styles.sectionTitle}>Harvest Details</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Amount (lbs) *</Text>
            <TextInput style={[styles.input, styles.bigInput]} value={amountLbs} onChangeText={setAmountLbs} placeholder="0.0" keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Honey Type</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => setTypeOpen(!typeOpen)}>
              <Text style={styles.selectValue}>{honeyType}</Text>
              <Ionicons name={typeOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textLight} />
            </TouchableOpacity>
            {typeOpen && (
              <View style={styles.optionsList}>
                {HONEY_TYPES.map(t => (
                  <TouchableOpacity key={t} style={[styles.optionItem, t === honeyType && styles.optionItemSelected]} onPress={() => { setHoneyType(t); setTypeOpen(false); }}>
                    <Text style={[styles.optionText, t === honeyType && styles.optionTextSelected]}>{t}</Text>
                    {t === honeyType && <Ionicons name="checkmark" size={14} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Frames Extracted</Text>
            <TextInput style={styles.input} value={frames} onChangeText={setFrames} placeholder="e.g. 6" keyboardType="numeric" placeholderTextColor={colors.textMuted} />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput style={[styles.input, styles.notesInput]} value={notes} onChangeText={setNotes} placeholder="Color, flavor notes, extraction date..." placeholderTextColor={colors.textMuted} multiline numberOfLines={3} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="water" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>Save Harvest</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40 },
  hiveChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.round, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md, alignSelf: 'flex-start', ...shadow.sm },
  hiveColorDot: { width: 10, height: 10, borderRadius: 5 },
  hiveChipText: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  honeyIcon: { alignItems: 'center', paddingVertical: spacing.lg },
  honeyTitle: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  honeySubtitle: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 4 },
  sectionTitle: { fontSize: fonts.sizes.sm, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadow.sm },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, fontSize: fonts.sizes.md, color: colors.text },
  bigInput: { fontSize: fonts.sizes.xxxl, fontWeight: '800', textAlign: 'center', color: colors.primary },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  selectBtn: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectValue: { fontSize: fonts.sizes.md, color: colors.text },
  optionsList: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 4 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  optionItemSelected: { backgroundColor: colors.surfaceAlt },
  optionText: { fontSize: fonts.sizes.md, color: colors.text },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.round, padding: spacing.md, marginTop: spacing.lg },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: fonts.sizes.md },
});
