import { MEDICINE_PATTERNS, KNOWN_MEDICINES } from '../extraction/patterns.js';

const FREQUENCY_MAP = {
  'od': { value: 'once daily', numeric: 1, per: 'day' },
  'bid': { value: 'twice daily', numeric: 2, per: 'day' },
  'tid': { value: 'three times daily', numeric: 3, per: 'day' },
  'qid': { value: 'four times daily', numeric: 4, per: 'day' },
  'hs': { value: 'at bedtime', numeric: 1, per: 'day' },
  'prn': { value: 'as needed', numeric: null, per: null },
  'stat': { value: 'immediately', numeric: 1, per: null },
  'q4h': { value: 'every 4 hours', numeric: 6, per: 'day' },
  'q6h': { value: 'every 6 hours', numeric: 4, per: 'day' },
  'q8h': { value: 'every 8 hours', numeric: 3, per: 'day' },
  'q12h': { value: 'every 12 hours', numeric: 2, per: 'day' },
  'q24h': { value: 'once daily', numeric: 1, per: 'day' },
  'qd': { value: 'once daily', numeric: 1, per: 'day' },
  'qh': { value: 'every hour', numeric: 24, per: 'day' },
  'qod': { value: 'every other day', numeric: 0.5, per: 'day' },
  'sos': { value: 'as needed', numeric: null, per: null },
};

function extractMedicineNames(text) {
  const found = new Set();
  const lower = text.toLowerCase();

  for (const med of KNOWN_MEDICINES) {
    if (lower.includes(med)) {
      found.add(med);
    }
  }

  const unknownPatterns = [
    /([A-Z][a-z]+)\s*\(?(\d+\s*(?:mg|mcg|g|ml|iu))\)?/g,
    /(?:t\.a\.b\.|cap\.|syp\.|cream|ointment|inj\.?)\s*([A-Za-z]+)/gi,
    /([A-Z][a-z]+)\s*-\s*\d+/g,
  ];

  for (const pattern of unknownPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const name = match[1]?.toLowerCase().trim();
      if (name && name.length > 2 && name.length < 40) {
        found.add(name);
      }
    }
  }

  return Array.from(found);
}

function extractDosage(text, medicineName) {
  const results = [];

  const linePattern = new RegExp(
    `${medicineName}\\s*(?:\\d+\\.?\\d*\\s*)?\\(?\\s*(\\d+\\.?\\d*)\\s*(mg|mcg|g|ml|iu|unit|%)\\s*\\)?`,
    'gi'
  );
  let match;
  while ((match = linePattern.exec(text)) !== null) {
    results.push({ value: `${match[1]} ${match[2]}`, raw: match[0] });
  }

  if (results.length === 0) {
    for (const pattern of MEDICINE_PATTERNS.dosage) {
      const matches = text.matchAll(pattern);
      for (const m of matches) {
        results.push({ value: m[1].trim(), raw: m[0] });
      }
    }
  }

  return results.length > 0 ? results[0].value : null;
}

function extractFrequency(text) {
  const lower = text.toLowerCase();
  const results = [];

  for (const [abbr, map] of Object.entries(FREQUENCY_MAP)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    if (regex.test(text)) {
      results.push({ raw: abbr, value: map.value, numeric: map.numeric, per: map.per });
    }
  }

  for (const pattern of MEDICINE_PATTERNS.frequency) {
    const matches = lower.matchAll(pattern);
    for (const match of matches) {
      const raw = match[0].toLowerCase().trim();
      if (!results.some((r) => r.raw === raw)) {
        results.push({ raw, value: raw, numeric: null, per: null });
      }
    }
  }

  if (results.length === 0) {
    if (/\b(?:daily|every\s*day)\b/.test(lower)) {
      results.push({ raw: 'daily', value: 'once daily', numeric: 1, per: 'day' });
    }
  }

  return results.length > 0 ? results[0] : null;
}

function extractTiming(text) {
  const lower = text.toLowerCase();
  const results = [];

  for (const pattern of MEDICINE_PATTERNS.timing) {
    const matches = lower.matchAll(pattern);
    for (const match of matches) {
      results.push(match[0].toLowerCase().trim());
    }
  }

  if (results.length === 0) {
    if (/\b(?:morning|breakfast)\b/.test(lower)) {
      results.push('in the morning');
    } else if (/\b(?:night|bedtime|sleep)\b/.test(lower)) {
      results.push('at bedtime');
    } else if (/\b(?:evening|dinner|night)\b/.test(lower)) {
      results.push('in the evening');
    }
  }

  return results.length > 0 ? results[0] : null;
}

function extractDuration(text, medicineName) {
  const linePattern = new RegExp(
    `${medicineName}.*?(?:for|duration|course)\\s*(\\d+)\\s*(day|week|month)`,
    'gi'
  );
  let match = linePattern.exec(text);
  if (match) {
    return `${match[1]} ${match[2]}${match[1] > 1 ? 's' : ''}`;
  }

  for (const pattern of MEDICINE_PATTERNS.duration) {
    const matches = text.matchAll(pattern);
    for (const m of matches) {
      return m[0].toLowerCase().trim();
    }
  }

  return null;
}

function extractInstructions(text, medicineName) {
  const lower = text.toLowerCase();
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.toLowerCase().trim();
    if (trimmed.includes(medicineName.toLowerCase()) && trimmed.length > medicineName.length + 5) {
      const cleaned = trimmed.replace(medicineName.toLowerCase(), '').trim();
      if (cleaned.length > 5 && !cleaned.match(/^\d+/)) {
        return cleaned;
      }
    }
  }

  const commonInstr = [
    /(?:take|consume|apply|use)\s*(.*?)(?:\.|$)/gi,
    /(?:with|after|before)\s*(food|meal|water|milk|breakfast|lunch|dinner)/gi,
    /(?:empty\s*stomach|with\s*meals)/gi,
  ];

  for (const pattern of commonInstr) {
    const matches = lower.matchAll(pattern);
    for (const m of matches) {
      const instr = m[0].toLowerCase().trim();
      if (instr.length > 3) return instr;
    }
  }

  return null;
}

export function parseMedicines(text) {
  const medicines = [];
  const medicineNames = extractMedicineNames(text);

  if (medicineNames.length === 0) {
    const fallbackMatch = text.match(/([A-Za-z]+)\s*(?:\d+\s*(?:mg|mcg|g|ml))?/);
    if (fallbackMatch) {
      medicineNames.push(fallbackMatch[1].toLowerCase());
    }
  }

  for (const name of medicineNames) {
    const lineStart = text.toLowerCase().indexOf(name);
    const contextLine = lineStart >= 0
      ? text.substring(Math.max(0, lineStart - 20), Math.min(text.length, lineStart + 200))
      : text;

    const dosage = extractDosage(contextLine, name);
    const frequency = extractFrequency(contextLine);
    const timing = extractTiming(contextLine);
    const duration = extractDuration(contextLine, name);
    const instructions = extractInstructions(contextLine, name);

    medicines.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      dosage,
      frequency: frequency?.value || null,
      frequencyNumeric: frequency?.numeric || null,
      frequencyPer: frequency?.per || null,
      timing,
      duration,
      instructions,
      rawContext: contextLine.substring(0, 120),
    });
  }

  return medicines;
}
