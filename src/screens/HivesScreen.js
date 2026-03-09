import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

export default function HivesScreen({ navigation }) {
  const { hives, deleteHive } = useApp();

  function confirmDelete(hive) {
    Alert.alert(
      'Delete Hive',
      `Are you sure you want to delete "${hive.name}"? All inspections and harvests for this hive will also be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHive(hive.id) },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {hives.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyText}>No hives yet. Add your first hive!</Text>
        </View>
      ) : (
        <FlatList
          data={hives}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('HiveDetail', { hiveId: item.id })}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.healthBadge, { backgroundColor: healthColor(item.health) }]}>
                  <Text style={styles.healthText}>{item.health || 'Unknown'}</Text>
                </View>
                <Text style={styles.hiveName}>{item.name}</Text>
                <Text style={styles.hiveDetails}>
                  {item.type || 'Langstroth'} · Est. {item.established || 'Unknown'}
                </Text>
                {item.location ? (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={colors.textLight} />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.cardRight}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditHive', { hiveId: item.id })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={20} color={colors.textLight} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ marginTop: spacing.md }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddHive')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function healthColor(health) {
  switch (health) {
    case 'Excellent': return colors.success;
    case 'Good': return '#8BC34A';
    case 'Fair': return colors.warning;
    case 'Poor': return colors.danger;
    default: return colors.border;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'center', paddingLeft: spacing.sm },
  healthBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 },
  healthText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  hiveName: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text },
  hiveDetails: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2 },
  locationText: { fontSize: fonts.sizes.sm, color: colors.textLight },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  emptyIcon: { fontSize: 64 },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight },
});
