import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

export default function HarvestsScreen({ navigation }) {
  const { harvests, hives } = useApp();
  const sorted = [...harvests].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalKg = harvests.reduce((sum, h) => sum + (parseFloat(h.amountKg) || 0), 0);

  return (
    <View style={styles.container}>
      {harvests.length > 0 && (
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>Total Honey Harvested</Text>
          <Text style={styles.totalValue}>{totalKg.toFixed(2)} kg</Text>
        </View>
      )}

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🍯</Text>
          <Text style={styles.emptyText}>No harvests recorded yet.</Text>
          {hives.length > 0 && (
            <Text style={styles.emptyHint}>Go to a hive to record a harvest.</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const hive = hives.find(h => h.id === item.hiveId);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Hives', { screen: 'HiveDetail', params: { hiveId: item.hiveId } })}
              >
                <View style={styles.cardMain}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.hiveName}>{hive?.name || 'Unknown Hive'}</Text>
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                    {item.honeyType ? <Text style={styles.honeyType}>{item.honeyType}</Text> : null}
                    {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.amount}>{item.amountKg}</Text>
                    <Text style={styles.amountUnit}>kg</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {hives.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Hives')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  totalBanner: {
    backgroundColor: colors.primary, padding: spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: fonts.sizes.md, fontWeight: '700', color: '#fff' },
  totalValue: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: '#fff' },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  cardLeft: { flex: 1 },
  hiveName: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  date: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  honeyType: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: '600', marginTop: 4 },
  notes: { fontSize: fonts.sizes.sm, color: colors.textLight, fontStyle: 'italic', marginTop: 4 },
  amountBox: { alignItems: 'center', backgroundColor: colors.success + '20', borderRadius: 10, padding: spacing.sm, minWidth: 64 },
  amount: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.success },
  amountUnit: { fontSize: fonts.sizes.sm, color: colors.success, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  emptyIcon: { fontSize: 64 },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight },
  emptyHint: { fontSize: fonts.sizes.sm, color: colors.border },
});
