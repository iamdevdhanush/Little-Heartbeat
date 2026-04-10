import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const createMedicalPrompt = (userMessage, profile, analysisType = 'symptoms') => {
  const month = profile?.pregnancyMonth || 5;
  const name = profile?.name || 'Mama';
  const age = profile?.age || 'unknown';
  const region = profile?.region || 'General';

  return `
You are Little Heartbeat, a caring AI pregnancy assistant. A pregnant woman named ${name}, ${age} years old, in her ${month}th month of pregnancy from ${region} is asking for help.

IMPORTANT MEDICAL DISCLAIMER: You are NOT a doctor. Always recommend consulting healthcare professionals for medical advice.

User's message: "${userMessage}"

Respond in JSON format with these exact fields:
{
  "risk": "High" or "Medium" or "Low",
  "emoji": "🚨" for High, "⚠️" for Medium, "✅" for Low,
  "reason": "Brief explanation of why this risk level",
  "steps": ["Actionable step 1", "Action step 2", "Action step 3"],
  "isAnalysis": true or false,
  "requiresEmergency": true if risk is High, false otherwise,
  "confidence": "High" or "Medium" or "Low",
  "message": "Reassuring message for the mother"
}

Guidelines:
- If symptoms suggest: severe headache, blurred vision, chest pain, difficulty breathing, heavy bleeding, sudden swelling, no fetal movement, fainting → HIGH risk
- If symptoms are: mild nausea, fatigue, mild swelling, heartburn → LOW risk
- If symptoms are concerning but not severe → MEDIUM risk
- Always be gentle, supportive, and reassuring
- Use culturally appropriate advice for Indian context
- ${analysisType === 'symptoms' ? 'Analyze the symptoms described' : 'Provide general guidance'}
`;
};

const parseAIResponse = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    console.error('Error parsing AI response:', e);
    return null;
  }
};

const FALLBACK_RESPONSES = {
  High: {
    risk: 'High',
    emoji: '🚨',
    requiresEmergency: true,
    reasons: [
      'Some of your symptoms need immediate medical attention.',
      'Your symptoms could indicate a serious condition that needs urgent care.',
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
    requiresEmergency: false,
    reasons: [
      'Your symptoms need attention from your doctor soon.',
      'This is not an emergency, but you should not ignore it.',
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
    requiresEmergency: false,
    reasons: [
      'What you are experiencing sounds normal for pregnancy.',
      'These are common symptoms many mamas go through.',
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

const getFallbackResponse = (userMessage, profile) => {
  const lowerMsg = userMessage.toLowerCase();
  let maxRisk = 'Low';
  
  const highRiskKeywords = ['severe headache', 'blurred vision', 'chest pain', 'difficulty breathing', 'heavy bleeding', 'swelling', 'no movement', 'fainting', 'can\'t breathe'];
  const medRiskKeywords = ['headache', 'nausea', 'vomiting', 'cramping', 'spotting', 'dizzy', 'pain'];
  
  for (const keyword of highRiskKeywords) {
    if (lowerMsg.includes(keyword)) {
      maxRisk = 'High';
      break;
    }
  }
  
  if (maxRisk === 'Low') {
    for (const keyword of medRiskKeywords) {
      if (lowerMsg.includes(keyword)) {
        maxRisk = 'Medium';
        break;
      }
    }
  }
  
  const response = FALLBACK_RESPONSES[maxRisk];
  const reasonIndex = Math.floor(Math.random() * response.reasons.length);
  
  return {
    ...response,
    reason: response.reasons[reasonIndex],
    isAnalysis: true,
  };
};

export const generateChatResponse = async (userMessage, profile, language = 'en') => {
  const prompt = createMedicalPrompt(userMessage, profile, 'symptoms');
  
  if (!genAI) {
    console.log('No Gemini API key - using fallback response');
    return {
      text: formatFallbackToText(getFallbackResponse(userMessage, profile), profile),
      ...getFallbackResponse(userMessage, profile),
    };
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings: SAFETY_SETTINGS,
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const parsed = parseAIResponse(text);
    
    if (parsed) {
      return {
        text: formatToText(parsed, profile),
        ...parsed,
      };
    }
    
    return {
      text: formatFallbackToText(getFallbackResponse(userMessage, profile), profile),
      ...getFallbackResponse(userMessage, profile),
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    const fallback = getFallbackResponse(userMessage, profile);
    return {
      text: formatFallbackToText(fallback, profile),
      ...fallback,
    };
  }
};

const formatToText = (parsed, profile) => {
  const name = profile?.name || 'Mama';
  
  let text = `Thank you for telling me how you feel, ${name}. 💕\n\n`;
  text += `${parsed.emoji} **Risk Level: ${parsed.risk}**\n\n`;
  text += `**What this means:** ${parsed.reason}\n\n`;
  
  if (parsed.steps && parsed.steps.length > 0) {
    text += `**What you should do:**\n`;
    parsed.steps.forEach((step, i) => {
      text += `${i + 1}. ${step}\n`;
    });
  }
  
  text += `\n${parsed.message}`;
  
  return text;
};

const formatFallbackToText = (fallback, profile) => {
  const name = profile?.name || 'Mama';
  
  let text = `Thank you for telling me how you feel, ${name}. 💕\n\n`;
  text += `${fallback.emoji} **Risk Level: ${fallback.risk}**\n\n`;
  text += `**What this means:** ${fallback.reason}\n\n`;
  text += `**What you should do:**\n`;
  fallback.steps.forEach((step, i) => {
    text += `${i + 1}. ${step}\n`;
  });
  text += `\n${fallback.message}`;
  
  return text;
};

export const analyzeHealthForm = async (formData) => {
  const { systolic, diastolic, sugarFasting, symptoms = [] } = formData;
  
  const prompt = `
You are Little Heartbeat's health analysis AI. Analyze this pregnant woman's health data:

Health Data:
- Blood Pressure: ${systolic || 'Not provided'}/${diastolic || 'Not provided'} mmHg
- Fasting Blood Sugar: ${sugarFasting || 'Not provided'} mg/dL
- Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'None reported'}

Respond in JSON format:
{
  "risk": "High" or "Medium" or "Low",
  "emoji": "🚨" or "⚠️" or "✅",
  "reasons": ["Reason 1", "Reason 2"],
  "steps": ["Step 1", "Step 2", "Step 3"],
  "confidence": "High" or "Medium" or "Low",
  "overallMessage": "Reassuring message"
}
`;
  
  if (!genAI) {
    return analyzeFormFallback(formData);
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings: SAFETY_SETTINGS,
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const parsed = parseAIResponse(text);
    
    if (parsed) {
      return {
        risk: parsed.risk || 'Low',
        emoji: parsed.emoji || '✅',
        reasons: parsed.reasons || ['Everything looks normal'],
        steps: parsed.steps || ['Continue normal activities'],
        confidence: parsed.confidence || 'Medium',
        overallMessage: parsed.overallMessage || 'You are doing great!',
      };
    }
    
    return analyzeFormFallback(formData);
  } catch (error) {
    console.error('Gemini form analysis error:', error);
    return analyzeFormFallback(formData);
  }
};

const analyzeFormFallback = (formData) => {
  const { systolic, diastolic, sugarFasting, symptoms = [] } = formData;
  
  let score = 0;
  let reasons = [];
  let steps = [];
  
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
    } else if (sys >= 120) {
      score += 1;
      reasons.push('Your blood pressure is slightly elevated. Keep watching it.');
    } else {
      reasons.push('Your blood pressure looks normal. Well done!');
    }
  }
  
  if (sugarFasting) {
    const sugar = parseInt(sugarFasting);
    if (sugar >= 200) {
      score += 3;
      reasons.push('Your blood sugar is very high. This needs immediate attention.');
    } else if (sugar >= 126) {
      score += 2;
      reasons.push('Your fasting sugar is above normal. This may indicate gestational diabetes.');
      steps.push('Speak to your doctor about a glucose tolerance test.');
    } else if (sugar >= 95) {
      score += 1;
      reasons.push('Your blood sugar is slightly above normal. Worth monitoring.');
    } else {
      reasons.push('Your blood sugar level looks healthy!');
    }
  }
  
  const highRiskSymptoms = ['severe_headache', 'blurred_vision', 'chest_pain', 'no_movement', 'fainting', 'difficulty_breathing'];
  const medRiskSymptoms = ['mild_headache', 'vomiting', 'spotting', 'severe_cramps', 'fever'];
  
  const highCount = symptoms.filter(s => highRiskSymptoms.includes(s)).length;
  const medCount = symptoms.filter(s => medRiskSymptoms.includes(s)).length;
  
  if (highCount > 0) {
    score += 3;
    reasons.push('You have symptoms that need urgent attention today.');
    steps.push('Please go to the hospital immediately.');
  } else if (medCount > 1) {
    score += 2;
    reasons.push('You have some symptoms that your doctor should know about.');
    steps.push('Contact your doctor or midwife today.');
  } else if (symptoms.length > 0) {
    score += 1;
    reasons.push('Some mild symptoms noted. These are often normal in pregnancy.');
  }
  
  if (steps.length === 0) {
    steps = [
      'Continue your regular prenatal check-ups',
      'Stay hydrated and eat well',
      'Light exercise like walking is great',
      'Rest when your body asks for it',
    ];
  }
  
  const riskLevel = score >= 5 ? 'High' : score >= 2 ? 'Medium' : 'Low';
  const emojis = { High: '🚨', Medium: '⚠️', Low: '✅' };
  const messages = {
    High: 'Please do not wait. Your health and your baby\'s health are the top priority. Go to the hospital now. 🏥',
    Medium: 'Please take care of yourself and reach out to your doctor. I am here for you. 💕',
    Low: 'You are doing great! Keep following your doctor\'s advice and taking care of yourself. 🌸',
  };
  
  return {
    risk: riskLevel,
    emoji: emojis[riskLevel],
    reasons: reasons.filter(Boolean),
    steps: [...new Set(steps)],
    confidence: score >= 4 ? 'High' : score >= 2 ? 'Medium' : 'High',
    overallMessage: messages[riskLevel],
  };
};

export const generateDailyInsight = async (profile) => {
  const month = profile?.pregnancyMonth || 5;
  const name = profile?.name || 'Mama';
  
  const prompt = `
You are Little Heartbeat, a caring AI pregnancy assistant. Generate a personalized daily insight for ${name}, who is in her ${month}th month of pregnancy.

Respond in JSON format:
{
  "insight": "Today's health tip or encouragement",
  "tip": "One actionable advice for today",
  "emoji": "Relevant emoji",
  "category": "nutrition" or "exercise" or "emotional" or "medical"
}
`;
  
  if (!genAI) {
    return getDefaultInsight(month);
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings: SAFETY_SETTINGS,
    });
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseAIResponse(text);
    
    if (parsed) {
      return {
        insight: parsed.insight || 'Take care of yourself today!',
        tip: parsed.tip || 'Rest and stay hydrated.',
        emoji: parsed.emoji || '💕',
        category: parsed.category || 'general',
      };
    }
    
    return getDefaultInsight(month);
  } catch (error) {
    console.error('Gemini insight error:', error);
    return getDefaultInsight(month);
  }
};

const getDefaultInsight = (month) => {
  const insights = [
    { insight: 'Stay hydrated today! Aim for 8-10 glasses of water.', tip: 'Keep a water bottle nearby and sip throughout the day.', emoji: '💧', category: 'nutrition' },
    { insight: 'Light walking is great for you and baby!', tip: 'Try a 20-minute walk after meals.', emoji: '🚶‍♀️', category: 'exercise' },
    { insight: 'Remember to take your prenatal vitamins!', tip: 'Take them with food to avoid nausea.', emoji: '💊', category: 'medical' },
    { insight: 'Your baby can hear your voice now!', tip: 'Talk or sing to your baby - they love your voice.', emoji: '🎵', category: 'emotional' },
    { insight: 'Rest is important - listen to your body.', tip: 'Take short breaks throughout the day.', emoji: '😴', category: 'emotional' },
  ];
  
  return insights[month % insights.length];
};
