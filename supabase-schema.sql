-- ============================================================
-- LITTLE HEARTBEAT — Supabase Schema
-- All 11 tables with RLS, indexes, and triggers
-- ============================================================

-- ── 1. USERS ──
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  avatar_initial TEXT GENERATED ALWAYS AS (UPPER(LEFT(name, 1))) STORED,
  phone TEXT DEFAULT '',
  blood_type TEXT DEFAULT '',
  allergies TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  region TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own ON users FOR ALL USING (auth_id = auth.uid());

-- ── 2. PREGNANCIES ──
CREATE TABLE pregnancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  conception_date DATE GENERATED ALWAYS AS (due_date - INTERVAL '280 days') STORED,
  current_week INTEGER GENERATED ALWAYS AS (
    GREATEST(1, LEAST(42, FLOOR(EXTRACT(EPOCH FROM (NOW() - (due_date - INTERVAL '280 days'))) / 604800)::INTEGER + 1))
  ) STORED,
  trimester INTEGER GENERATED ALWAYS AS (
    CASE WHEN current_week <= 13 THEN 1 WHEN current_week <= 27 THEN 2 ELSE 3 END
  ) STORED,
  baby_name TEXT DEFAULT '',
  fetal_sex TEXT DEFAULT '' CHECK (fetal_sex IN ('', 'female', 'male', 'unknown')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE pregnancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY pregnancies_own ON pregnancies FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_pregnancies_user ON pregnancies(user_id);

-- ── 3. MEDICATIONS ──
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  dosage TEXT DEFAULT '',
  frequency TEXT DEFAULT '',
  frequency_numeric INTEGER,
  frequency_per TEXT DEFAULT 'day',
  timing TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  prescribed_by TEXT DEFAULT '',
  refill_date DATE,
  refill_reminder BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  started_at DATE DEFAULT CURRENT_DATE,
  ended_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY medications_own ON medications FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_medications_active ON medications(user_id, active);

-- ── 4. REMINDERS ──
CREATE TYPE reminder_status AS ENUM ('pending', 'taken', 'skipped', 'missed', 'snoozed');
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status reminder_status DEFAULT 'pending',
  taken_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  notify_count INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY reminders_own ON reminders FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_reminders_user_date ON reminders(user_id, date);
CREATE INDEX idx_reminders_status ON reminders(status);

-- ── 5. DOCUMENTS ──
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('prescription', 'lab_report', 'scan', 'medical', 'other')),
  file_type TEXT DEFAULT '',
  file_size INTEGER DEFAULT 0,
  file_url TEXT DEFAULT '',
  ocr_text TEXT DEFAULT '',
  ai_summary JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_own ON documents FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_category ON documents(user_id, category);

-- ── 6. APPOINTMENTS ──
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  doctor_name TEXT DEFAULT '',
  clinic_name TEXT DEFAULT '',
  location TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled', 'rescheduled')),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY appointments_own ON appointments FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_appointments_user_date ON appointments(user_id, scheduled_at);

-- ── 7. SYMPTOMS ──
CREATE TABLE symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  symptom TEXT NOT NULL,
  severity INTEGER DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  notes TEXT DEFAULT '',
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY symptoms_own ON symptoms FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_symptoms_user_date ON symptoms(user_id, date);

-- ── 8. MOODS ──
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  mood TEXT NOT NULL,
  emoji TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY moods_own ON moods FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_moods_user_date ON moods(user_id, date);

-- ── 9. WATER_LOGS ──
CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  glasses INTEGER NOT NULL DEFAULT 1,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY water_logs_own ON water_logs FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, date);

-- ── 10. TIMELINE_EVENTS ──
CREATE TYPE event_category AS ENUM ('milestone', 'appointment', 'scan', 'symptom', 'achievement', 'note');
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  week INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '📌',
  category event_category DEFAULT 'note',
  event_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY timeline_events_own ON timeline_events FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_timeline_week ON timeline_events(pregnancy_id, week);

-- ── 11. USER_INSIGHTS ──
CREATE TABLE user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  week INTEGER NOT NULL,
  insight_text TEXT NOT NULL,
  tip_text TEXT DEFAULT '',
  category TEXT DEFAULT 'general' CHECK (category IN ('nutrition', 'exercise', 'medical', 'emotional', 'general')),
  source TEXT DEFAULT 'system' CHECK (source IN ('system', 'ai', 'doctor', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY insights_own ON user_insights FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_insights_week ON user_insights(pregnancy_id, week);

-- ── AUTO-UPDATE TRIGGERS ──
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER pregnancies_updated_at BEFORE UPDATE ON pregnancies
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER medications_updated_at BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER timeline_updated_at BEFORE UPDATE ON timeline_events
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── SEED DEFAULT MOOD TYPES (reference data) ──
CREATE TABLE mood_types (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL
);
INSERT INTO mood_types VALUES
  ('calm', 'Calm', '😌'),
  ('excited', 'Excited', '✨'),
  ('tired', 'Tired', '😴'),
  ('anxious', 'Anxious', '🥺'),
  ('happy', 'Happy', '😊'),
  ('sad', 'Sad', '😢'),
  ('energetic', 'Energetic', '⚡'),
  ('nauseous', 'Nauseous', '🤢');

-- ── SEED BABY GROWTH REFERENCE DATA ──
CREATE TABLE baby_growth (
  week INTEGER PRIMARY KEY,
  size_label TEXT NOT NULL,
  size_emoji TEXT NOT NULL,
  length_cm TEXT NOT NULL,
  weight TEXT NOT NULL,
  description TEXT NOT NULL,
  development TEXT NOT NULL
);

-- Seed all 40 weeks
INSERT INTO baby_growth VALUES
  (1, 'a poppy seed', '🌱', '0.1 cm', 'negligible', 'Fertilization has occurred. The zygote is forming.', 'Cell division begins as the embryo travels to the uterus.'),
  (2, 'a tiny dot', '📍', '0.2 cm', 'negligible', 'The embryo has implanted in the uterine lining.', 'The placenta begins to form.'),
  (3, 'a sesame seed', '🫘', '0.3 cm', 'less than 1g', 'The neural tube is forming — the foundation of the brain and spine.', 'The heart begins to beat around day 22.'),
  (4, 'a poppy seed', '🌱', '0.5 cm', 'less than 1g', 'The embryo is now the size of a poppy seed.', 'The heart is beating and the circulatory system is working.'),
  (5, 'a raspberry', '🍇', '1.2 cm', 'less than 1g', 'The baby is the size of a raspberry.', 'Eyes, ears, and nose are starting to form.'),
  (6, 'a lentil', '🫘', '1.5 cm', 'less than 1g', 'The baby looks like a tiny tadpole with a tail.', 'The heart is beating 110-160 times per minute.'),
  (7, 'a blueberry', '🫐', '2.0 cm', 'less than 1g', 'The baby doubles in size each week.', 'Arm and leg buds are visible.'),
  (8, 'a kidney bean', '🫘', '2.5 cm', '4g', 'The baby is the size of a kidney bean.', 'Webbed fingers and toes are forming.'),
  (9, 'a grape', '🍇', '3.0 cm', '7g', 'The baby is the size of a grape.', 'The tail has disappeared.'),
  (10, 'a prune', '🫐', '3.5 cm', '10g', 'The baby is the size of a prune.', 'The ears are fully formed.'),
  (11, 'a lime', '🍋', '5.0 cm', '15g', 'The baby is the size of a lime.', 'The baby can open and close their fists.'),
  (12, 'a plum', '🍑', '6.0 cm', '28g', 'The baby is the size of a plum.', 'The brain is developing rapidly.'),
  (13, 'a peach', '🍑', '7.5 cm', '42g', 'The baby is the size of a peach.', 'Vocal cords are forming.'),
  (14, 'a lemon', '🍋', '9.0 cm', '55g', 'The baby is the size of a lemon.', 'The baby can make facial expressions.'),
  (15, 'an apple', '🍎', '10.0 cm', '75g', 'The baby is the size of an apple.', 'The baby can hiccup.'),
  (16, 'an avocado', '🥑', '12.0 cm', '100g', 'The baby is the size of an avocado.', 'The baby can hear your voice.'),
  (17, 'a pear', '🍐', '13.0 cm', '140g', 'The baby is the size of a pear.', 'The baby is developing a sleep-wake cycle.'),
  (18, 'a bell pepper', '🫑', '14.0 cm', '190g', 'The baby is the size of a bell pepper.', 'The baby can yawn and stretch.'),
  (19, 'a mango', '🥭', '15.0 cm', '240g', 'The baby is the size of a mango.', 'The baby is covered in vernix caseosa.'),
  (20, 'a banana', '🍌', '16.0 cm', '300g', 'The baby is the size of a banana.', 'The baby can swallow amniotic fluid.'),
  (21, 'a carrot', '🥕', '18.0 cm', '360g', 'The baby is the size of a carrot.', 'The baby has developed taste buds.'),
  (22, 'a papaya', '🌿', '20.0 cm', '430g', 'The baby is the size of a papaya.', 'The baby has eyebrows and eyelashes.'),
  (23, 'a grapefruit', '🍊', '22.0 cm', '500g', 'The baby is the size of a grapefruit.', 'The baby has a regular sleep cycle.'),
  (24, 'an ear of corn', '🌽', '24.0 cm', '600g', 'The baby is the size of an ear of corn.', 'The baby can hear loud noises.'),
  (25, 'a rutabaga', '🥬', '26.0 cm', '660g', 'The baby is the size of a rutabaga.', 'The baby is starting to put on fat.'),
  (26, 'a coconut', '🥥', '28.0 cm', '760g', 'The baby is the size of a coconut.', 'The baby\'s lungs are developing.'),
  (27, 'a cauliflower', '🥦', '30.0 cm', '875g', 'The baby is the size of a cauliflower.', 'The baby can open their eyes.'),
  (28, 'an eggplant', '🍆', '31.0 cm', '1.0 kg', 'The baby is the size of an eggplant.', 'The baby\'s brain is developing billions of neurons.'),
  (29, 'a butternut squash', '🎃', '33.0 cm', '1.1 kg', 'The baby is the size of a butternut squash.', 'The baby can kick and stretch strongly.'),
  (30, 'a cabbage', '🥬', '34.0 cm', '1.3 kg', 'The baby is the size of a cabbage.', 'The baby\'s five senses are fully developed.'),
  (31, 'a pineapple', '🍍', '36.0 cm', '1.5 kg', 'The baby is the size of a pineapple.', 'The baby is gaining about 200g per week.'),
  (32, 'a large jicama', '🥔', '37.0 cm', '1.7 kg', 'The baby is the size of a large jicama.', 'The baby\'s toenails are visible.'),
  (33, 'a honeydew', '🍈', '38.0 cm', '1.9 kg', 'The baby is the size of a honeydew.', 'The baby\'s bones are hardening.'),
  (34, 'a cantaloupe', '🍈', '39.0 cm', '2.1 kg', 'The baby is the size of a cantaloupe.', 'The baby is preparing for birth.'),
  (35, 'a watermelon', '🍉', '40.0 cm', '2.3 kg', 'The baby is the size of a watermelon.', 'The baby\'s lungs are almost fully mature.'),
  (36, 'a bunch of kale', '🥬', '41.0 cm', '2.5 kg', 'The baby is the size of a bunch of kale.', 'The baby is in the final position for birth.'),
  (37, 'a winter melon', '🍈', '42.0 cm', '2.7 kg', 'The baby is the size of a winter melon.', 'The baby is losing the vernix caseosa.'),
  (38, 'a rhubarb bunch', '🥬', '43.0 cm', '3.0 kg', 'The baby is the size of a rhubarb bunch.', 'The baby\'s head is engaged in the pelvis.'),
  (39, 'a mini watermelon', '🍉', '44.0 cm', '3.2 kg', 'The baby is the size of a mini watermelon.', 'The baby is ready for birth.'),
  (40, 'a small pumpkin', '🎃', '45.0 cm', '3.4 kg', 'The baby is the size of a small pumpkin.', 'Full term! The baby is ready to meet you.'),
  (41, 'a large pumpkin', '🎃', '46.0 cm', '3.6 kg', 'The baby is the size of a large pumpkin.', 'Post-term — discuss induction with your doctor.'),
  (42, 'a huge pumpkin', '🎃', '47.0 cm', '3.8 kg', 'The baby is the size of a huge pumpkin.', 'Post-term — induction is typically recommended.');

-- ── SEED DIETARY REFERENCE DATA ──
CREATE TABLE diet_recommendations (
  region TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('to_eat', 'to_avoid')),
  name TEXT NOT NULL,
  reason TEXT NOT NULL,
  emoji TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);
-- Seed data for each region would be inserted here
-- For brevity, showing a representative sample:
INSERT INTO diet_recommendations VALUES
  ('north_india', 'to_eat', 'Dal & Rice', 'Rich in protein and energy', '🍚', 1),
  ('north_india', 'to_eat', 'Palak Paneer', 'Iron and calcium for baby', '🥬', 2),
  ('north_india', 'to_eat', 'Whole Wheat Roti', 'Fiber-rich for digestion', '🫓', 3),
  ('north_india', 'to_eat', 'Ghee in Moderation', 'Healthy fats for brain development', '🧈', 4),
  ('north_india', 'to_eat', 'Seasonal Fruits', 'Natural vitamins and hydration', '🍎', 5),
  ('north_india', 'to_eat', 'Yogurt (Dahi)', 'Probiotics and calcium', '🥛', 6),
  ('north_india', 'to_avoid', 'Raw Papaya', 'Can cause early contractions', '🚫', 1),
  ('north_india', 'to_avoid', 'Excessive Caffeine', 'Can affect baby\'s heart rate', '☕', 2),
  ('north_india', 'to_avoid', 'Street Food', 'Risk of bacteria and hygiene concerns', '🌮', 3),
  ('north_india', 'to_avoid', 'Unpasteurized Milk', 'Risk of listeria infection', '🥛', 4);

-- ── SEED INSIGHT REFERENCE DATA ──
CREATE TABLE pregnancy_insights (
  week INTEGER NOT NULL,
  insight_text TEXT NOT NULL,
  tip_text TEXT NOT NULL,
  exercise_text TEXT DEFAULT '',
  category TEXT DEFAULT 'general'
);
INSERT INTO pregnancy_insights VALUES
  (1, 'Your body is working hard creating new life. The tiny cluster of cells is already growing rapidly.', 'Take folic acid daily if you haven\'t already. Stay hydrated and avoid alcohol.', 'Short 10-minute walks', 'nutrition'),
  (8, 'The baby\'s heart is beating! All major organs have begun forming.', 'Eat small, frequent meals. Ginger tea can help with morning sickness naturally.', 'Gentle stretching and pelvic tilts', 'medical'),
  (12, 'The risk of miscarriage drops significantly after this week. The baby is now fully formed.', 'Announce your pregnancy if you feel ready! Start looking into prenatal classes.', 'Swimming or water aerobics (low impact)', 'emotional'),
  (16, 'The baby can hear your voice! The tiny ears are fully developed.', 'Play gentle music, talk to your bump. Your baby recognizes your voice.', 'Prenatal yoga — cat-cow and child\'s pose', 'emotional'),
  (20, 'Halfway there! The baby is active and you may feel the first fluttering movements.', 'Start tracking kicks. Begin researching baby gear and nursery setup.', 'Walking 20 minutes daily with proper posture', 'exercise'),
  (24, 'The baby has a regular sleep-wake cycle and can respond to touch.', 'Practice mindfulness or meditation. Start perineal massage preparation.', 'Kegel exercises — 3 sets of 10 daily', 'exercise'),
  (28, 'The baby\'s brain is forming billions of neurons each day.', 'Keep up your iron intake. Start preparing your hospital bag.', 'Prenatal Pilates — focus on core and pelvic floor', 'medical'),
  (32, 'The baby is gaining about 200g per week and practicing breathing movements.', 'Rest on your left side for best blood flow. Watch for swelling.', 'Birth ball exercises and gentle squats', 'exercise'),
  (36, 'The baby is in the final position for birth. Almost ready!', 'Pack your hospital bag. Confirm your birth plan with your doctor.', 'Walking and gentle hip circles to encourage optimal positioning', 'general'),
  (40, 'Full term! Your baby can arrive any day now. You\'ve done an incredible job carrying this little one.', 'Trust your body. Rest as much as you can before the big day. Celebrate this moment!', 'Light walking only — conserve energy for labor', 'emotional');

-- ── BODY CHANGES REFERENCE ──
CREATE TABLE body_changes (
  id TEXT PRIMARY KEY,
  symptom TEXT NOT NULL,
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  emoji TEXT DEFAULT '',
  tips TEXT[] DEFAULT '{}',
  when_to_worry TEXT DEFAULT ''
);
INSERT INTO body_changes VALUES
  ('back_pain', 'Back Pain', 'Back Pain is Very Common', 'As your belly grows, your center of gravity shifts forward. This puts extra strain on your lower back muscles. The hormone relaxin also loosens your ligaments, which can contribute to discomfort.', '🔙', ARRAY['Take rest and avoid standing for long periods', 'Use a pregnancy pillow while sleeping', 'Try prenatal yoga or gentle stretches', 'Apply a warm compress to the sore area'], 'See a doctor if the pain is severe, persistent, or accompanied by fever or bleeding.'),
  ('swelling', 'Swelling', 'Mild Swelling is Normal', 'Your body produces about 50% more blood and fluids during pregnancy to support the baby. This extra fluid can collect in your feet, ankles, and hands, causing mild edema.', '🦶', ARRAY['Elevate your feet when sitting', 'Drink plenty of water to flush excess fluids', 'Avoid standing for too long', 'Wear comfortable, supportive shoes'], 'Contact your doctor if swelling is sudden, severe, or accompanied by headache or vision changes.'),
  ('nausea', 'Nausea', 'Morning Sickness Can Happen Any Time', 'Rising hormone levels, especially hCG, can trigger nausea and vomiting. Despite its name, morning sickness can strike at any time of day. It usually peaks around week 9 and improves by week 14.', '🤢', ARRAY['Eat small, frequent meals throughout the day', 'Keep crackers by your bedside for morning', 'Avoid strong smells and greasy foods', 'Ginger tea or lemon water can help settle your stomach'], 'Contact your doctor if you cannot keep any food or water down for 24 hours.'),
  ('fatigue', 'Fatigue', 'Extreme Tiredness is Normal', 'Your body is working overtime to grow a baby. High progesterone levels can make you feel sleepy, and your body is using enormous amounts of energy for fetal development.', '😴', ARRAY['Take short naps when needed (20-30 minutes)', 'Go to bed earlier than usual', 'Stay hydrated and eat iron-rich foods', 'Light exercise can boost your energy levels'], 'See your doctor if fatigue is extreme or accompanied by shortness of breath or pale skin.'),
  ('heartburn', 'Heartburn', 'Heartburn is Common in Pregnancy', 'Progesterone relaxes the valve between your stomach and esophagus, allowing stomach acid to flow upward. Later in pregnancy, the growing uterus also presses on your stomach.', '🔥', ARRAY['Eat smaller meals more frequently', 'Avoid spicy, fried, or acidic foods', 'Don\'t lie down immediately after eating', 'Sleep with your head slightly elevated'], 'Contact your doctor if heartburn is severe or accompanied by difficulty swallowing.'),
  ('headache', 'Headache', 'Hormonal Headaches are Common', 'Increased blood flow and hormonal changes can trigger tension headaches. These are most common in the first trimester and usually improve as your body adjusts.', '🤕', ARRAY['Rest in a dark, quiet room', 'Stay hydrated throughout the day', 'Apply a cold or warm compress to your head', 'Practice relaxation techniques like deep breathing'], 'Contact your doctor immediately if headaches are severe, persistent, or accompanied by vision changes.'),
  ('cramping', 'Cramping', 'Mild Cramping Can Be Normal', 'As your uterus expands and stretches, you may feel mild cramping similar to period cramps. This is called round ligament pain and is very common in the second trimester.', '😣', ARRAY['Rest and change positions slowly', 'Apply a warm compress (not hot)', 'Try gentle stretching exercises', 'Stay hydrated to prevent Braxton Hicks contractions'], 'Contact your doctor if cramping is severe, regular, or accompanied by bleeding.');
