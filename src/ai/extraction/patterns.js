export const MEDICINE_PATTERNS = {
  dosage: [
    /\b(\d+\.?\d*\s*(mg|mcg|g|ml|iu|unit|tablet|capsule|cap|tab|syp|syrup|drop|drops|injection|inj|patch|cream|ointment))\b/gi,
    /\b(\d+\.?\d*\s*%)\b/g,
  ],

  frequency: [
    /(\d+)\s*times?\s*(a|per|daily|day)/gi,
    /(once|twice|thrice)\s*(a\s*day|daily|per\s*day)/gi,
    /(every|q)\s*(\d+)\s*(hour|hr|h)/gi,
    /(bid|tid|qid|od|hs|prn|stat|q[doh])\b/gi,
    /(morning|evening|night|bedtime|afternoon|noon|midnight)/gi,
    /(daily|alternate\s*day|weekly|monthly)/gi,
    /(sos|as\s*needed|when\s*required)/gi,
  ],

  timing: [
    /(before|after|with|empty\s*stomach)\s*(food|meal|breakfast|lunch|dinner|meals)/gi,
    /(before|after)\s*(eating|food|breakfast|lunch|dinner)/gi,
    /(on\s*empty\s*stomach|with\s*food|after\s*food)/gi,
    /(in\s*the\s*(morning|evening|afternoon|night))/gi,
    /(at\s*b(e)?d(time)?|bed\s*time)/gi,
    /(with\s*water|with\s*milk|with\s*juice)/gi,
  ],

  duration: [
    /for\s*(\d+)\s*(day|week|month|year|hour)/gi,
    /(\d+)\s*(day|week|month|year)\s*(course|coure|treatment)/gi,
    /until\s*(\w+\s*\w+)/gi,
  ],
};

export const DOCTOR_PATTERNS = {
  name: [
    /(?:Dr\.?|Doctor)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:MD|MBBS|MS|DM|DNB|BHMS|BAMS|BUMS)/g,
  ],

  clinic: [
    /(?:clinic|hospital|nursing\s*home|medical\s*centre|health\s*center)[:\s]*([A-Z][A-Za-z\s]+)/gi,
    /([A-Z][A-Za-z\s]+(?:clinic|hospital|nursing\s*home|medical\s*centre))/gi,
  ],

  license: [
    /(?:Regn?\.?\s*(?:No|Number)[:\s]*)([A-Z0-9\-]+)/gi,
    /(?:License|Lic|Lisc)[:\s]*(?:No|Number)?[:\s]*([A-Z0-9\-]+)/gi,
  ],
};

export const DATE_PATTERNS = {
  appointment: [
    /(?:next\s*appointment|follow\s*up|review)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/gi,
    /(?:next\s*appointment|follow\s*up|review)[:\s]*(\d{1,2}\s*[A-Z][a-z]+\s*\d{2,4})/gi,
    /(?:on|date)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/gi,
  ],

  prescriptionDate: [
    /(?:date|dt|dated)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/gi,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g,
    /(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{2,4})/gi,
  ],
};

export const SYMPTOM_PATTERNS = [
  /(?:complaints?|symptoms?|c\.o\.)[:\s]*([A-Za-z,\s\/]+)(?:\n|\.)/gi,
  /(?:pain|fever|cough|cold|headache|nausea|vomiting|dizziness|swelling|bleeding)/gi,
];

export const KNOWN_MEDICINES = new Set([
  'thyronorm', 'thyroxine', 'eltroxin', 'levothyroxine',
  'calcium', 'calcium carbonate', 'calcium citrate',
  'iron', 'ferrous sulfate', 'ferrous fumarate', 'ferup',
  'folic acid', 'folate', 'folvite',
  'vitamin d', 'cholecalciferol', 'd3',
  'multivitamin', 'prenatal vitamin',
  'omega-3', 'dha', 'fish oil',
  'aspirin', 'aspirin low dose', 'ecosprin',
  'metformin', 'glyciphage',
  'insulin', 'human insulin',
  'progesterone', 'duphaston', 'mifepristone',
  'antibiotic', 'amoxicillin', 'azithromycin', 'doxycycline',
  'paracetamol', 'acetaminophen', 'crocin',
  'omeprazole', 'pantoprazole', 'pantop',
  'ondansetron', 'emtaset', 'zofran',
  'prenatal',
]);
