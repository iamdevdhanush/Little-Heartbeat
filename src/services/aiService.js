// AI Service — Mock + API-ready architecture
// Replace the mock logic with real Anthropic/OpenAI API calls when ready

const SYMPTOM_RISK_MAP = {
  'severe headache': { risk: 'High', weight: 3 },
  'blurred vision': { risk: 'High', weight: 3 },
  'chest pain': { risk: 'High', weight: 3 },
  'sudden swelling': { risk: 'High', weight: 3 },
  'no fetal movement': { risk: 'High', weight: 3 },
  'heavy bleeding': { risk: 'High', weight: 3 },
  'high bp': { risk: 'High', weight: 3 },
  'severe abdominal pain': { risk: 'High', weight: 3 },
  'fainting': { risk: 'High', weight: 3 },
  'mild headache': { risk: 'Medium', weight: 2 },
  'nausea': { risk: 'Low', weight: 1 },
  'vomiting': { risk: 'Medium', weight: 2 },
  'backache': { risk: 'Low', weight: 1 },
  'fatigue': { risk: 'Low', weight: 1 },
  'swollen feet': { risk: 'Low', weight: 1 },
  'heartburn': { risk: 'Low', weight: 1 },
  'light spotting': { risk: 'Medium', weight: 2 },
  'cramps': { risk: 'Medium', weight: 2 },
  'difficulty breathing': { risk: 'High', weight: 3 },
  'fever': { risk: 'Medium', weight: 2 },
  'dizziness': { risk: 'Medium', weight: 2 },
};

const RESPONSES = {
  High: {
    risk: 'High',
    emoji: '🚨',
    reasons: [
      'Some of your symptoms need immediate medical attention.',
      'Your blood pressure reading is quite high, which needs urgent care.',
      'These symptoms together are a serious warning sign.',
    ],
    steps: [
      'Go to the nearest hospital right away',
      'Do not wait — this needs immediate attention',
      'Call someone to take you, do not go alone',
      'Take your pregnancy documents with you',
    ],
    confidence: 'High',
    message: 'Please do not wait. Your health and your baby\'s health are the top priority. Go to the hospital now. 🏥',
  },
  Medium: {
    risk: 'Medium',
    emoji: '⚠️',
    reasons: [
      'Your symptoms need attention from your doctor soon.',
      'This is not an emergency, but you should not ignore it.',
      'Your reading is slightly outside the normal range.',
    ],
    steps: [
      'Call your doctor today to share these symptoms',
      'Rest and monitor yourself closely',
      'Drink plenty of water',
      'If symptoms worsen, go to the hospital',
    ],
    confidence: 'Medium',
    message: 'Please take care of yourself and reach out to your doctor. I am here for you. 💕',
  },
  Low: {
    risk: 'Low',
    emoji: '✅',
    reasons: [
      'What you are experiencing sounds normal for pregnancy.',
      'These are common symptoms many mamas go through.',
      'Your readings look good!',
    ],
    steps: [
      'Rest and drink plenty of water',
      'Continue your regular prenatal check-ups',
      'Eat nutritious food',
      'Light walking is good for you',
    ],
    confidence: 'High',
    message: 'You are doing great! Keep following your doctor\'s advice and taking care of yourself. 🌸',
  },
};

// Analyze text symptoms from chat
export const analyzeSymptoms = (text, profile) => {
  const lowerText = text.toLowerCase();
  let maxWeight = 0;
  let detectedSymptoms = [];

  for (const [symptom, data] of Object.entries(SYMPTOM_RISK_MAP)) {
    if (lowerText.includes(symptom.split(' ')[0]) || lowerText.includes(symptom)) {
      detectedSymptoms.push(symptom);
      if (data.weight > maxWeight) {
        maxWeight = data.weight;
      }
    }
  }

  // Check for BP in text
  const bpMatch = lowerText.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (bpMatch) {
    const systolic = parseInt(bpMatch[1]);
    if (systolic >= 160) {
      maxWeight = 3;
      detectedSymptoms.push('high bp');
    } else if (systolic >= 140) {
      maxWeight = Math.max(maxWeight, 2);
    }
  }

  const riskLevel = maxWeight >= 3 ? 'High' : maxWeight >= 2 ? 'Medium' : 'Low';
  const responseTemplate = RESPONSES[riskLevel];
  const reasonIndex = Math.floor(Math.random() * responseTemplate.reasons.length);

  return {
    risk: riskLevel,
    emoji: responseTemplate.emoji,
    reason: responseTemplate.reasons[reasonIndex],
    steps: responseTemplate.steps,
    confidence: responseTemplate.confidence,
    message: responseTemplate.message,
    detectedSymptoms,
  };
};

// Full health form analysis
export const analyzeHealthForm = (formData) => {
  const { systolic, diastolic, sugarFasting, symptoms = [] } = formData;

  let score = 0;
  let reasons = [];
  let steps = [];

  // BP Analysis
  if (systolic && diastolic) {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    if (sys >= 160 || dia >= 110) {
      score += 3;
      reasons.push('Your blood pressure is very high and needs immediate care.');
      steps.push('Go to the hospital or call your doctor right away.');
    } else if (sys >= 140 || dia >= 90) {
      score += 2;
      reasons.push('Your blood pressure is a little high. This needs monitoring.');
      steps.push('Call your doctor today to discuss your blood pressure.');
      steps.push('Reduce salt in your food.');
      steps.push('Rest and avoid stress.');
    } else if (sys >= 120 && sys < 140) {
      score += 1;
      reasons.push('Your blood pressure is slightly elevated. Keep watching it.');
    } else {
      reasons.push('Your blood pressure looks normal. Well done!');
    }
  }

  // Sugar Analysis
  if (sugarFasting) {
    const sugar = parseInt(sugarFasting);
    if (sugar >= 200) {
      score += 3;
      reasons.push('Your blood sugar is very high. This needs immediate medical attention.');
      steps.push('See your doctor today about gestational diabetes management.');
    } else if (sugar >= 126) {
      score += 2;
      reasons.push('Your fasting sugar is above normal. This may indicate gestational diabetes.');
      steps.push('Speak to your doctor about a glucose tolerance test.');
      steps.push('Reduce sugar and refined carbohydrates in your diet.');
    } else if (sugar >= 95) {
      score += 1;
      reasons.push('Your blood sugar is slightly above normal. Worth monitoring.');
    } else {
      reasons.push('Your blood sugar level looks healthy!');
    }
  }

  // Symptoms
  const highRiskSymptoms = symptoms.filter(s =>
    ['severe_headache', 'blurred_vision', 'chest_pain', 'no_movement', 'heavy_bleeding', 'fainting'].includes(s)
  );
  const medRiskSymptoms = symptoms.filter(s =>
    ['mild_headache', 'vomiting', 'spotting', 'severe_cramps', 'difficulty_breathing', 'fever'].includes(s)
  );

  if (highRiskSymptoms.length > 0) {
    score += 3;
    reasons.push('You have symptoms that need urgent attention today.');
    steps.push('Please go to the hospital immediately.');
  } else if (medRiskSymptoms.length > 1) {
    score += 2;
    reasons.push('You have some symptoms that your doctor should know about.');
    steps.push('Contact your doctor or midwife today.');
  } else if (symptoms.length > 0) {
    score += 1;
    reasons.push('Some mild symptoms noted. These are often normal in pregnancy.');
  }

  // Add general steps if none added
  if (steps.length === 0) {
    steps = [
      'Continue your regular prenatal check-ups',
      'Stay hydrated and eat well',
      'Light exercise like walking is great',
      'Rest when your body asks for it',
    ];
  }

  const riskLevel = score >= 5 ? 'High' : score >= 2 ? 'Medium' : 'Low';

  return {
    risk: riskLevel,
    emoji: RESPONSES[riskLevel].emoji,
    reasons: reasons.filter(Boolean),
    steps: [...new Set(steps)],
    confidence: score >= 4 ? 'High' : score >= 2 ? 'Medium' : 'High',
    overallMessage: RESPONSES[riskLevel].message,
  };
};

// Generate conversational AI response
export const generateChatResponse = (userMessage, profile, language = 'en') => {
  const analysis = analyzeSymptoms(userMessage, profile);
  const lowerMsg = userMessage.toLowerCase();

  // Greeting responses
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return {
      text: `Hello ${profile?.name || 'dear'}! 💕 I am so happy you are here. How are you feeling today? You can tell me about any symptoms, worries, or just chat about your pregnancy journey.`,
      isAnalysis: false,
    };
  }

  // Diet questions
  if (lowerMsg.includes('eat') || lowerMsg.includes('food') || lowerMsg.includes('diet') || lowerMsg.includes('nutrition')) {
    return {
      text: `Great question about nutrition! 🥗\n\nDuring pregnancy, focus on:\n• Plenty of leafy greens for iron and folate\n• Lentils and beans for protein\n• Dairy for calcium\n• Fresh fruits for vitamins\n• Lots of water — 8 glasses a day!\n\nAvoid raw papaya, alcohol, and high-mercury fish. Check your Diet Guide in the Home screen for region-specific advice. 🌸`,
      isAnalysis: false,
    };
  }

  // Exercise questions
  if (lowerMsg.includes('exercise') || lowerMsg.includes('walk') || lowerMsg.includes('yoga') || lowerMsg.includes('workout')) {
    const month = profile?.pregnancyMonth || 5;
    const exerciseAdvice = month <= 3
      ? 'Short 10-15 minute walks are perfect. Avoid anything strenuous.'
      : month <= 6
      ? '30-minute daily walks and gentle prenatal yoga are wonderful!'
      : 'Light walking and pelvic floor exercises. Avoid lying on your back.';

    return {
      text: `Exercise during pregnancy is so beneficial! 🏃‍♀️\n\nFor month ${month}:\n${exerciseAdvice}\n\n✅ Safe: Walking, swimming, prenatal yoga\n❌ Avoid: Contact sports, heavy lifting, hot yoga\n\nAlways listen to your body. If you feel any discomfort, stop and rest.`,
      isAnalysis: false,
    };
  }

  // Sleep questions
  if (lowerMsg.includes('sleep') || lowerMsg.includes('rest') || lowerMsg.includes('tired') || lowerMsg.includes('fatigue')) {
    return {
      text: `Feeling tired is completely normal! Your body is doing incredible work. 😴\n\n💡 Tips for better sleep:\n• Sleep on your left side — it\'s best for baby\n• Use a pregnancy pillow between your knees\n• Keep the room cool and dark\n• Avoid screens 30 minutes before bed\n• Short naps of 20 minutes are helpful\n\nYou deserve all the rest, mama! 🌸`,
      isAnalysis: false,
    };
  }

  // Generic worry
  if (lowerMsg.includes('worried') || lowerMsg.includes('scared') || lowerMsg.includes('anxious') || lowerMsg.includes('afraid')) {
    return {
      text: `It is completely okay to feel worried during pregnancy. Your feelings are valid. 💕\n\nHere are some things that help:\n• Talk to your doctor about your concerns\n• Deep breathing for 5 minutes helps calm the mind\n• Connect with other pregnant mamas\n• Write down your worries to clear your mind\n\nYou are not alone. I am here whenever you need to talk. 🌸`,
      isAnalysis: false,
    };
  }

  // Symptom analysis for everything else
  const response = analysis;

  let text = '';
  if (response.detectedSymptoms.length === 0) {
    text = `Thank you for sharing that with me. 💕\n\nBased on what you told me, everything seems okay. But I always recommend talking to your doctor if something feels different or worrying.\n\nIs there anything specific you would like to know more about? I am here to help! 🌸`;
    return { text, isAnalysis: false };
  }

  text = `Thank you for telling me how you feel. Let me help you understand this better.\n\n`;
  text += `${response.emoji} **Risk Level: ${response.risk}**\n\n`;
  text += `**What this means:** ${response.reason}\n\n`;
  text += `**What you should do:**\n`;
  response.steps.forEach((step, i) => {
    text += `${i + 1}. ${step}\n`;
  });
  text += `\n${response.message}`;

  return {
    text,
    isAnalysis: true,
    analysisData: response,
  };
};
