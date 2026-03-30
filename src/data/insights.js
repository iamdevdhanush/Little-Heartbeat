export const monthlyInsights = [
  {
    month: 1,
    insight: 'Your body is working hard creating new life. Rest is the most important thing right now. 💕',
    tip: 'Take folic acid daily — it helps your baby\'s brain develop properly.',
    exercise: 'Short 10-minute walks in fresh air are perfect for now.',
  },
  {
    month: 2,
    insight: 'Morning sickness is your body doing its job! Small, frequent meals help a lot. 🌸',
    tip: 'Ginger tea can naturally help with nausea. Try it warm, not hot.',
    exercise: 'Gentle yoga stretches for 15 minutes can ease discomfort.',
  },
  {
    month: 3,
    insight: 'The first trimester is almost done! Energy may start returning soon. 🌟',
    tip: 'This is a great time for your first detailed scan to check baby\'s growth.',
    exercise: 'Swimming or walking for 20-30 minutes is wonderful now.',
  },
  {
    month: 4,
    insight: 'You may feel your baby move for the first time! Those little flutters are precious. 🦋',
    tip: 'Start talking and playing music to your baby — they can hear you!',
    exercise: 'Prenatal yoga or gentle swimming 3-4 times a week is ideal.',
  },
  {
    month: 5,
    insight: 'Your baby can now recognize your voice. Sing and talk to them daily! 🎵',
    tip: 'Sleep on your left side to improve blood flow to your baby.',
    exercise: 'Daily walks of 30 minutes help maintain healthy weight and mood.',
  },
  {
    month: 6,
    insight: 'Baby is now very active! Strong kicks are a wonderful sign of health. 👶',
    tip: 'Count baby kicks daily — 10 movements in 2 hours is a healthy sign.',
    exercise: 'Keep walking and consider a prenatal pilates class.',
  },
  {
    month: 7,
    insight: 'You are in the third trimester! Your baby is gaining weight rapidly now. 🌈',
    tip: 'Start preparing your hospital bag and birth plan. You are almost there!',
    exercise: 'Gentle walking and pelvic floor exercises are key now.',
  },
  {
    month: 8,
    insight: 'Almost there, mama! Your body is preparing beautifully for birth. 💪',
    tip: 'Practice deep breathing — it will help during labor and keep you calm.',
    exercise: 'Short walks, gentle stretches, and lots of rest.',
  },
  {
    month: 9,
    insight: 'Your baby could arrive any day now! You have done an amazing job. 🌸✨',
    tip: 'Watch for signs of labor: regular contractions, water breaking, or lower back pain.',
    exercise: 'Light walking helps baby get into position. Trust your body.',
  },
];

export const getInsight = (month) => {
  const index = Math.max(0, Math.min(8, (month || 1) - 1));
  return monthlyInsights[index];
};

export const bodyChanges = [
  {
    symptom: 'Back Pain',
    title: 'Back Pain is Very Common',
    explanation: 'As your baby grows, your body shifts its center of gravity. This puts extra strain on your back. It is completely normal.',
    tips: [
      'Take rest and avoid standing for too long',
      'Use a pregnancy pillow when sleeping',
      'Gentle back stretches can help',
      'Warm (not hot) compress on the lower back',
    ],
    whenToWorry: 'See a doctor if the pain is severe or comes with fever.',
  },
  {
    symptom: 'Swelling',
    title: 'Mild Swelling is Normal',
    explanation: 'Mild swelling in feet and ankles is very common, especially after month 5. Your body holds extra fluid during pregnancy.',
    tips: [
      'Elevate your feet when sitting or lying down',
      'Avoid standing for long periods',
      'Drink plenty of water',
      'Avoid salty foods',
    ],
    whenToWorry: 'See a doctor immediately if swelling is sudden, severe, or affects your face and hands.',
  },
  {
    symptom: 'Nausea',
    title: 'Morning Sickness Explained',
    explanation: 'Nausea, especially in the first trimester, is caused by rising pregnancy hormones. It is a sign that your pregnancy is progressing normally.',
    tips: [
      'Eat small meals every 2-3 hours',
      'Ginger tea or ginger biscuits help',
      'Avoid strong smells',
      'Keep crackers by your bedside',
    ],
    whenToWorry: 'See a doctor if you cannot keep any food or water down.',
  },
  {
    symptom: 'Fatigue',
    title: 'Feeling Tired is Normal',
    explanation: 'Your body is doing incredible work! Growing a baby takes enormous energy. Fatigue is especially strong in the first and third trimesters.',
    tips: [
      'Sleep early and rest when you can',
      'Short naps of 20-30 minutes help',
      'Ask family for help with daily tasks',
      'Light exercise can actually boost energy',
    ],
    whenToWorry: 'See a doctor if fatigue is extreme or comes with dizziness.',
  },
  {
    symptom: 'Heartburn',
    title: 'Heartburn During Pregnancy',
    explanation: 'Pregnancy hormones relax the valve between your stomach and food pipe, causing a burning feeling. It is uncomfortable but not harmful.',
    tips: [
      'Eat smaller meals more often',
      'Avoid lying down right after eating',
      'Sleep with your head slightly elevated',
      'Avoid spicy, oily, or acidic foods',
    ],
    whenToWorry: 'See a doctor if heartburn is very severe or if you have difficulty swallowing.',
  },
];
