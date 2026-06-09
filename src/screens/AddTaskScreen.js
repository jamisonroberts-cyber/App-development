import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, fonts } from '../utils/theme';
import { TASK_CATEGORIES, PRIORITY_COLORS, RECURRING_OPTIONS } from '../utils/taskCategories';

const hs = { primary: '#4A7C3F', primaryDark: '#2D5A27' };

export default function AddTaskScreen({ navigation, route }) {
  const { addTask, updateTask, deleteTask } = useApp();
  const editing = route.params?.task;

  const [title, setTitle]       = useState(editing?.title    || '');
  const [notes, setNotes]       = useState(editing?.notes    || '');
  const [category, setCategory] = useState(editing?.category || 'general');
  const [priority, setPriority] = useState(editing?.priority || 'medium');
  const [dueDate, setDueDate]   = useState(editing?.dueDate  ? editing.dueDate.split('T')[0] : '');
  const [recurring, setRecurring] = useState(editing?.recurring || 'none');

  function save() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }
    let parsedDue = null;
    if (dueDate.trim()) {
      const d = new Date(dueDate.trim());
      if (isNaN(d.getTime())) {
        Alert.alert('Invalid date', 'Please use YYYY-MM-DD format (e.g. 2025-06-15).');
        return;
      }
      parsedDue = d.toISOString();
    }

    const data = {
      title: title.trim(),
      notes: notes.trim(),
      category,
      priority,
      dueDate: parsedDue,
      recurring,
    };

    if (editing) {
      updateTask(editing.id, data);
    } else {
      addTask(data);
    }
    navigation.goBack();
  }

  function confirmDelete() {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteTask(editing.id); navigation.goBack(); },
      },
    ]);
  }

  function cycleRecurring() {
    const idx = RECURRING_OPTIONS.findIndex(r => r.id === recurring);
    setRecurring(RECURRING_OPTIONS[(idx + 1) % RECURRING_OPTIONS.length].id);
  }

  function setToday() {
    setDueDate(new Date().toISOString().split('T')[0]);
  }

  function setTomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDueDate(d.toISOString().split('T')[0]);
  }

  const recurringLabel = RECURRING_OPTIONS.find(r => r.id === recurring)?.label || 'No Repeat';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <Text style={styles.label}>Task Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="What needs to be done?"
        placeholderTextColor={colors.textLight}
        value={title}
        onChangeText={setTitle}
        returnKeyType="done"
      />

      {/* Category */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.catGrid}>
        {TASK_CATEGORIES.map(cat => {
          const active = category === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catItem,
                active && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Ionicons name={cat.icon} size={22} color={active ? '#fff' : cat.color} />
              <Text style={[styles.catItemLabel, active && { color: '#fff' }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Priority */}
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {[
          { id: 'high', label: 'High' },
          { id: 'medium', label: 'Medium' },
          { id: 'low', label: 'Low' },
        ].map(p => {
          const active = priority === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.priorityBtn,
                active && { backgroundColor: PRIORITY_COLORS[p.id], borderColor: PRIORITY_COLORS[p.id] },
              ]}
              onPress={() => setPriority(p.id)}
            >
              <View style={[styles.priorityDot, { backgroundColor: active ? '#fff' : PRIORITY_COLORS[p.id] }]} />
              <Text style={[styles.priorityBtnText, active && { color: '#fff' }]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Due Date */}
      <Text style={styles.label}>Due Date</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textLight}
          value={dueDate}
          onChangeText={setDueDate}
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
        />
        {dueDate ? (
          <TouchableOpacity style={styles.dateClear} onPress={() => setDueDate('')}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.dateQuickRow}>
        <TouchableOpacity style={styles.dateQuickBtn} onPress={setToday}>
          <Text style={styles.dateQuickText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateQuickBtn} onPress={setTomorrow}>
          <Text style={styles.dateQuickText}>Tomorrow</Text>
        </TouchableOpacity>
        {[7, 14, 30].map(days => (
          <TouchableOpacity
            key={days}
            style={styles.dateQuickBtn}
            onPress={() => {
              const d = new Date();
              d.setDate(d.getDate() + days);
              setDueDate(d.toISOString().split('T')[0]);
            }}
          >
            <Text style={styles.dateQuickText}>+{days}d</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recurring */}
      <Text style={styles.label}>Repeat</Text>
      <TouchableOpacity style={styles.recurringBtn} onPress={cycleRecurring}>
        <Ionicons name="repeat" size={18} color={recurring !== 'none' ? hs.primary : colors.textLight} />
        <Text style={[styles.recurringText, recurring !== 'none' && { color: hs.primary, fontWeight: '600' }]}>
          {recurringLabel}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
      </TouchableOpacity>
      <Text style={styles.hint}>Tap to cycle through repeat options</Text>

      {/* Notes */}
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Any additional details..."
        placeholderTextColor={colors.textLight}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Actions */}
      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Ionicons name={editing ? 'save-outline' : 'add-circle-outline'} size={20} color="#fff" />
        <Text style={styles.saveBtnText}>{editing ? 'Save Changes' : 'Add Task'}</Text>
      </TouchableOpacity>

      {editing && (
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={styles.deleteBtnText}>Delete Task</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 48 },

  label: {
    fontSize: 11, color: colors.textLight, fontWeight: '700',
    marginBottom: spacing.xs, marginTop: spacing.md,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, fontSize: fonts.sizes.md, color: colors.text,
    marginBottom: 2,
  },
  notesInput: { minHeight: 90 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  catItem: {
    width: '30.5%', paddingVertical: 12,
    borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, gap: 4,
  },
  catItemLabel: { fontSize: 10, color: colors.textLight, fontWeight: '600', textAlign: 'center' },

  priorityRow: { flexDirection: 'row', gap: spacing.xs },
  priorityBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, flexDirection: 'row', gap: 5,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityBtnText: { fontSize: fonts.sizes.sm, color: colors.textLight, fontWeight: '600' },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dateClear: { padding: 4 },
  dateQuickRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  dateQuickBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  dateQuickText: { fontSize: 12, color: hs.primary, fontWeight: '600' },

  recurringBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, gap: spacing.xs,
  },
  recurringText: { flex: 1, fontSize: fonts.sizes.md, color: colors.text },

  hint: { fontSize: 11, color: colors.textLight, marginTop: 4, marginLeft: 2 },

  saveBtn: {
    backgroundColor: hs.primary, borderRadius: 12,
    padding: spacing.md, alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.lg, flexDirection: 'row', gap: spacing.xs,
  },
  saveBtnText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.md, gap: spacing.xs, padding: spacing.sm,
  },
  deleteBtnText: { color: colors.danger, fontSize: fonts.sizes.sm, fontWeight: '500' },
});
