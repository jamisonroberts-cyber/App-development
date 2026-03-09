import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

export default function InspectionsScreen({ navigation }) {
  const { inspections, hives } = useApp();
  const sorted = [...inspections].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={styles.container}>
      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No inspections recorded yet.</Text>
          {hives.length > 0 && (
            <Text style={styles.emptyHint}>Go to a hive to log an inspection.</Text>
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
                <View style={styles.cardTop}>
                  <Text style={styles.hiveName}>{hive?.name || 'Unknown Hive'}</Text>
                  <Text style={styles.date}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                </View>
                <View style={styles.badges}>
                  <Badge
                    label={item.queenSeen ? 'Queen seen' : 'No queen'}
                    color={item.queenSeen ? colors.success : colors.warning}
                  />
                  <Badge label={item.temperament} color={temperamentColor(item.temperament)} />
                  {item.swarmCells && <Badge label="Swarm cells!" color={colors.danger} />}
                </View>
                <View style={styles.statsRow}>
                  {item.frames ? <StatChip icon="layers-outline" label={`${item.frames} frames`} /> : null}
                  {item.brood ? <StatChip icon="grid-outline" label={item.brood} /> : null}
                  {item.varroa ? <StatChip icon="bug-outline" label={`Varroa: ${item.varroa}`} /> : null}
                </View>
                {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
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

function Badge({ label, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function StatChip({ icon, label }) {
  return (
    <View style={styles.statChip}>
      <Ionicons name={icon} size={13} color={colors.textLight} />
      <Text style={styles.statChipText}>{label}</Text>
    </View>
  );
}

function temperamentColor(t) {
  switch (t) {
    case 'Calm': return colors.success;
    case 'Mild': return '#8BC34A';
    case 'Defensive': return colors.warning;
    case 'Aggressive': return colors.danger;
    default: return colors.textLight;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  hiveName: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  date: { fontSize: fonts.sizes.sm, color: colors.textLight },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: spacing.xs },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: spacing.xs },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  statChipText: { fontSize: 11, color: colors.textLight },
  notes: { fontSize: fonts.sizes.sm, color: colors.textLight, fontStyle: 'italic', marginTop: 2 },
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
