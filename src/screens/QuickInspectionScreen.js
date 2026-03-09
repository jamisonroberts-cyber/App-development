import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';

export default function QuickInspectionScreen({ route, navigation }) {
  const { hiveId } = route.params;
  const { hives, addInspection } = useApp();
  const hive = hives.find(h => h.id === hiveId);

  const [queenSeen, setQueenSeen] = useState(null);
  const [eggsPresent, setEggsPresent] = useState(null);
  const [storesAdequate, setStoresAdequate] = useState(null);
  const [temperament, setTemperament] = useState(null);
  const [miteCount, setMiteCount] = useState('');
  const [signs, setSigns] = useState({ swarm: false, disease: false, waxMoth: false, robbing: false });
  const [notes, setNotes] = useState('');

  function handleSave() {
    if (queenSeen === null && eggsPresent === null) {
      Alert.alert('Required', 'Please indicate whether the queen was seen or if eggs were present.');
      return;
    }
    addInspection({
      hiveId,
      type: 'quick',
      queenSeen: queenSeen === true,
      eggsPresent: eggsPresent === true,
      storesAdequate: storesAdequate === true,
      temperament: temperament?.toString(),
      miteCount,
      miteMethod: 'Visual',
      signs,
      notes,
    });
    navigation.goBack();
  }

  if (!hive) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hiveChip}>
          <View style={[styles.hiveColorDot, { backgroundColor: hive.color || colors.primary }]} />
          <Text style={styles.hiveChipText}>{hive.name}</Text>
          <View style={styles.quickBadge}>
            <Ionicons name="flash" size={12} color={colors.primary} />
            <Text style={styles.quickBadgeText}>Quick Check</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Queen Status</Text>
        <View style={styles.card}>
          <YesNoField label="Did you see the queen?" value={queenSeen} onChange={setQueenSeen} />
          <YesNoField label="Were eggs present?" value={eggsPresent} onChange={setEggsPresent} />
        </View>

        <Text style={styles.sectionTitle}>Colony Status</Text>
        <View style={styles.card}>
          <YesNoField label="Stores adequate?" value={storesAdequate} onChange={setStoresAdequate} />
          <Text style={styles.fieldLabel}>Temperament</Text>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} style={[styles.ratingBtn, temperament === n && styles.ratingBtnActive]} onPress={() => setTemperament(n)}>
                <Text style={[styles.ratingText, temperament === n && styles.ratingTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.ratingHint}>1=Calm  5=Hot</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mite Count (optional)</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Mite % (visual estimate or wash)</Text>
          <TextInput
            style={styles.input}
            value={miteCount}
            onChangeText={setMiteCount}
            placeholder="e.g. 1.5"
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textMuted}
          />
          {parseFloat(miteCount) >= 2 && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <Text style={styles.warningText}>Mite count at or above treatment threshold (2%). Consider treatment.</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Signs & Concerns</Text>
        <View style={styles.card}>
          {Object.entries({ swarm: '🐝 Swarm Signs (queen cells)', disease: '🦠 Disease Signs', waxMoth: '🦋 Wax Moth Activity', robbing: '⚠️ Robbing Behavior' }).map(([key, label]) => (
            <TouchableOpacity key={key} style={styles.checkRow} onPress={() => setSigns(s => ({ ...s, [key]: !s[key] }))}>
              <View style={[styles.checkbox, signs[key] && styles.checkboxChecked]}>
                {signs[key] && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Quick observations, things to follow up on..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>Save Quick Check</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function YesNoField({ label, value, onChange }) {
  return (
    <View style={styles.yesNoField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.yesNoRow}>
        <TouchableOpacity style={[styles.yesNoBtn, value === true && styles.yesNoBtnYes]} onPress={() => onChange(true)}>
          <Ionicons name="checkmark" size={16} color={value === true ? '#FFF' : colors.success} />
          <Text style={[styles.yesNoText, value === true && styles.yesNoTextActive]}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.yesNoBtn, value === false && styles.yesNoBtnNo]} onPress={() => onChange(false)}>
          <Ionicons name="close" size={16} color={value === false ? '#FFF' : colors.danger} />
          <Text style={[styles.yesNoText, value === false && styles.yesNoTextActive]}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40 },

  hiveChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.round, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.lg, alignSelf: 'flex-start', ...shadow.sm },
  hiveColorDot: { width: 10, height: 10, borderRadius: 5 },
  hiveChipText: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  quickBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.round },
  quickBadgeText: { fontSize: fonts.sizes.xs, fontWeight: '700', color: colors.primaryDark },

  sectionTitle: { fontSize: fonts.sizes.sm, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs, marginTop: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadow.sm, gap: spacing.sm },
  fieldLabel: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text },

  yesNoField: { gap: spacing.xs },
  yesNoRow: { flexDirection: 'row', gap: spacing.sm },
  yesNoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border },
  yesNoBtnYes: { backgroundColor: colors.success, borderColor: colors.success },
  yesNoBtnNo: { backgroundColor: colors.danger, borderColor: colors.danger },
  yesNoText: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.textMid },
  yesNoTextActive: { color: '#FFF' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  ratingBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  ratingBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  ratingText: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.textMid },
  ratingTextActive: { color: '#FFF' },
  ratingHint: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginLeft: spacing.xs },

  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, fontSize: fonts.sizes.md, color: colors.text },
  notesInput: { minHeight: 100, textAlignVertical: 'top' },
  warningBanner: { flexDirection: 'row', gap: spacing.xs, backgroundColor: colors.warningLight, padding: spacing.sm, borderRadius: radius.sm, alignItems: 'flex-start' },
  warningText: { flex: 1, fontSize: fonts.sizes.sm, color: '#7A4000' },

  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { fontSize: fonts.sizes.md, color: colors.text },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.round, padding: spacing.md, marginTop: spacing.lg },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: fonts.sizes.md },
});
