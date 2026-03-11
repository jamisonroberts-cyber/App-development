import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';

function ApiaryCard({ apiary, hiveCount, onPress, onEdit, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name="home" size={22} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{apiary.name}</Text>
          {apiary.location ? (
            <Text style={styles.cardLocation}>
              <Ionicons name="location-outline" size={12} color={colors.textLight} /> {apiary.location}
            </Text>
          ) : null}
          <Text style={styles.cardHiveCount}>
            {hiveCount} {hiveCount === 1 ? 'hive' : 'hives'}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="pencil-outline" size={18} color={colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

export default function ApiaryListScreen({ navigation }) {
  const { apiaries, deleteApiary, getApiaryHives } = useApp();

  function handleDelete(apiary) {
    Alert.alert(
      'Delete Apiary',
      `Delete "${apiary.name}"? Hives will be unassigned but not deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteApiary(apiary.id),
        },
      ]
    );
  }

  if (apiaries.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Ionicons name="home-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>No Apiaries Yet</Text>
          <Text style={styles.emptyText}>Add your first apiary to start managing your hives by location.</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('AddApiary')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyBtnText}>Add First Apiary</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={apiaries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ApiaryCard
            apiary={item}
            hiveCount={getApiaryHives(item.id).length}
            onPress={() => navigation.navigate('ApiaryDetail', { apiaryId: item.id, apiaryName: item.name })}
            onEdit={() => navigation.navigate('EditApiary', { apiaryId: item.id })}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddApiary')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: 80 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text },
  cardLocation: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  cardHiveCount: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { padding: 6 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    marginTop: spacing.lg,
    gap: 6,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.sizes.md },

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
