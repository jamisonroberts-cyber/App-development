import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts, radius, shadow } from '../utils/theme';

export default function ApiaryScreen({ navigation }) {
  const { apiaries, addApiary, deleteApiary, getApiaryHives } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', notes: '' });

  function handleAdd() {
    if (!form.name.trim()) { Alert.alert('Required', 'Please enter an apiary name.'); return; }
    addApiary({ name: form.name.trim(), location: form.location.trim(), notes: form.notes.trim() });
    setForm({ name: '', location: '', notes: '' });
    setShowModal(false);
  }

  function handleDelete(apiary) {
    const hiveCount = getApiaryHives(apiary.id).length;
    Alert.alert(
      'Delete Apiary',
      `Delete "${apiary.name}"? This will also delete ${hiveCount} hive(s) and all their data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteApiary(apiary.id) },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>My Apiaries</Text>
            <Text style={styles.pageSubtitle}>Randolph County, NC</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={22} color="#FFF" />
            <Text style={styles.addBtnText}>Add Apiary</Text>
          </TouchableOpacity>
        </View>

        {apiaries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏡</Text>
            <Text style={styles.emptyTitle}>No Apiaries Yet</Text>
            <Text style={styles.emptyText}>Add your first apiary to start organizing your hives by location.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyBtnText}>Add First Apiary</Text>
            </TouchableOpacity>
          </View>
        ) : (
          apiaries.map(apiary => {
            const hives = getApiaryHives(apiary.id);
            return (
              <TouchableOpacity
                key={apiary.id}
                style={styles.apiaryCard}
                onPress={() => navigation.navigate('ApiaryDetail', { apiaryId: apiary.id })}
                activeOpacity={0.8}
              >
                <View style={styles.apiaryTop}>
                  <View style={styles.apiaryIconWrap}>
                    <Text style={styles.apiaryIcon}>🏡</Text>
                  </View>
                  <View style={styles.apiaryInfo}>
                    <Text style={styles.apiaryName}>{apiary.name}</Text>
                    {apiary.location ? <Text style={styles.apiaryLocation}><Ionicons name="location-outline" size={12} color={colors.textLight} /> {apiary.location}</Text> : null}
                    {apiary.notes ? <Text style={styles.apiaryNotes} numberOfLines={1}>{apiary.notes}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(apiary)} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.apiaryStats}>
                  <View style={styles.apiaryStatItem}>
                    <Text style={styles.apiaryStatValue}>{hives.length}</Text>
                    <Text style={styles.apiaryStatLabel}>Hives</Text>
                  </View>
                  <View style={styles.apiaryStatDivider} />
                  <View style={styles.apiaryStatItem}>
                    <Text style={styles.apiaryStatValue}>{hives.filter(h => h.status !== 'Dead' && h.status !== 'Absconded').length}</Text>
                    <Text style={styles.apiaryStatLabel}>Active</Text>
                  </View>
                  <View style={styles.apiaryStatDivider} />
                  <View style={styles.apiaryStatItem}>
                    <Text style={styles.apiaryStatValue}>{apiary.created ? new Date(apiary.created).getFullYear() : '—'}</Text>
                    <Text style={styles.apiaryStatLabel}>Est.</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={styles.apiaryArrow}>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                  </View>
                </View>

                {hives.length > 0 && (
                  <View style={styles.hivePreview}>
                    {hives.slice(0, 5).map(hive => (
                      <View key={hive.id} style={[styles.hiveChip, { backgroundColor: (hive.color || colors.primary) + '22', borderColor: hive.color || colors.primary }]}>
                        <Text style={[styles.hiveChipText, { color: hive.color || colors.primaryDark }]} numberOfLines={1}>{hive.name}</Text>
                      </View>
                    ))}
                    {hives.length > 5 && <Text style={styles.moreHives}>+{hives.length - 5} more</Text>}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Apiary Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Apiary</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <FormField label="Apiary Name *" value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} placeholder="e.g. Home Yard, Back Pasture" />
            <FormField label="Location" value={form.location} onChangeText={t => setForm(f => ({ ...f, location: t }))} placeholder="e.g. Asheboro, NC" />
            <FormField label="Notes" value={form.notes} onChangeText={t => setForm(f => ({ ...f, notes: t }))} placeholder="Optional notes about this location" multiline />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Add Apiary</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  pageTitle: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.text },
  pageSubtitle: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.round, gap: 4 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: fonts.sizes.sm },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.lg },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.round },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: fonts.sizes.md },

  apiaryCard: { backgroundColor: colors.surface, borderRadius: radius.xl, marginBottom: spacing.md, overflow: 'hidden', ...shadow.md },
  apiaryTop: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.md },
  apiaryIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  apiaryIcon: { fontSize: 24 },
  apiaryInfo: { flex: 1 },
  apiaryName: { fontSize: fonts.sizes.lg, fontWeight: '800', color: colors.text },
  apiaryLocation: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  apiaryNotes: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: 4 },

  apiaryStats: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  apiaryStatItem: { alignItems: 'center', paddingHorizontal: spacing.sm },
  apiaryStatValue: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.primary },
  apiaryStatLabel: { fontSize: fonts.sizes.xs, color: colors.textLight, fontWeight: '500' },
  apiaryStatDivider: { width: 1, height: 28, backgroundColor: colors.divider },
  apiaryArrow: { marginLeft: 'auto' },

  hivePreview: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.xs },
  hiveChip: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.round, borderWidth: 1 },
  hiveChipText: { fontSize: fonts.sizes.xs, fontWeight: '600' },
  moreHives: { fontSize: fonts.sizes.xs, color: colors.textLight, alignSelf: 'center' },

  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  modalTitle: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.text },
  modalContent: { padding: spacing.md },

  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, fontSize: fonts.sizes.md, color: colors.text },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.round, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: fonts.sizes.md },
});
