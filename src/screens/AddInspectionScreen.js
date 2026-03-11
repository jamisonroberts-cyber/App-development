import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from '../context/AppContext';
import { analyzeInspection } from '../utils/claudeApi';
import { colors, spacing, fonts } from '../utils/theme';

const TEMPERAMENTS = ['Calm', 'Mild', 'Defensive', 'Aggressive'];
const BROOD_PATTERNS = ['Solid', 'Patchy', 'Spotty', 'None'];

const SEVERITY_CONFIG = {
  low: { color: colors.success, bg: '#EBF5E1', icon: 'checkmark-circle-outline', label: 'Low Concern' },
  medium: { color: colors.warning, bg: '#FEF3E2', icon: 'alert-circle-outline', label: 'Moderate Concern' },
  high: { color: colors.danger, bg: '#FDECEA', icon: 'warning-outline', label: 'High Concern' },
};

export default function AddInspectionScreen({ navigation, route }) {
  const { addInspection, hives, getHiveInspections } = useApp();
  const hiveId = route.params?.hiveId;
  const hive = hives.find(h => h.id === hiveId);
  const previousInspection = getHiveInspections(hiveId)[0] || null;

  const [queenSeen, setQueenSeen] = useState(false);
  const [eggsPresent, setEggsPresent] = useState(false);
  const [swarmCells, setSwarmCells] = useState(false);
  const [frames, setFrames] = useState('');
  const [brood, setBrood] = useState('Solid');
  const [temperament, setTemperament] = useState('Calm');
  const [varroa, setVarroa] = useState('');
  const [notes, setNotes] = useState('');

  // Voice / AI state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingObj, setRecordingObj] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingObj) recordingObj.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone access is needed for voice inspections.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingObj(recording);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch (e) {
      Alert.alert('Recording Error', 'Could not start recording. Please try again.');
    }
  }

  async function stopRecording() {
    if (!recordingObj) return;
    clearInterval(timerRef.current);
    setIsRecording(false);
    try {
      await recordingObj.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (e) {}
    setRecordingObj(null);
    // Prompt user to type/review transcript
    if (!transcript) {
      setTranscript('Tap here to type or review your voice notes...');
    }
  }

  async function runAiAnalysis() {
    if (!transcript.trim() || transcript === 'Tap here to type or review your voice notes...') return;
    setAiLoading(true);
    try {
      const result = await analyzeInspection(transcript, previousInspection);
      setAiAnalysis(result);
    } catch (e) {
      Alert.alert('Analysis Error', 'Could not analyze inspection. Check your notes manually.');
    } finally {
      setAiLoading(false);
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function handleSave() {
    addInspection({
      hiveId, queenSeen, eggsPresent, swarmCells, frames, brood,
      temperament, varroa, notes,
      voiceTranscript: transcript || null,
      aiAnalysis: aiAnalysis?.summary || null,
      aiFlags: aiAnalysis?.flags || [],
    });
    navigation.goBack();
  }

  const severityCfg = aiAnalysis ? SEVERITY_CONFIG[aiAnalysis.severity] || SEVERITY_CONFIG.low : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {hive && <Text style={styles.hiveLabel}>Inspecting: {hive.name}</Text>}

      {/* Previous inspection comparison */}
      {previousInspection && (
        <View style={styles.prevCard}>
          <View style={styles.prevHeader}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} style={{ marginRight: 4 }} />
            <Text style={styles.prevTitle}>Previous Inspection — {new Date(previousInspection.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
          </View>
          <View style={styles.prevRow}>
            <Text style={styles.prevItem}>Brood: {previousInspection.brood || '?'}</Text>
            <Text style={styles.prevItem}>Varroa: {previousInspection.varroa || '?'}/100</Text>
            <Text style={styles.prevItem}>Frames: {previousInspection.frames || '?'}</Text>
          </View>
        </View>
      )}

      {/* Voice Inspection Section */}
      <View style={styles.voiceSection}>
        <Text style={styles.voiceSectionTitle}>Voice Inspection</Text>

        {/* Recording button */}
        <View style={styles.micRow}>
          <TouchableOpacity
            style={[styles.micBtn, isRecording && styles.micBtnRecording]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRecording ? 'stop-circle' : 'mic'}
              size={32}
              color={isRecording ? colors.danger : '#fff'}
            />
          </TouchableOpacity>
          <View style={styles.micInfo}>
            <Text style={styles.micLabel}>
              {isRecording ? 'Recording...' : transcript ? 'Recording complete' : 'Tap to record observations'}
            </Text>
            {isRecording ? (
              <Text style={styles.micTimer}>{formatTime(recordingSeconds)}</Text>
            ) : (
              <Text style={styles.micHint}>Or use iOS keyboard mic to dictate</Text>
            )}
          </View>
        </View>

        {/* Transcript field */}
        {(transcript || !isRecording) && (
          <TextInput
            style={styles.transcriptInput}
            value={transcript}
            onChangeText={setTranscript}
            placeholder="Speak or type your hive observations here..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        )}

        {/* AI Analysis button */}
        {transcript && transcript !== 'Tap here to type or review your voice notes...' && !aiAnalysis && (
          <TouchableOpacity
            style={styles.analyzeBtn}
            onPress={runAiAnalysis}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.analyzeBtnText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.analyzeBtnText}>Analyze with AI</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* AI Analysis result */}
        {aiAnalysis && severityCfg && (
          <View style={[styles.aiCard, { backgroundColor: severityCfg.bg, borderLeftColor: severityCfg.color }]}>
            <View style={styles.aiCardHeader}>
              <Ionicons name={severityCfg.icon} size={18} color={severityCfg.color} style={{ marginRight: 6 }} />
              <Text style={[styles.aiSeverity, { color: severityCfg.color }]}>{severityCfg.label}</Text>
              <Ionicons name="sparkles" size={14} color={severityCfg.color} style={{ marginLeft: 'auto' }} />
            </View>
            <Text style={styles.aiSummary}>{aiAnalysis.summary}</Text>
            {aiAnalysis.flags && aiAnalysis.flags.length > 0 && (
              <View style={styles.flagsList}>
                <Text style={styles.flagsHeader}>Flagged concerns:</Text>
                {aiAnalysis.flags.map((flag, i) => (
                  <Text key={i} style={styles.flagItem}>⚠ {flag}</Text>
                ))}
              </View>
            )}
            <TouchableOpacity onPress={() => setAiAnalysis(null)} style={styles.reDo}>
              <Text style={styles.reDoText}>Re-analyze</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Standard form fields */}
      <Field label="Queen Status">
        <SwitchRow label="Queen Seen" value={queenSeen} onChange={setQueenSeen} />
        <SwitchRow label="Eggs Present" value={eggsPresent} onChange={setEggsPresent} />
        <SwitchRow label="Swarm / Queen Cells" value={swarmCells} onChange={setSwarmCells} />
      </Field>

      <Field label="Number of Frames Covered">
        <TextInput style={styles.input} value={frames} onChangeText={setFrames} placeholder="e.g. 8" placeholderTextColor={colors.border} keyboardType="numeric" />
      </Field>

      <Field label="Brood Pattern">
        <View style={styles.chipRow}>
          {BROOD_PATTERNS.map(b => (
            <TouchableOpacity key={b} style={[styles.chip, brood === b && styles.chipSelected]} onPress={() => setBrood(b)}>
              <Text style={[styles.chipText, brood === b && styles.chipTextSelected]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Temperament">
        <View style={styles.chipRow}>
          {TEMPERAMENTS.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, temperament === t && styles.chipSelected]} onPress={() => setTemperament(t)}>
              <Text style={[styles.chipText, temperament === t && styles.chipTextSelected]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Varroa Mite Count (per 100 bees)">
        <TextInput style={styles.input} value={varroa} onChangeText={setVarroa} placeholder="e.g. 2" placeholderTextColor={colors.border} keyboardType="numeric" />
      </Field>

      <Field label="Notes">
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes} onChangeText={setNotes}
          placeholder="Observations, treatments, actions taken..."
          placeholderTextColor={colors.border}
          multiline numberOfLines={5} textAlignVertical="top"
        />
      </Field>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Inspection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function SwitchRow({ label, value, onChange }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} thumbColor="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  hiveLabel: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },

  prevCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  prevHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  prevTitle: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.textLight },
  prevRow: { flexDirection: 'row', gap: spacing.md },
  prevItem: { fontSize: fonts.sizes.sm, color: colors.text },

  voiceSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceSectionTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },

  micRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  micBtnRecording: {
    backgroundColor: '#FDECEA',
    shadowColor: colors.danger,
  },
  micInfo: { flex: 1 },
  micLabel: { fontSize: fonts.sizes.md, fontWeight: '600', color: colors.text },
  micTimer: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.danger, marginTop: 2 },
  micHint: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: 2 },

  transcriptInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 90,
    marginBottom: spacing.sm,
    textAlignVertical: 'top',
  },

  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  analyzeBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.sizes.md },

  aiCard: {
    borderRadius: 10,
    padding: spacing.md,
    borderLeftWidth: 4,
    marginBottom: spacing.xs,
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiSeverity: { fontSize: fonts.sizes.md, fontWeight: '700' },
  aiSummary: { fontSize: fonts.sizes.sm, color: colors.text, lineHeight: 19, marginBottom: spacing.sm },
  flagsList: { marginTop: 4 },
  flagsHeader: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text, marginBottom: 4 },
  flagItem: { fontSize: fonts.sizes.sm, color: colors.text, marginBottom: 3, lineHeight: 18 },
  reDo: { alignSelf: 'flex-end', marginTop: 4 },
  reDoText: { fontSize: fonts.sizes.sm, color: colors.textLight, textDecorationLine: 'underline' },

  field: { marginBottom: spacing.md },
  label: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.textLight, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md,
    fontSize: fonts.sizes.md, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  textArea: { height: 120 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, padding: spacing.md, borderRadius: 10,
    marginBottom: 4, borderWidth: 1, borderColor: colors.border,
  },
  switchLabel: { fontSize: fonts.sizes.md, color: colors.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { fontSize: fonts.sizes.sm, color: colors.textLight, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  saveButton: {
    backgroundColor: colors.primary, borderRadius: 14, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.md,
  },
  saveButtonText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700' },
});
