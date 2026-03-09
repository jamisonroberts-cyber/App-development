import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';

const BROOD_PATTERNS = ['Solid','Good (few gaps)','Spotty','Very Spotty','No Brood'];
const POPULATION_ESTIMATES = ['Very Weak (<3 frames)','Weak (3-5 frames)','Medium (5-7 frames)','Strong (7-9 frames)','Very Strong (9+ frames)'];
const MITE_METHODS = ['Alcohol Wash','Sugar Roll','Sticky Board (24hr)','Visual'];
const TREATMENTS = ['None','Oxalic Acid (Dribble)','Oxalic Acid (Vaporize)','MAQS (Formic Pro)','Apivar (Amitraz)','ApiGuard (Thymol)','HopGuard','Other'];

export default function DetailedInspectionScreen({ route, navigation }) {
  const { hiveId } = route.params;
  const { hives, addInspection } = useApp();
  const hive = hives.find(h => h.id === hiveId);

  const [form, setForm] = useState({
    queenSeen: null,
    eggs: null,
    larvae: null,
    cappedBrood: null,
    broodPattern: BROOD_PATTERNS[0],
    queenCells: false,
    swarmCells: false,
    emergencyCells: false,
    temperament: null,
    populationEstimate: POPULATION_ESTIMATES[3],
    pollen: null,
    storesAdequate: null,
    miteCount: '',
    miteMethod: MITE_METHODS[0],
    treatment: TREATMENTS[0],
    hygienic: false,
    weight: '',
    supers: '',
    disease: { afb: false, efb: false, chalkbrood: false, sacbrood: false, nosema: false },
    pests: { waxMoth: false, smallHiveBeetle: false, yellowJackets: false, ants: false },
    notes: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setDisease = (key, val) => setForm(f => ({ ...f, disease: { ...f.disease, [key]: val } }));
  const setPest = (key, val) => setForm(f => ({ ...f, pests: { ...f.pests, [key]: val } }));

  function handleSave() {
    if (form.queenSeen === null && form.eggs === null) {
      Alert.alert('Required', 'Please indicate queen status.');
      return;
    }
    addInspection({ ...form, hiveId, type: 'detailed' });
    navigation.goBack();
  }

  if (!hive) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hiveChip}>
          <View style={[styles.hiveColorDot, { backgroundColor: hive.color || colors.primary }]} />
          <Text style={styles.hiveChipText}>{hive.name}</Text>
          <View style={styles.fullBadge}>
            <Ionicons name="clipboard" size={12} color={colors.success} />
            <Text style={styles.fullBadgeText}>Full Inspection</Text>
          </View>
        </View>

        {/* QUEEN & BROOD */}
        <SectionHeader title="Queen & Brood" />
        <View style={styles.card}>
          <YesNoField label="Queen seen?" value={form.queenSeen} onChange={v => set('queenSeen', v)} />
          <YesNoField label="Eggs present?" value={form.eggs} onChange={v => set('eggs', v)} />
          <YesNoField label="Young larvae?" value={form.larvae} onChange={v => set('larvae', v)} />
          <YesNoField label="Capped brood?" value={form.cappedBrood} onChange={v => set('cappedBrood', v)} />
          <SelectField label="Brood Pattern" value={form.broodPattern} options={BROOD_PATTERNS} onSelect={v => set('broodPattern', v)} />
        </View>

        {/* QUEEN CELLS */}
        <SectionHeader title="Queen Cells" />
        <View style={styles.card}>
          <ToggleRow label="🔄 Supercedure Cells (on face of comb)" value={form.queenCells} onChange={v => set('queenCells', v)} />
          <ToggleRow label="🐝 Swarm Cells (on bottom of frames)" value={form.swarmCells} onChange={v => set('swarmCells', v)} />
          <ToggleRow label="🚨 Emergency Cells (torn down look)" value={form.emergencyCells} onChange={v => set('emergencyCells', v)} />
          {(form.swarmCells || form.queenCells) && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <Text style={styles.warningText}>Queen cells found! Consider making a split or other swarm prevention measures.</Text>
            </View>
          )}
        </View>

        {/* COLONY */}
        <SectionHeader title="Colony Status" />
        <View style={styles.card}>
          <SelectField label="Population Estimate" value={form.populationEstimate} options={POPULATION_ESTIMATES} onSelect={v => set('populationEstimate', v)} />
          <YesNoField label="Adequate pollen stores?" value={form.pollen} onChange={v => set('pollen', v)} />
          <YesNoField label="Adequate honey/nectar stores?" value={form.storesAdequate} onChange={v => set('storesAdequate', v)} />
          <Text style={styles.fieldLabel}>Temperament</Text>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} style={[styles.ratingBtn, form.temperament === n && styles.ratingBtnActive]} onPress={() => set('temperament', n)}>
                <Text style={[styles.ratingText, form.temperament === n && styles.ratingTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.ratingHint}>1=Calm  5=Very Defensive</Text>
          </View>
          <ToggleRow label="Hygienic Behavior Observed?" value={form.hygienic} onChange={v => set('hygienic', v)} />
        </View>

        {/* VARROA */}
        <SectionHeader title="Varroa Mite Monitoring" />
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Mite Count (%)</Text>
          <TextInput style={styles.input} value={form.miteCount} onChangeText={v => set('miteCount', v)} placeholder="e.g. 1.5" keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
          {parseFloat(form.miteCount) >= 2 && (
            <View style={styles.dangerBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.dangerText}>
                {parseFloat(form.miteCount) >= 3
                  ? 'CRITICAL: Mite level above emergency threshold (3%). Treat immediately!'
                  : 'At treatment threshold (2%). Treatment is recommended.'}
              </Text>
            </View>
          )}
          <SelectField label="Count Method" value={form.miteMethod} options={MITE_METHODS} onSelect={v => set('miteMethod', v)} />
          <SelectField label="Treatment Applied" value={form.treatment} options={TREATMENTS} onSelect={v => set('treatment', v)} />
        </View>

        {/* DISEASES */}
        <SectionHeader title="Disease Signs" />
        <View style={styles.card}>
          {Object.entries({ afb: '⚠️ American Foulbrood (AFB) — Report to NCDA!', efb: '⚠️ European Foulbrood (EFB)', chalkbrood: '🍄 Chalkbrood', sacbrood: '🦠 Sacbrood', nosema: '🔬 Nosema signs' }).map(([key, label]) => (
            <CheckRow key={key} label={label} value={form.disease[key]} onChange={v => setDisease(key, v)} />
          ))}
          {form.disease.afb && (
            <View style={styles.dangerBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.dangerText}>AFB is a REPORTABLE disease in NC. Contact NC Dept of Agriculture immediately: 1-800-206-9333</Text>
            </View>
          )}
        </View>

        {/* PESTS */}
        <SectionHeader title="Pest Observations" />
        <View style={styles.card}>
          {Object.entries({ waxMoth: '🦋 Wax Moth', smallHiveBeetle: '🪲 Small Hive Beetle', yellowJackets: '🐝 Yellow Jacket Robbing', ants: '🐜 Ant Infestation' }).map(([key, label]) => (
            <CheckRow key={key} label={label} value={form.pests[key]} onChange={v => setPest(key, v)} />
          ))}
        </View>

        {/* EQUIPMENT */}
        <SectionHeader title="Equipment & Weight" />
        <View style={styles.card}>
          <FormField label="Hive Weight (lbs)" value={form.weight} onChangeText={v => set('weight', v)} placeholder="e.g. 72" keyboardType="decimal-pad" />
          <FormField label="Number of Supers" value={form.supers} onChangeText={v => set('supers', v)} placeholder="e.g. 1 medium super" />
        </View>

        {/* NOTES */}
        <SectionHeader title="Inspector Notes" />
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={form.notes}
          onChangeText={v => set('notes', v)}
          placeholder="Detailed observations, actions taken, follow-up needed..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={5}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>Save Full Inspection</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function YesNoField({ label, value, onChange }) {
  return (
    <View style={styles.yesNoField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.yesNoRow}>
        <TouchableOpacity style={[styles.yesNoBtn, value === true && styles.yesNoBtnYes]} onPress={() => onChange(true)}>
          <Ionicons name="checkmark" size={15} color={value === true ? '#FFF' : colors.success} />
          <Text style={[styles.yesNoText, value === true && styles.yesNoTextActive]}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.yesNoBtn, value === false && styles.yesNoBtnNo]} onPress={() => onChange(false)}>
          <Ionicons name="close" size={15} color={value === false ? '#FFF' : colors.danger} />
          <Text style={[styles.yesNoText, value === false && styles.yesNoTextActive]}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.fieldLabel, { flex: 1 }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

function CheckRow({ label, value, onChange }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={() => onChange(!value)}>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </View>
      <Text style={[styles.checkLabel, value && styles.checkLabelChecked]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SelectField({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.selectField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectBtn} onPress={() => setOpen(!open)}>
        <Text style={styles.selectValue}>{value}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textLight} />
      </TouchableOpacity>
      {open && (
        <View style={styles.optionsList}>
          {options.map(opt => (
            <TouchableOpacity key={opt} style={[styles.optionItem, opt === value && styles.optionItemSelected]} onPress={() => { onSelect(opt); setOpen(false); }}>
              <Text style={[styles.optionText, opt === value && styles.optionTextSelected]}>{opt}</Text>
              {opt === value && <Ionicons name="checkmark" size={14} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} keyboardType={keyboardType || 'default'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40 },

  hiveChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.round, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md, alignSelf: 'flex-start', ...shadow.sm },
  hiveColorDot: { width: 10, height: 10, borderRadius: 5 },
  hiveChipText: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  fullBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.successLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.round },
  fullBadgeText: { fontSize: fonts.sizes.xs, fontWeight: '700', color: colors.success },

  sectionTitle: { fontSize: fonts.sizes.sm, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs, marginTop: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadow.sm, gap: spacing.sm },
  fieldLabel: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text },

  yesNoField: { gap: spacing.xs },
  yesNoRow: { flexDirection: 'row', gap: spacing.sm },
  yesNoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border },
  yesNoBtnYes: { backgroundColor: colors.success, borderColor: colors.success },
  yesNoBtnNo: { backgroundColor: colors.danger, borderColor: colors.danger },
  yesNoText: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.textMid },
  yesNoTextActive: { color: '#FFF' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  ratingBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  ratingBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  ratingText: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.textMid },
  ratingTextActive: { color: '#FFF' },
  ratingHint: { fontSize: fonts.sizes.xs, color: colors.textMuted },

  warningBanner: { flexDirection: 'row', gap: spacing.xs, backgroundColor: colors.warningLight, padding: spacing.sm, borderRadius: radius.sm, alignItems: 'flex-start' },
  warningText: { flex: 1, fontSize: fonts.sizes.sm, color: '#7A4000', lineHeight: 18 },
  dangerBanner: { flexDirection: 'row', gap: spacing.xs, backgroundColor: colors.dangerLight, padding: spacing.sm, borderRadius: radius.sm, alignItems: 'flex-start' },
  dangerText: { flex: 1, fontSize: fonts.sizes.sm, color: colors.danger, lineHeight: 18, fontWeight: '600' },

  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { fontSize: fonts.sizes.sm, color: colors.text, flex: 1 },
  checkLabelChecked: { fontWeight: '700' },

  selectField: { gap: 4 },
  selectBtn: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectValue: { fontSize: fonts.sizes.sm, color: colors.text },
  optionsList: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  optionItemSelected: { backgroundColor: colors.surfaceAlt },
  optionText: { fontSize: fonts.sizes.sm, color: colors.text },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },

  formField: { gap: 4 },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, fontSize: fonts.sizes.md, color: colors.text },
  notesInput: { minHeight: 120, textAlignVertical: 'top' },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.success, borderRadius: radius.round, padding: spacing.md, marginTop: spacing.lg },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: fonts.sizes.md },
});
