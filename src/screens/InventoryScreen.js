import React from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

const CATEGORY_ICONS = {
  Equipment: 'construct-outline',
  'Medications/Treatments': 'medkit-outline',
  'Feeding Supplies': 'flask-outline',
  'Protective Gear': 'shield-checkmark-outline',
  'Extraction Equipment': 'water-outline',
  Packaging: 'archive-outline',
  Other: 'ellipsis-horizontal-circle-outline',
};

function ItemRow({ item, onEdit, onDelete }) {
  const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0);
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>Qty: {item.quantity || 0} × ${parseFloat(item.unitCost || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemTotal}>${total.toFixed(2)}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="pencil-outline" size={17} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={17} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function InventoryScreen({ navigation }) {
  const { inventoryItems, deleteInventoryItem } = useApp();

  const totalValue = inventoryItems.reduce((sum, item) =>
    sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0), 0);

  // Group by category
  const grouped = {};
  inventoryItems.forEach(item => {
    const cat = item.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const sections = Object.entries(grouped).map(([title, data]) => ({ title, data }));

  function handleDelete(item) {
    Alert.alert('Delete Item', `Remove "${item.name}" from inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteInventoryItem(item.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{inventoryItems.length}</Text>
          <Text style={styles.summaryLabel}>Items</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>${totalValue.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Value</Text>
        </View>
        <View style={styles.summaryDivider} />
        <TouchableOpacity style={styles.financialBtn} onPress={() => navigation.navigate('Financial')}>
          <Ionicons name="cash-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.financialBtnText}>Finances</Text>
        </TouchableOpacity>
      </View>

      {inventoryItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>No Inventory Yet</Text>
          <Text style={styles.emptyText}>Add equipment, medications, and supplies to track your investment.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Ionicons name={CATEGORY_ICONS[title] || 'cube-outline'} size={14} color={colors.textLight} style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ItemRow
              item={item}
              onEdit={() => navigation.navigate('EditInventoryItem', { itemId: item.id })}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddInventoryItem')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  summaryBar: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text },
  summaryLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: colors.border },
  financialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  financialBtnText: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: '700' },

  list: { padding: spacing.md, paddingBottom: 80 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: spacing.sm,
  },
  sectionHeaderText: {
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  itemRow: {
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
  itemLeft: { flex: 1 },
  itemName: { fontSize: fonts.sizes.md, fontWeight: '600', color: colors.text },
  itemMeta: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemTotal: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.success, marginBottom: 6 },
  itemActions: { flexDirection: 'row', gap: spacing.sm },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },

  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
