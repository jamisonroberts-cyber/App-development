import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';
import { TASK_CATEGORIES, PRIORITY_COLORS } from '../utils/taskCategories';

const hs = {
  primary: '#4A7C3F',
  overdue: '#E53935',
  today: '#F57C00',
  upcoming: '#1976D2',
};

const STATUS_FILTERS = ['All', 'Active', 'Done'];

export default function TasksScreen({ navigation }) {
  const { tasks, toggleTask } = useApp();
  const [activeCategory, setActiveCategory] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = todayStart.toISOString().split('T')[0];
  const weekEnd = useMemo(() => {
    const d = new Date(todayStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [todayStart]);

  const stats = useMemo(() => {
    const pending = tasks.filter(t => !t.completed);
    return {
      overdue: pending.filter(t => t.dueDate && new Date(t.dueDate) < todayStart).length,
      todayCount: pending.filter(t => t.dueDate && t.dueDate.split('T')[0] === todayStr).length,
      upcoming: pending.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d >= todayStart && d <= weekEnd;
      }).length,
      total: pending.length,
    };
  }, [tasks, todayStart, todayStr, weekEnd]);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (activeCategory) list = list.filter(t => t.category === activeCategory);
    if (statusFilter === 'Active') list = list.filter(t => !t.completed);
    else if (statusFilter === 'Done') list = list.filter(t => t.completed);

    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const order = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) return order[a.priority] - order[b.priority];
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [tasks, activeCategory, statusFilter]);

  const catMap = useMemo(
    () => Object.fromEntries(TASK_CATEGORIES.map(c => [c.id, c])),
    [],
  );

  function getDueInfo(dueDate, completed) {
    if (!dueDate) return null;
    const dateStr = dueDate.split('T')[0];
    if (completed) return { label: formatDate(dueDate), color: colors.textLight };
    if (dateStr === todayStr) return { label: 'Today', color: hs.today };
    if (new Date(dueDate) < todayStart) return { label: formatDate(dueDate), color: hs.overdue };
    return { label: formatDate(dueDate), color: colors.textLight };
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderTask({ item: task }) {
    const cat = catMap[task.category] || catMap.general;
    const dueInfo = getDueInfo(task.dueDate, task.completed);

    return (
      <TouchableOpacity
        style={[styles.taskCard, task.completed && styles.taskCardDone]}
        onPress={() => navigation.navigate('AddTask', { task })}
        activeOpacity={0.75}
      >
        <TouchableOpacity
          style={[styles.checkbox, task.completed && { backgroundColor: cat.color, borderColor: cat.color }]}
          onPress={() => toggleTask(task.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {task.completed && <Ionicons name="checkmark" size={13} color="#fff" />}
        </TouchableOpacity>

        <View style={styles.taskBody}>
          <Text
            style={[styles.taskTitle, task.completed && styles.taskTitleDone]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <View style={[styles.catBadge, { backgroundColor: cat.color + '22' }]}>
              <Ionicons name={cat.icon} size={10} color={cat.color} />
              <Text style={[styles.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
            </View>
            {task.recurring !== 'none' && (
              <Ionicons name="repeat" size={12} color={colors.textLight} />
            )}
            {dueInfo && (
              <Text style={[styles.dueDateText, { color: dueInfo.color }]}>{dueInfo.label}</Text>
            )}
          </View>
        </View>

        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Overdue',   value: stats.overdue,    color: hs.overdue },
          { label: 'Today',     value: stats.todayCount, color: hs.today },
          { label: 'This Week', value: stats.upcoming,   color: hs.upcoming },
          { label: 'Pending',   value: stats.total,      color: hs.primary },
        ].map(s => (
          <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollInner}
      >
        <TouchableOpacity
          style={[styles.catChip, !activeCategory && styles.catChipActive]}
          onPress={() => setActiveCategory(null)}
        >
          <Text style={[styles.catChipText, !activeCategory && styles.catChipTextActive]}>All</Text>
        </TouchableOpacity>
        {TASK_CATEGORIES.map(cat => {
          const active = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, active && { backgroundColor: cat.color, borderColor: cat.color }]}
              onPress={() => setActiveCategory(active ? null : cat.id)}
            >
              <Ionicons name={cat.icon} size={12} color={active ? '#fff' : cat.color} style={{ marginRight: 3 }} />
              <Text style={[styles.catChipText, active && { color: '#fff' }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Status tabs */}
      <View style={styles.statusTabs}>
        {STATUS_FILTERS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.statusTab, statusFilter === s && styles.statusTabActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.statusTabText, statusFilter === s && styles.statusTabTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={72} color={colors.border} />
            <Text style={styles.emptyTitle}>No tasks here</Text>
            <Text style={styles.emptySub}>Tap + to add your first homestead task</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask', {})}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  statsRow: { flexDirection: 'row', padding: spacing.sm, gap: spacing.xs },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 8,
    padding: spacing.sm, alignItems: 'center', borderTopWidth: 3,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 9, color: colors.textLight, marginTop: 2, textAlign: 'center' },

  catScroll: { maxHeight: 46 },
  catScrollInner: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  catChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  catChipActive: { backgroundColor: hs.primary, borderColor: hs.primary },
  catChipText: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  catChipTextActive: { color: '#fff' },

  statusTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  statusTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  statusTabActive: { borderBottomWidth: 2, borderBottomColor: hs.primary },
  statusTabText: { fontSize: fonts.sizes.sm, color: colors.textLight },
  statusTabTextActive: { color: hs.primary, fontWeight: '700' },

  list: { padding: spacing.sm, paddingBottom: 90 },

  taskCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12,
    padding: spacing.sm, marginBottom: spacing.xs,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  taskCardDone: { opacity: 0.55 },
  checkbox: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: fonts.sizes.md, color: colors.text, fontWeight: '500' },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textLight },
  taskMeta: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 4, gap: 6,
  },
  catBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10, gap: 3,
  },
  catBadgeText: { fontSize: 10, fontWeight: '600' },
  dueDateText: { fontSize: 11 },
  priorityDot: { width: 9, height: 9, borderRadius: 5, marginLeft: spacing.xs },

  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: fonts.sizes.lg, color: colors.textLight, marginTop: spacing.md, fontWeight: '500' },
  emptySub: { fontSize: fonts.sizes.sm, color: colors.border, marginTop: spacing.xs },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: hs.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
