function scoreMedicineName(name) {
  if (!name) return 0;
  if (name.length < 2) return 10;
  if (name.length < 4) return 40;

  const knownMedicines = new Set([
    'thyronorm', 'thyroxine', 'eltroxin', 'levothyroxine',
    'calcium', 'iron', 'ferrous', 'folic acid', 'folvite', 'ferup',
    'vitamin d', 'cholecalciferol', 'multivitamin',
    'aspirin', 'ecosprin', 'metformin', 'glyciphage',
    'insulin', 'progesterone', 'duphaston',
    'amoxicillin', 'azithromycin', 'doxycycline',
    'paracetamol', 'crocin', 'omeprazole', 'pantoprazole',
    'ondansetron', 'emtaset', 'prenatal',
  ]);

  if (knownMedicines.has(name.toLowerCase())) return 95;

  if (/^[A-Z][a-z]+$/.test(name)) return 60;
  if (/^[A-Z][a-z]+-[A-Z][a-z]+$/.test(name)) return 50;

  return 30;
}

function scoreDosage(dosage) {
  if (!dosage) return 0;
  if (/^\d+\.?\d*\s*(mg|mcg|g|ml|iu|unit|%|tablet|capsule)$/i.test(dosage.trim())) {
    return 90;
  }
  if (/\d+/.test(dosage)) return 50;
  return 20;
}

function scoreFrequency(frequency) {
  if (!frequency) return 0;

  const knownFrequencies = [
    'once daily', 'twice daily', 'three times daily', 'four times daily',
    'at bedtime', 'as needed', 'every 4 hours', 'every 6 hours',
    'every 8 hours', 'every 12 hours', 'once weekly', 'every other day',
  ];

  if (knownFrequencies.includes(frequency.toLowerCase())) return 95;
  if (/(?:times?\s*(?:a|per)\s*day|daily|hourly|weekly)/i.test(frequency)) return 70;
  return 30;
}

function scoreTiming(timing) {
  if (!timing) return 0;

  const knownTimings = [
    'before food', 'after food', 'with food', 'empty stomach',
    'in the morning', 'in the evening', 'at bedtime',
    'after breakfast', 'after lunch', 'after dinner',
    'before breakfast', 'before lunch', 'before dinner',
  ];

  if (knownTimings.includes(timing.toLowerCase())) return 90;
  if (/(?:food|meal|stomach|morning|evening|night|bedtime)/i.test(timing)) return 60;
  return 20;
}

function scoreDuration(duration) {
  if (!duration) return 0;
  if (/(\d+\s*(day|week|month|year)s?)/i.test(duration)) return 85;
  return 30;
}

function scoreInstructions(instructions) {
  if (!instructions) return 0;
  if (instructions.length > 10) return 70;
  if (instructions.length > 3) return 40;
  return 0;
}

function scoreOcrQuality(ocrConfidence) {
  if (typeof ocrConfidence !== 'number') return 50;
  if (ocrConfidence >= 95) return 100;
  if (ocrConfidence >= 85) return 80;
  if (ocrConfidence >= 70) return 60;
  if (ocrConfidence >= 50) return 40;
  return 20;
}

function scoreFieldCompleteness(medicine) {
  const fields = ['name', 'dosage', 'frequency', 'timing', 'duration', 'instructions'];
  const filled = fields.filter((f) => medicine[f] !== null && medicine[f] !== undefined && medicine[f] !== '');
  return Math.round((filled.length / fields.length) * 100);
}

export function scoreMedicine(medicine, ocrConfidence) {
  const nameScore = scoreMedicineName(medicine.name);
  const dosageScore = scoreDosage(medicine.dosage);
  const frequencyScore = scoreFrequency(medicine.frequency);
  const timingScore = scoreTiming(medicine.timing);
  const durationScore = scoreDuration(medicine.duration);
  const instructionsScore = scoreInstructions(medicine.instructions);
  const completenessScore = scoreFieldCompleteness(medicine);
  const ocrQualityScore = scoreOcrQuality(ocrConfidence);

  const weights = {
    name: 0.30,
    dosage: 0.20,
    frequency: 0.20,
    timing: 0.10,
    duration: 0.05,
    instructions: 0.05,
    completeness: 0.05,
    ocrQuality: 0.05,
  };

  const overall = Math.round(
    nameScore * weights.name +
    dosageScore * weights.dosage +
    frequencyScore * weights.frequency +
    timingScore * weights.timing +
    durationScore * weights.duration +
    instructionsScore * weights.instructions +
    completenessScore * weights.completeness +
    ocrQualityScore * weights.ocrQuality
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    breakdown: {
      name: nameScore,
      dosage: dosageScore,
      frequency: frequencyScore,
      timing: timingScore,
      duration: durationScore,
      instructions: instructionsScore,
      completeness: completenessScore,
      ocrQuality: ocrQualityScore,
    },
    verdict: overall >= 80 ? 'high' : overall >= 50 ? 'medium' : 'low',
  };
}

export function scoreOverallExtraction(medicines, ocrConfidence) {
  if (!medicines || medicines.length === 0) return { overall: 0, verdict: 'low' };

  const scores = medicines.map((m) => scoreMedicine(m, ocrConfidence));
  const avg = Math.round(scores.reduce((sum, s) => sum + s.overall, 0) / scores.length);
  return {
    overall: avg,
    verdict: avg >= 80 ? 'high' : avg >= 50 ? 'medium' : 'low',
    medicines: scores,
  };
}
