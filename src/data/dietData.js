export const dietData = {
  north_india: {
    label: 'North India',
    toEat: [
      { name: 'Dal & Rice', reason: 'Rich in protein and energy', emoji: '🍚' },
      { name: 'Palak Paneer', reason: 'Iron and calcium for baby', emoji: '🥬' },
      { name: 'Roti with Ghee', reason: 'Good fats and energy', emoji: '🫓' },
      { name: 'Dahi (Yogurt)', reason: 'Probiotics and calcium', emoji: '🥛' },
      { name: 'Soaked Almonds', reason: 'Brain health for baby', emoji: '🌰' },
      { name: 'Amla (Gooseberry)', reason: 'Vitamin C and immunity', emoji: '🫐' },
    ],
    toAvoid: [
      { name: 'Raw Papaya', reason: 'Can cause early contractions', emoji: '🚫' },
      { name: 'Excess Spicy Food', reason: 'Can cause heartburn', emoji: '🌶️' },
      { name: 'Unpasteurized Milk', reason: 'Risk of bacteria', emoji: '🥛' },
      { name: 'Raw Sprouts', reason: 'Risk of food poisoning', emoji: '🌱' },
    ],
  },
  south_india: {
    label: 'South India',
    toEat: [
      { name: 'Idli & Sambar', reason: 'Easy to digest, full of nutrients', emoji: '🫓' },
      { name: 'Kootu (Lentils + Veggies)', reason: 'Protein and fiber', emoji: '🍲' },
      { name: 'Coconut Water', reason: 'Hydration and electrolytes', emoji: '🥥' },
      { name: 'Ragi (Finger Millet)', reason: 'Calcium and iron', emoji: '🌾' },
      { name: 'Drumstick Leaves', reason: 'Iron, calcium, vitamins', emoji: '🌿' },
      { name: 'Banana', reason: 'Potassium and energy', emoji: '🍌' },
    ],
    toAvoid: [
      { name: 'Raw Papaya', reason: 'Can cause early contractions', emoji: '🚫' },
      { name: 'Excess Tamarind', reason: 'High acidity', emoji: '😬' },
      { name: 'Street Food', reason: 'Risk of infection', emoji: '🍢' },
      { name: 'Pineapple', reason: 'May cause uterine contractions', emoji: '🍍' },
    ],
  },
  west_india: {
    label: 'West India',
    toEat: [
      { name: 'Khichdi', reason: 'Gentle on stomach, nutritious', emoji: '🍲' },
      { name: 'Bajra Roti', reason: 'Iron and fiber', emoji: '🫓' },
      { name: 'Groundnut Chutney', reason: 'Protein and healthy fats', emoji: '🥜' },
      { name: 'Tulsi Tea (mild)', reason: 'Immunity booster', emoji: '🍃' },
      { name: 'Sesame Seeds', reason: 'Calcium and iron', emoji: '⚪' },
      { name: 'Fresh Fruit Juice', reason: 'Vitamins and hydration', emoji: '🍊' },
    ],
    toAvoid: [
      { name: 'Raw Papaya', reason: 'Can cause early contractions', emoji: '🚫' },
      { name: 'Fenugreek in excess', reason: 'Can stimulate contractions', emoji: '⚠️' },
      { name: 'Caffeinated Drinks', reason: 'Limit to 1 cup/day', emoji: '☕' },
      { name: 'Fried Snacks', reason: 'Heavy on digestion', emoji: '🍟' },
    ],
  },
  east_india: {
    label: 'East India',
    toEat: [
      { name: 'Fish Curry (cooked)', reason: 'Omega-3 for brain development', emoji: '🐟' },
      { name: 'Mustard Green Saag', reason: 'Iron and vitamins', emoji: '🥬' },
      { name: 'Brown Rice', reason: 'Fiber and energy', emoji: '🍚' },
      { name: 'Posto (Poppy Seeds)', reason: 'Calcium and minerals', emoji: '🌸' },
      { name: 'Moong Dal', reason: 'Easy protein source', emoji: '💛' },
      { name: 'Pumpkin', reason: 'Vitamin A and fiber', emoji: '🎃' },
    ],
    toAvoid: [
      { name: 'Raw Fish (Sushi style)', reason: 'Risk of parasites', emoji: '🚫' },
      { name: 'High Mercury Fish', reason: 'Can harm baby\'s brain', emoji: '⚠️' },
      { name: 'Excess Mustard Oil', reason: 'Use in moderation', emoji: '🫙' },
      { name: 'Raw Eggs', reason: 'Risk of Salmonella', emoji: '🥚' },
    ],
  },
  other: {
    label: 'General / Other',
    toEat: [
      { name: 'Leafy Greens', reason: 'Folate and iron', emoji: '🥬' },
      { name: 'Lentils & Beans', reason: 'Protein and fiber', emoji: '🫘' },
      { name: 'Dairy Products', reason: 'Calcium for bones', emoji: '🧀' },
      { name: 'Nuts & Seeds', reason: 'Healthy fats and protein', emoji: '🌰' },
      { name: 'Whole Grains', reason: 'Sustained energy', emoji: '🌾' },
      { name: 'Fresh Fruits', reason: 'Vitamins and hydration', emoji: '🍎' },
    ],
    toAvoid: [
      { name: 'Raw Papaya', reason: 'Can cause early contractions', emoji: '🚫' },
      { name: 'Alcohol', reason: 'Harmful to baby', emoji: '🍷' },
      { name: 'High Mercury Fish', reason: 'Can harm baby\'s brain', emoji: '⚠️' },
      { name: 'Unpasteurized Foods', reason: 'Risk of infection', emoji: '🦠' },
    ],
  },
};

export const getRegionDiet = (region) => {
  return dietData[region] || dietData.other;
};
