// Claude AI Integration for Voice Inspection Analysis
// Currently uses mock responses. Replace analyzeInspection with real API call when ready.

import { ANTHROPIC_API_KEY } from './config';

function mockAnalyzeInspection(transcript, previousInspection) {
  const lower = transcript.toLowerCase();

  const flags = [];
  let severity = 'low';

  // Disease indicators
  if (lower.includes('chalk') || lower.includes('chalkbrood')) {
    flags.push('Chalkbrood detected — monitor closely, improve ventilation');
    severity = 'medium';
  }
  if (lower.includes('foulbrood') || lower.includes('foul brood')) {
    flags.push('Foulbrood suspected — contact state apiarist immediately');
    severity = 'high';
  }
  if (lower.includes('mite') || lower.includes('varroa')) {
    const hasHigh = lower.includes('high') || lower.includes('lots') || lower.includes('many');
    if (hasHigh) {
      flags.push('Elevated mite levels mentioned — consider treatment threshold check');
      severity = severity === 'high' ? 'high' : 'medium';
    }
  }
  if (lower.includes('deformed') || lower.includes('dwv') || lower.includes('wing')) {
    flags.push('Deformed wing virus symptoms possible — check mite load');
    severity = severity === 'high' ? 'high' : 'medium';
  }
  if (lower.includes('nosema') || lower.includes('dysentery')) {
    flags.push('Possible nosema or dysentery — evaluate feeding and moisture');
    severity = severity === 'high' ? 'high' : 'medium';
  }

  // Brood issues
  if (lower.includes('spotty') || lower.includes('scattered') || lower.includes('patchy brood')) {
    flags.push('Irregular brood pattern noted — check for disease or poor queen performance');
    if (severity === 'low') severity = 'medium';
  }
  if (lower.includes('no brood') || lower.includes('no eggs')) {
    flags.push('No brood or eggs visible — verify queen status urgently');
    severity = severity === 'high' ? 'high' : 'medium';
  }
  if (lower.includes('supersedure') || lower.includes('queen cell') || lower.includes('swarm cell')) {
    flags.push('Queen cells present — assess for swarm preparation or supersedure');
    if (severity === 'low') severity = 'medium';
  }

  // Space issues
  if (lower.includes('crowded') || lower.includes('no space') || lower.includes('full')) {
    flags.push('Hive appears crowded — consider adding a super or box to prevent swarming');
    if (severity === 'low') severity = 'medium';
  }

  // Compare to previous inspection if available
  if (previousInspection) {
    const prevNotes = (previousInspection.notes || '').toLowerCase();
    if (previousInspection.varroa && lower.includes('varroa')) {
      flags.push(`Varroa mentioned again — last count was ${previousInspection.varroa} per 100 bees`);
    }
    if (previousInspection.brood === 'Solid' && (lower.includes('patchy') || lower.includes('spotty'))) {
      flags.push('Brood pattern has deteriorated since last inspection');
      if (severity === 'low') severity = 'medium';
    }
  }

  // Build summary
  const positives = [];
  if (lower.includes('strong') || lower.includes('booming') || lower.includes('thriving')) {
    positives.push('colony appears strong');
  }
  if (lower.includes('queen') && (lower.includes('saw') || lower.includes('spotted') || lower.includes('marked'))) {
    positives.push('queen confirmed present');
  }
  if (lower.includes('calm') || lower.includes('gentle')) {
    positives.push('good temperament');
  }
  if (lower.includes('full') && lower.includes('honey')) {
    positives.push('good honey stores');
  }

  const posStr = positives.length > 0 ? `Positives: ${positives.join(', ')}. ` : '';
  const flagStr = flags.length > 0
    ? `${flags.length} concern${flags.length > 1 ? 's' : ''} flagged for follow-up.`
    : 'No major concerns identified.';
  const prevStr = previousInspection
    ? ` Compared to inspection on ${new Date(previousInspection.date).toLocaleDateString()}.`
    : ' No prior inspection data available for comparison.';

  const summary = `${posStr}${flagStr}${prevStr}`;

  return { summary, flags, severity };
}

export async function analyzeInspection(transcript, previousInspection) {
  // Uncomment below and remove mock when you add your ANTHROPIC_API_KEY:
  //
  // if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'YOUR_ANTHROPIC_API_KEY_HERE') {
  //   const Anthropic = require('@anthropic-ai/sdk');
  //   const client = new Anthropic.default({ apiKey: ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true });
  //   const prevSummary = previousInspection
  //     ? `Previous inspection (${previousInspection.date}): Queen seen: ${previousInspection.queenSeen}, Brood: ${previousInspection.brood}, Varroa count: ${previousInspection.varroa}, Notes: ${previousInspection.notes}`
  //     : 'No previous inspection data.';
  //   const msg = await client.messages.create({
  //     model: 'claude-opus-4-6',
  //     max_tokens: 1024,
  //     messages: [{ role: 'user', content: `You are an expert beekeeper assistant. Analyze this hive inspection and flag concerns.\n\nTranscript: "${transcript}"\n${prevSummary}\n\nRespond with JSON only: {"summary":"...","flags":["..."],"severity":"low"|"medium"|"high"}` }],
  //   });
  //   return JSON.parse(msg.content[0].text);
  // }

  return mockAnalyzeInspection(transcript, previousInspection);
}
