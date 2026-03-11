import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, Alert, SafeAreaView, TextInput, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';
import { getTasksForMonth, PRIORITY_COLORS } from '../utils/seasonalTasks';
import { MONTHLY_NOTES } from '../utils/monthlyNotes';

const TABS = ['Hives', 'Checklist', 'Info'];

function HiveCard({ hive, onPress, onDelete }) {
  const healthColors = {
    Excellent: colors.success,
    Good: '#7BC67E',
    Fair: colors.warning,
    Poor: colors.danger,
  };
  return (
    <TouchableOpacity style={styles.hiveCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.hiveCardLeft}>
        <View style={[styles.healthDot, { backgroundColor: healthColors[hive.health] || colors.textLight }]} />
        <View>
          <Text style={styles.hiveName}>{hive.name}</Text>
          <Text style={styles.hiveType}>{hive.type}</Text>
        </View>
      </View>
      <View style={styles.hiveCardRight}>
        <View style={[styles.healthBadge, { backgroundColor: healthColors[hive.health] + '22' || '#eee' }]}>
          <Text style={[styles.healthBadgeText, { color: healthColors[hive.health] || colors.textLight }]}>
            {hive.health || 'Unknown'}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

function TaskRow({ task, checked, onToggle }) {
  return (
    <TouchableOpacity style={styles.taskRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
      <View style={styles.taskTextCol}>
        <Text style={[styles.taskTitle, checked && styles.taskTitleDone]}>{task.title}</Text>
        <Text style={[styles.priorityLabel, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority}</Text>
      </View>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={24}
        color={checked ? colors.success : colors.textLight}
      />
    </TouchableOpacity>
  );
}

export default function ApiaryDetailScreen({ navigation, route }) {
  const { apiaryId, apiaryName } = route.params;
  const { apiaries, hives, deleteHive, getApiaryHives, harvests } = useApp();

  const apiary = apiaries.find(a => a.id === apiaryId);
  const apiaryHives = getApiaryHives(apiaryId);

  const [activeTab, setActiveTab] = useState('Hives');

  // Checklist state
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const checklistKey = `checklist_${currentYear}_${currentMonth}`;
  const customKey = `customTasks_${apiaryId}`;

  const [checkedIds, setCheckedIds] = useState({});
  const [customTasks, setCustomTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const seasonalTasks = getTasksForMonth(currentMonth);

  useEffect(() => {
    navigation.setOptions({ title: apiaryName || 'Apiary' });
    loadChecklist();
  }, [apiaryId]);

  async function loadChecklist() {
    try {
      const [checked, custom] = await Promise.all([
        AsyncStorage.getItem(checklistKey),
        AsyncStorage.getItem(customKey),
      ]);
      if (checked) setCheckedIds(JSON.parse(checked));
      if (custom) setCustomTasks(JSON.parse(custom));
    } catch (_) {}
  }

  async function toggleTask(id) {
    const updated = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(updated);
    await AsyncStorage.setItem(checklistKey, JSON.stringify(updated));
  }

  async function addCustomTask() {
    if (!newTaskText.trim()) return;
    const task = {
      id: `custom_${Date.now()}`,
      title: newTaskText.trim(),
      priority: newTaskPriority,
    };
    const updated = [...customTasks, task];
    setCustomTasks(updated);
    await AsyncStorage.setItem(customKey, JSON.stringify(updated));
    setNewTaskText('');
    setShowAddTask(false);
  }

  async function deleteCustomTask(id) {
    const updated = customTasks.filter(t => t.id !== id);
    setCustomTasks(updated);
    await AsyncStorage.setItem(customKey, JSON.stringify(updated));
  }

  function handleDeleteHive(hive) {
    Alert.alert('Remove Hive', `Remove "${hive.name}" from this apiary?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHive(hive.id) },
    ]);
  }

  const totalHoney = apiaryHives.reduce((sum, hive) => {
    const hiveHarvests = harvests.filter(h => h.hiveId === hive.id);
    return sum + hiveHarvests.reduce((s, h) => s + (parseFloat(h.amountKg) || 0), 0);
  }, 0);

  const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Hives Tab */}
      {activeTab === 'Hives' && (
        <View style={{ flex: 1 }}>
          {apiaryHives.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="layers-outline" size={56} color={colors.border} />
              <Text style={styles.emptyTitle}>No Hives Yet</Text>
              <Text style={styles.emptyText}>Add your first hive to this apiary.</Text>
            </View>
          ) : (
            <FlatList
              data={apiaryHives}
              keyExtractor={h => h.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <HiveCard
                  hive={item}
                  onPress={() => navigation.navigate('HiveDetail', { hiveId: item.id })}
                  onDelete={() => handleDeleteHive(item)}
                />
              )}
            />
          )}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddHive', { apiaryId })}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Checklist Tab */}
      {activeTab === 'Checklist' && (
        <ScrollView contentContainerStyle={styles.list}>
          {/* Monthly note */}
          <View style={styles.monthlyNoteCard}>
            <View style={styles.monthlyNoteHeader}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.monthlyNoteTitle}>{MONTH_NAMES[currentMonth]} Guidance</Text>
            </View>
            <Text style={styles.monthlyNoteText}>{MONTHLY_NOTES[currentMonth]}</Text>
          </View>

          {/* Seasonal tasks */}
          <Text style={styles.checklistSection}>Seasonal Tasks — {MONTH_NAMES[currentMonth]}</Text>
          {seasonalTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              checked={!!checkedIds[task.id]}
              onToggle={() => toggleTask(task.id)}
            />
          ))}

          {/* Custom tasks */}
          {customTasks.length > 0 && (
            <>
              <Text style={styles.checklistSection}>Custom Tasks</Text>
              {customTasks.map(task => (
                <View key={task.id} style={styles.customTaskRow}>
                  <TaskRow
                    task={task}
                    checked={!!checkedIds[task.id]}
                    onToggle={() => toggleTask(task.id)}
                  />
                  <TouchableOpacity onPress={() => deleteCustomTask(task.id)} style={styles.deleteCustom}>
                    <Ionicons name="close-circle" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Add custom task */}
          <TouchableOpacity style={styles.addTaskBtn} onPress={() => setShowAddTask(true)}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.addTaskBtnText}>Add Custom Task</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Info Tab */}
      {activeTab === 'Info' && (
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{apiary?.name}</Text>
            {apiary?.location ? (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={colors.textLight} />
                <Text style={styles.infoValue}>{apiary.location}</Text>
              </View>
            ) : null}
            <View style={styles.infoRow}>
              <Ionicons name="layers-outline" size={16} color={colors.textLight} />
              <Text style={styles.infoValue}>{apiaryHives.length} hives</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="water-outline" size={16} color={colors.textLight} />
              <Text style={styles.infoValue}>{totalHoney.toFixed(1)} kg total honey</Text>
            </View>
            {apiary?.notes ? (
              <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                <Ionicons name="document-text-outline" size={16} color={colors.textLight} style={{ marginTop: 2 }} />
                <Text style={[styles.infoValue, { flex: 1 }]}>{apiary.notes}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditApiary', { apiaryId })}
          >
            <Ionicons name="pencil-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.editBtnText}>Edit Apiary</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Add Custom Task Modal */}
      <Modal visible={showAddTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Custom Task</Text>
            <TextInput
              style={styles.modalInput}
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="Task description..."
              placeholderTextColor={colors.textLight}
              autoFocus
            />
            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.priorityChips}>
              {['High', 'Medium', 'Low'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityChip,
                    { borderColor: PRIORITY_COLORS[p] },
                    newTaskPriority === p && { backgroundColor: PRIORITY_COLORS[p] },
                  ]}
                  onPress={() => setNewTaskPriority(p)}
                >
                  <Text style={[styles.priorityChipText, { color: newTaskPriority === p ? '#fff' : PRIORITY_COLORS[p] }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAddTask(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={addCustomTask}>
                <Text style={styles.modalSaveText}>Add Task</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabLabel: { fontSize: fonts.sizes.md, fontWeight: '500', color: colors.textLight },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
  list: { padding: spacing.md, paddingBottom: 80 },

  hiveCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  hiveCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  healthDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  hiveName: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  hiveType: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },
  hiveCardRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  healthBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  healthBadgeText: { fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 4 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm },

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

  monthlyNoteCard: {
    backgroundColor: '#FFF8E6',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  monthlyNoteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  monthlyNoteTitle: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
  monthlyNoteText: { fontSize: fonts.sizes.sm, color: colors.text, lineHeight: 20 },

  checklistSection: {
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: spacing.sm,
  },

  taskRow: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm, flexShrink: 0 },
  taskTextCol: { flex: 1, marginRight: spacing.sm },
  taskTitle: { fontSize: fonts.sizes.md, color: colors.text, lineHeight: 20 },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textLight },
  priorityLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  customTaskRow: { position: 'relative' },
  deleteCustom: { position: 'absolute', top: 6, right: 40 },

  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  addTaskBtnText: { fontSize: fonts.sizes.md, color: colors.primary, fontWeight: '600' },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  infoTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: 8 },
  infoValue: { fontSize: fonts.sizes.md, color: colors.text },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.sizes.md },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  modalLabel: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.textLight, marginBottom: 8 },
  priorityChips: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  priorityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  priorityChipText: { fontWeight: '600', fontSize: fonts.sizes.sm },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalCancel: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: 12, backgroundColor: colors.background },
  modalCancelText: { fontSize: fonts.sizes.md, color: colors.textLight, fontWeight: '600' },
  modalSave: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: 12, backgroundColor: colors.primary },
  modalSaveText: { fontSize: fonts.sizes.md, color: '#fff', fontWeight: '700' },
});
