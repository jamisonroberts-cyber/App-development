import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Modal, TextInput, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';

const HIVE_COLORS = ['#F5A623','#5B8A3C','#2980B9','#8E44AD','#E74C3C','#16A085','#F39C12','#2C3E50'];
const HIVE_TYPES = ['Langstroth 10-frame','Langstroth 8-frame','Warré','Top-Bar','Flow Hive','Nucleus (Nuc)','Other'];
const QUEEN_BREEDS = ['Italian','Carniolan','Russian','Buckfast','VSH (Varroa Sensitive Hygienic)','Cordovan','Local Survivor','Unknown'];
const QUEEN_SOURCES = ['Package','Nuc','Split','Swarm','Purchased Queen','Local Breeder','Raised Own','Unknown'];
const QUEEN_COLORS = ['Yellow (2021/2026)','Red (2022/2027)','Green (2023/2028)','Blue (2024/2029)','White (2025/2030)','Unmarked'];
const HIVE_STATUSES = ['Active','Weak','Queen Issues','Deadout','Absconded'];

export default function ApiaryDetailScreen({ route, navigation }) {
  const { apiaryId } = route.params;
  const { apiaries, getApiaryHives, addHive, deleteHive } = useApp();
  const apiary = apiaries.find(a => a.id === apiaryId);
  const hives = getApiaryHives(apiaryId);

  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(HIVE_COLORS[0]);
  const [form, setForm] = useState({
    name: '', type: HIVE_TYPES[0], established: '',
    queenBreed: QUEEN_BREEDS[0], queenSource: QUEEN_SOURCES[0],
    queenYear: new Date().getFullYear().toString(),
    queenMarked: false, queenColor: QUEEN_COLORS[3],
    status: 'Active', weight: '', boxes: '', notes: '',
  });

  if (!apiary) return null;

  function handleAdd() {
    if (!form.name.trim()) { Alert.alert('Required', 'Please enter a hive name.'); return; }
    addHive({ ...form, apiaryId, color: selectedColor, name: form.name.trim() });
    resetForm();
    setShowModal(false);
  }

  function resetForm() {
    setForm({ name: '', type: HIVE_TYPES[0], established: '', queenBreed: QUEEN_BREEDS[0], queenSource: QUEEN_SOURCES[0], queenYear: new Date().getFullYear().toString(), queenMarked: false, queenColor: QUEEN_COLORS[3], status: 'Active', weight: '', boxes: '', notes: '' });
    setSelectedColor(HIVE_COLORS[0]);
  }

  function handleDelete(hive) {
    Alert.alert('Delete Hive', `Delete "${hive.name}"? All inspection and harvest data will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHive(hive.id) },
    ]);
  }

  const activeHives = hives.filter(h => h.status !== 'Deadout' && h.status !== 'Absconded');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Apiary Header */}
        <View style={styles.apiaryHeader}>
          <Text style={styles.apiaryName}>{apiary.name}</Text>
          {apiary.location ? <Text style={styles.apiaryLocation}><Ionicons name="location-outline" size={13} color={colors.textLight} /> {apiary.location}</Text> : null}
          {apiary.notes ? <Text style={styles.apiaryNotes}>{apiary.notes}</Text> : null}
          <View style={styles.apiaryMeta}>
            <MetaBadge icon="layers-outline" label={`${hives.length} Hive${hives.length !== 1 ? 's' : ''}`} />
            <MetaBadge icon="checkmark-circle-outline" label={`${activeHives.length} Active`} color={colors.success} />
          </View>
        </View>

        {/* Add Hive Button */}
        <TouchableOpacity style={styles.addHiveBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add-circle" size={22} color={colors.primary} />
          <Text style={styles.addHiveBtnText}>Add Hive</Text>
        </TouchableOpacity>

        {/* Hive Grid */}
        {hives.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🐝</Text>
            <Text style={styles.emptyTitle}>No Hives Yet</Text>
            <Text style={styles.emptyText}>Add your first hive to this apiary.</Text>
          </View>
        ) : (
          hives.map(hive => (
            <HiveCard
              key={hive.id}
              hive={hive}
              onPress={() => navigation.navigate('HiveDetail', { hiveId: hive.id })}
              onDelete={() => handleDelete(hive)}
            />
          ))
        )}
      </ScrollView>

      {/* Add Hive Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Hive</Text>
            <TouchableOpacity onPress={() => { resetForm(); setShowModal(false); }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <FormField label="Hive Name *" value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} placeholder="e.g. Hive 1, Back Row Left" />

            <Text style={styles.fieldLabel}>Hive Color</Text>
            <View style={styles.colorRow}>
              {HIVE_COLORS.map(c => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotSelected]} onPress={() => setSelectedColor(c)} />
              ))}
            </View>

            <SelectField label="Hive Type" value={form.type} options={HIVE_TYPES} onSelect={t => setForm(f => ({ ...f, type: t }))} />
            <FormField label="Date Established" value={form.established} onChangeText={t => setForm(f => ({ ...f, established: t }))} placeholder="e.g. 2024-04-15" />
            <SelectField label="Status" value={form.status} options={HIVE_STATUSES} onSelect={t => setForm(f => ({ ...f, status: t }))} />

            <Text style={styles.sectionDivider}>Queen Information</Text>
            <SelectField label="Queen Breed / Genetics" value={form.queenBreed} options={QUEEN_BREEDS} onSelect={t => setForm(f => ({ ...f, queenBreed: t }))} />
            <SelectField label="Queen Source" value={form.queenSource} options={QUEEN_SOURCES} onSelect={t => setForm(f => ({ ...f, queenSource: t }))} />
            <FormField label="Queen Year" value={form.queenYear} onChangeText={t => setForm(f => ({ ...f, queenYear: t }))} placeholder="e.g. 2024" />
            <SelectField label="Queen Mark Color" value={form.queenColor} options={QUEEN_COLORS} onSelect={t => setForm(f => ({ ...f, queenColor: t }))} />
            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Queen Marked</Text>
              <Switch value={form.queenMarked} onValueChange={v => setForm(f => ({ ...f, queenMarked: v }))} trackColor={{ true: colors.primary }} />
            </View>

            <Text style={styles.sectionDivider}>Equipment</Text>
            <FormField label="Current Weight (lbs)" value={form.weight} onChangeText={t => setForm(f => ({ ...f, weight: t }))} placeholder="e.g. 72" />
            <FormField label="Box Configuration" value={form.boxes} onChangeText={t => setForm(f => ({ ...f, boxes: t }))} placeholder="e.g. 2 deeps + 1 medium super" />
            <FormField label="Notes" value={form.notes} onChangeText={t => setForm(f => ({ ...f, notes: t }))} placeholder="Any notes about this hive" multiline />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Add Hive</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function HiveCard({ hive, onPress, onDelete }) {
  const statusColor = {
    Active: colors.success, Weak: colors.warning,
    'Queen Issues': colors.danger, Deadout: '#666', Absconded: '#666',
  }[hive.status] || colors.textLight;

  return (
    <TouchableOpacity style={styles.hiveCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.hiveColorBar, { backgroundColor: hive.color || colors.primary }]} />
      <View style={styles.hiveContent}>
        <View style={styles.hiveTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hiveName}>{hive.name}</Text>
            <Text style={styles.hiveType}>{hive.type}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{hive.status || 'Active'}</Text>
            </View>
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.hiveMeta}>
          {hive.queenBreed && <MetaChip icon="🐝" label={hive.queenBreed} />}
          {hive.established && <MetaChip icon="📅" label={`Est. ${hive.established}`} />}
          {hive.weight && <MetaChip icon="⚖️" label={`${hive.weight} lbs`} />}
          {hive.queenMarked && <MetaChip icon="👑" label={`Marked ${hive.queenColor || ''}`} />}
        </View>

        <View style={styles.hiveActions}>
          <Text style={styles.viewDetail}>View Details <Ionicons name="chevron-forward" size={12} color={colors.primary} /></Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MetaBadge({ icon, label, color }) {
  return (
    <View style={[styles.metaBadge, { borderColor: (color || colors.primary) + '44', backgroundColor: (color || colors.primary) + '11' }]}>
      <Ionicons name={icon} size={13} color={color || colors.primary} />
      <Text style={[styles.metaBadgeText, { color: color || colors.primaryDark }]}>{label}</Text>
    </View>
  );
}

function MetaChip({ icon, label }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>{icon} {label}</Text>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value} onChangeText={onChangeText}
        placeholder={placeholder} placeholderTextColor={colors.textMuted}
        multiline={multiline} numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

function SelectField({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectBtn} onPress={() => setOpen(!open)}>
        <Text style={styles.selectValue}>{value}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textLight} />
      </TouchableOpacity>
      {open && (
        <View style={styles.optionsList}>
          {options.map(opt => (
            <TouchableOpacity key={opt} style={[styles.optionItem, opt === value && styles.optionItemSelected]} onPress={() => { onSelect(opt); setOpen(false); }}>
              <Text style={[styles.optionText, opt === value && styles.optionTextSelected]}>{opt}</Text>
              {opt === value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40 },

  apiaryHeader: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm },
  apiaryName: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.text },
  apiaryLocation: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  apiaryNotes: { fontSize: fonts.sizes.sm, color: colors.textMid, marginTop: 4 },
  apiaryMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.round, borderWidth: 1 },
  metaBadgeText: { fontSize: fonts.sizes.xs, fontWeight: '600' },

  addHiveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  addHiveBtnText: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.primary },

  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center' },

  hiveCard: { backgroundColor: colors.surface, borderRadius: radius.xl, marginBottom: spacing.md, flexDirection: 'row', overflow: 'hidden', ...shadow.md },
  hiveColorBar: { width: 6 },
  hiveContent: { flex: 1, padding: spacing.md },
  hiveTop: { flexDirection: 'row', marginBottom: spacing.sm },
  hiveName: { fontSize: fonts.sizes.lg, fontWeight: '800', color: colors.text },
  hiveType: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.round },
  statusText: { fontSize: fonts.sizes.xs, fontWeight: '700' },
  hiveMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  metaChip: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.round },
  metaChipText: { fontSize: fonts.sizes.xs, color: colors.textMid, fontWeight: '500' },
  hiveActions: { alignItems: 'flex-end' },
  viewDetail: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: '700' },

  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  modalTitle: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.text },
  modalContent: { padding: spacing.md, paddingBottom: 40 },

  sectionDivider: { fontSize: fonts.sizes.sm, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.md, marginBottom: spacing.xs, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.md },

  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, fontSize: fonts.sizes.md, color: colors.text },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },

  colorRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.md, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: colors.text },

  selectBtn: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectValue: { fontSize: fonts.sizes.md, color: colors.text },
  optionsList: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: 4, overflow: 'hidden' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  optionItemSelected: { backgroundColor: colors.surfaceAlt },
  optionText: { fontSize: fonts.sizes.md, color: colors.text },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.round, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: fonts.sizes.md },
});
