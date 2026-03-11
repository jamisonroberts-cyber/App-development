import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

export default function HiveInventoryScreen({ route }) {
  const { hiveId, hiveName } = route.params;
  const {
    inventoryItems,
    getHiveInventoryRecords,
    getHiveInventoryCost,
    addHiveInventoryRecord,
    removeHiveInventoryRecord,
  } = useApp();

  const records = getHiveInventoryRecords(hiveId);
  const totalCost = getHiveInventoryCost(hiveId);

  const [showApply, setShowApply] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState('1');

  const unappliedItems = inventoryItems.filter(
    item => !records.some(r => r.inventoryItemId === item.id)
  );

  function handleApply() {
    if (!selectedItem || !qty) return;
    addHiveInventoryRecord({
      hiveId,
      inventoryItemId: selectedItem.id,
      quantity: parseFloat(qty) || 1,
    });
    setShowApply(false);
    setSelectedItem(null);
    setQty('1');
  }

  function handleRemove(record) {
    Alert.alert('Remove Item', `Remove ${record.item?.name} from this hive?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeHiveInventoryRecord(record.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.costBanner}>
        <Text style={styles.costLabel}>Total Investment in {hiveName}</Text>
        <Text style={styles.costValue}>${totalCost.toFixed(2)}</Text>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color={colors.border} />
          <Text style={styles.emptyTitle}>No Items Applied</Text>
          <Text style={styles.emptyText}>Apply inventory items to track your investment in this hive.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={r => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: record }) => {
            const cost = (parseFloat(record.quantity) || 0) * (parseFloat(record.item?.unitCost) || 0);
            return (
              <View style={styles.recordRow}>
                <View style={styles.recordLeft}>
                  <Text style={styles.recordName}>{record.item?.name}</Text>
                  <Text style={styles.recordMeta}>
                    {record.quantity} × ${parseFloat(record.item?.unitCost || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.recordRight}>
                  <Text style={styles.recordCost}>${cost.toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => handleRemove(record)}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {unappliedItems.length > 0 && (
        <TouchableOpacity style={styles.applyBtn} onPress={() => setShowApply(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.applyBtnText}>Apply Inventory Item</Text>
        </TouchableOpacity>
      )}

      {/* Apply Modal */}
      <Modal visible={showApply} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Apply Item to Hive</Text>
            <FlatList
              data={unappliedItems}
              keyExtractor={i => i.id}
              style={{ maxHeight: 200, marginBottom: spacing.md }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.selectRow, selectedItem?.id === item.id && styles.selectRowActive]}
                  onPress={() => setSelectedItem(item)}
                >
                  <Text style={[styles.selectText, selectedItem?.id === item.id && styles.selectTextActive]}>
                    {item.name} (${parseFloat(item.unitCost || 0).toFixed(2)} ea)
                  </Text>
                  {selectedItem?.id === item.id && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
            {selectedItem && (
              <View style={styles.section}>
                <Text style={styles.modalLabel}>Quantity</Text>
                <TextInput
                  style={styles.qtyInput}
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowApply(false); setSelectedItem(null); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveModalBtn, !selectedItem && { opacity: 0.5 }]}
                onPress={handleApply}
                disabled={!selectedItem}
              >
                <Text style={styles.saveModalText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  costBanner: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  costLabel: { fontSize: fonts.sizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  costValue: { fontSize: fonts.sizes.xxl, fontWeight: '700', color: '#fff' },
  list: { padding: spacing.md, paddingBottom: 100 },
  recordRow: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  recordLeft: { flex: 1 },
  recordName: { fontSize: fonts.sizes.md, fontWeight: '600', color: colors.text },
  recordMeta: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  recordRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  recordCost: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.success },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  applyBtn: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.sizes.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, paddingBottom: 36 },
  modalTitle: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: colors.background,
  },
  selectRowActive: { backgroundColor: '#FFF3DD' },
  selectText: { fontSize: fonts.sizes.md, color: colors.text },
  selectTextActive: { color: colors.primary, fontWeight: '600' },
  section: { marginBottom: spacing.md },
  modalLabel: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.textLight, marginBottom: 6 },
  qtyInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: 12, backgroundColor: colors.background },
  cancelText: { fontSize: fonts.sizes.md, color: colors.textLight, fontWeight: '600' },
  saveModalBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: 12, backgroundColor: colors.primary },
  saveModalText: { fontSize: fonts.sizes.md, color: '#fff', fontWeight: '700' },
});
