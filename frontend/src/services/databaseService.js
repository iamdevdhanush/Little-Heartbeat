import { supabase, isSupabaseConfigured } from './supabaseService.js';

const LOCAL_KEYS = {
  USERS: '@lh_db_users',
  PREGNANCIES: '@lh_db_pregnancies',
  MEDICATIONS: '@lh_db_medications',
  REMINDERS: '@lh_db_reminders',
  DOCUMENTS: '@lh_db_documents',
  APPOINTMENTS: '@lh_db_appointments',
  SYMPTOMS: '@lh_db_symptoms',
  MOODS: '@lh_db_moods',
  WATER_LOGS: '@lh_db_water',
  TIMELINE_EVENTS: '@lh_db_timeline',
  INSIGHTS: '@lh_db_insights',
};

function localGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function localSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

async function dbQuery(table, operation, payload, userId) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await operation();
      if (!error && data) return data;
    } catch {}
  }
  const local = localGet(LOCAL_KEYS[table.toUpperCase()]) || [];
  return local.filter(i => !userId || i.user_id === userId);
}

async function dbMutate(table, operation, localOp) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await operation();
      if (!error) { localOp(); return data; }
    } catch {}
  }
  return localOp();
}

export const databaseService = {
  // ── USERS ──
  async getCurrentUser() {
    const { data: { user } } = await supabase?.auth.getUser() || {};
    if (user) {
      const { data } = await supabase.from('users').select('*').eq('auth_id', user.id).single();
      if (data) return data;
    }
    return localGet(LOCAL_KEYS.USERS);
  },

  async upsertUser(userData) {
    const { data: { user } } = await supabase?.auth.getUser() || {};
    const payload = { ...userData, auth_id: user?.id, email: user?.email };
    return dbMutate('users',
      () => supabase.from('users').upsert(payload).select().single(),
      () => { localSet(LOCAL_KEYS.USERS, payload); return payload; }
    );
  },

  // ── PREGNANCIES ──
  async getActivePregnancy(userId) {
    return dbQuery('pregnancies',
      () => supabase.from('pregnancies').select('*').eq('user_id', userId).eq('is_active', true).single(),
      userId
    ).then(r => Array.isArray(r) ? r[0] : r);
  },

  async upsertPregnancy(userId, data) {
    return dbMutate('pregnancies',
      () => supabase.from('pregnancies').upsert({ user_id: userId, ...data }).select().single(),
      () => { localSet(LOCAL_KEYS.PREGNANCIES, { user_id: userId, ...data }); return { user_id: userId, ...data }; }
    );
  },

  // ── MEDICATIONS ──
  async getMedications(userId, activeOnly = true) {
    let q = supabase.from('medications').select('*').eq('user_id', userId);
    if (activeOnly) q = q.eq('active', true);
    const remote = await dbQuery('medications', () => q.order('created_at', { ascending: false }), userId);
    return Array.isArray(remote) ? remote : [];
  },

  async addMedication(userId, med) {
    return dbMutate('medications',
      () => supabase.from('medications').insert({ user_id: userId, ...med }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.MEDICATIONS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, ...med, created_at: new Date().toISOString() };
        all.unshift(entry); localSet(LOCAL_KEYS.MEDICATIONS, all); return entry;
      }
    );
  },

  async updateMedication(id, updates) {
    return dbMutate('medications',
      () => supabase.from('medications').update(updates).eq('id', id).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.MEDICATIONS) || [];
        const idx = all.findIndex(m => m.id === id);
        if (idx >= 0) { all[idx] = { ...all[idx], ...updates }; localSet(LOCAL_KEYS.MEDICATIONS, all); }
        return all[idx];
      }
    );
  },

  async deleteMedication(id) {
    return dbMutate('medications',
      () => supabase.from('medications').update({ active: false }).eq('id', id),
      () => {
        const all = localGet(LOCAL_KEYS.MEDICATIONS) || [];
        localSet(LOCAL_KEYS.MEDICATIONS, all.filter(m => m.id !== id));
      }
    );
  },

  // ── REMINDERS ──
  async getReminders(userId, date) {
    let q = supabase.from('reminders').select('*').eq('user_id', userId);
    if (date) q = q.eq('date', date);
    const remote = await dbQuery('reminders', () => q.order('scheduled_time', { ascending: true }), userId);
    return Array.isArray(remote) ? remote : [];
  },

  async upsertReminder(userId, reminder) {
    return dbMutate('reminders',
      () => supabase.from('reminders').upsert({ user_id: userId, ...reminder }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.REMINDERS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, ...reminder };
        all.push(entry); localSet(LOCAL_KEYS.REMINDERS, all); return entry;
      }
    );
  },

  async updateReminderStatus(id, status, timestamp) {
    const updates = { status };
    if (status === 'taken') updates.taken_at = timestamp || new Date().toISOString();
    if (status === 'skipped') updates.skipped_at = timestamp || new Date().toISOString();
    return dbMutate('reminders',
      () => supabase.from('reminders').update(updates).eq('id', id),
      () => {
        const all = localGet(LOCAL_KEYS.REMINDERS) || [];
        const idx = all.findIndex(r => r.id === id);
        if (idx >= 0) { all[idx] = { ...all[idx], ...updates }; localSet(LOCAL_KEYS.REMINDERS, all); }
      }
    );
  },

  // ── DOCUMENTS ──
  async getDocuments(userId, category) {
    let q = supabase.from('documents').select('*').eq('user_id', userId);
    if (category && category !== 'all') q = q.eq('category', category);
    const remote = await dbQuery('documents', () => q.order('uploaded_at', { ascending: false }), userId);
    return Array.isArray(remote) ? remote : [];
  },

  async addDocument(userId, doc) {
    return dbMutate('documents',
      () => supabase.from('documents').insert({ user_id: userId, ...doc }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.DOCUMENTS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, ...doc, uploaded_at: new Date().toISOString() };
        all.unshift(entry); localSet(LOCAL_KEYS.DOCUMENTS, all); return entry;
      }
    );
  },

  async deleteDocument(id) {
    return dbMutate('documents',
      () => supabase.from('documents').delete().eq('id', id),
      () => {
        const all = localGet(LOCAL_KEYS.DOCUMENTS) || [];
        localSet(LOCAL_KEYS.DOCUMENTS, all.filter(d => d.id !== id));
      }
    );
  },

  // ── APPOINTMENTS ──
  async getAppointments(userId, upcoming = true) {
    let q = supabase.from('appointments').select('*').eq('user_id', userId);
    if (upcoming) q = q.gte('scheduled_at', new Date().toISOString());
    const remote = await dbQuery('appointments', () => q.order('scheduled_at', { ascending: true }).limit(10), userId);
    return Array.isArray(remote) ? remote : [];
  },

  async addAppointment(userId, appointment) {
    return dbMutate('appointments',
      () => supabase.from('appointments').insert({ user_id: userId, ...appointment }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.APPOINTMENTS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, ...appointment };
        all.push(entry); localSet(LOCAL_KEYS.APPOINTMENTS, all); return entry;
      }
    );
  },

  // ── SYMPTOMS ──
  async getSymptoms(userId, days = 7) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const remote = await dbQuery('symptoms',
      () => supabase.from('symptoms').select('*').eq('user_id', userId).gte('logged_at', since).order('logged_at', { ascending: false }),
      userId
    );
    return Array.isArray(remote) ? remote : [];
  },

  async logSymptom(userId, symptom) {
    return dbMutate('symptoms',
      () => supabase.from('symptoms').insert({ user_id: userId, ...symptom }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.SYMPTOMS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, ...symptom, logged_at: new Date().toISOString() };
        all.unshift(entry); localSet(LOCAL_KEYS.SYMPTOMS, all); return entry;
      }
    );
  },

  // ── MOODS ──
  async getMoods(userId, days = 14) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const remote = await dbQuery('moods',
      () => supabase.from('moods').select('*').eq('user_id', userId).gte('logged_at', since).order('logged_at', { ascending: false }),
      userId
    );
    return Array.isArray(remote) ? remote : [];
  },

  async logMood(userId, mood) {
    return dbMutate('moods',
      () => supabase.from('moods').insert({ user_id: userId, ...mood }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.MOODS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, ...mood, logged_at: new Date().toISOString() };
        all.unshift(entry); localSet(LOCAL_KEYS.MOODS, all); return entry;
      }
    );
  },

  // ── WATER LOGS ──
  async getWaterLogs(userId, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const remote = await dbQuery('water_logs',
      () => supabase.from('water_logs').select('*').eq('user_id', userId).eq('date', targetDate),
      userId
    );
    return Array.isArray(remote) ? remote : [];
  },

  async logWater(userId, glasses = 1) {
    return dbMutate('water_logs',
      () => supabase.from('water_logs').insert({ user_id: userId, glasses, date: new Date().toISOString().split('T')[0] }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.WATER_LOGS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, glasses, logged_at: new Date().toISOString(), date: new Date().toISOString().split('T')[0] };
        all.push(entry); localSet(LOCAL_KEYS.WATER_LOGS, all); return entry;
      }
    );
  },

  // ── TIMELINE EVENTS ──
  async getTimelineEvents(userId, pregnancyId) {
    let q = supabase.from('timeline_events').select('*').eq('user_id', userId);
    if (pregnancyId) q = q.eq('pregnancy_id', pregnancyId);
    const remote = await dbQuery('timeline_events', () => q.order('week', { ascending: true }), userId);
    return Array.isArray(remote) ? remote : [];
  },

  async addTimelineEvent(userId, event) {
    return dbMutate('timeline_events',
      () => supabase.from('timeline_events').insert({ user_id: userId, ...event }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.TIMELINE_EVENTS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, ...event, created_at: new Date().toISOString() };
        all.push(entry); localSet(LOCAL_KEYS.TIMELINE_EVENTS, all); return entry;
      }
    );
  },

  // ── REFERENCE DATA (read-only, from DB seed) ──
  async getBabyGrowth(week) {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('baby_growth').select('*').eq('week', week).single();
      if (data) return data;
    }
    return this._getFallbackBabyGrowth(week);
  },

  async getDietRecommendations(region) {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('diet_recommendations').select('*').eq('region', region || 'other');
      if (data?.length) return { toEat: data.filter(d => d.category === 'to_eat'), toAvoid: data.filter(d => d.category === 'to_avoid') };
    }
    const fallback = this._getFallbackDiet(region);
    return { toEat: fallback.filter(d => d.category === 'to_eat'), toAvoid: fallback.filter(d => d.category === 'to_avoid') };
  },

  async getPregnancyInsight(week) {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('pregnancy_insights').select('*').eq('week', week).single();
      if (data) return data;
    }
    return this._getFallbackInsight(week);
  },

  async getBodyChanges() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('body_changes').select('*');
      if (data?.length) return data;
    }
    return this._getFallbackBodyChanges();
  },

  async getMoodTypes() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('mood_types').select('*');
      if (data?.length) return data;
    }
    return [
      { id: 'calm', label: 'Calm', emoji: '😌' },
      { id: 'excited', label: 'Excited', emoji: '✨' },
      { id: 'tired', label: 'Tired', emoji: '😴' },
      { id: 'anxious', label: 'Anxious', emoji: '🥺' },
      { id: 'happy', label: 'Happy', emoji: '😊' },
      { id: 'sad', label: 'Sad', emoji: '😢' },
    ];
  },

  // ── INSIGHTS (user-specific, generated or manual) ──
  async getUserInsights(userId, pregnancyId) {
    let q = supabase.from('user_insights').select('*').eq('user_id', userId);
    if (pregnancyId) q = q.eq('pregnancy_id', pregnancyId);
    const remote = await dbQuery('insights', () => q.order('created_at', { ascending: false }).limit(5), userId);
    return Array.isArray(remote) ? remote : [];
  },

  async addUserInsight(userId, insight) {
    return dbMutate('insights',
      () => supabase.from('user_insights').insert({ user_id: userId, ...insight }).select().single(),
      () => {
        const all = localGet(LOCAL_KEYS.INSIGHTS) || [];
        const entry = { id: crypto.randomUUID(), user_id: userId, ...insight, created_at: new Date().toISOString() };
        all.unshift(entry); localSet(LOCAL_KEYS.INSIGHTS, all); return entry;
      }
    );
  },

  // ── ADHERENCE ──
  async getAdherence(userId, days = 30) {
    const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const reminders = await this.getReminders(userId);
    const filtered = reminders.filter(r => r.date >= since);
    const total = filtered.length;
    const taken = filtered.filter(r => r.status === 'taken').length;
    return { total, taken, rate: total > 0 ? Math.round((taken / total) * 100) : 0 };
  },

  _getFallbackBabyGrowth(week) {
    const data = [
      { week: 1, size_label: 'a poppy seed', size_emoji: '🌱', length_cm: '0.1 cm', weight: 'negligible', description: 'Fertilization has occurred.', development: 'Cell division begins.' },
      { week: 12, size_label: 'a plum', size_emoji: '🍑', length_cm: '6.0 cm', weight: '28g', description: 'The baby is the size of a plum.', development: 'The brain is developing rapidly.' },
      { week: 20, size_label: 'a banana', size_emoji: '🍌', length_cm: '16.0 cm', weight: '300g', description: 'The baby is the size of a banana.', development: 'The baby can swallow amniotic fluid.' },
      { week: 28, size_label: 'an eggplant', size_emoji: '🍆', length_cm: '31.0 cm', weight: '1.0 kg', description: 'The baby is the size of an eggplant.', development: 'The brain is developing billions of neurons.' },
      { week: 36, size_label: 'a bunch of kale', size_emoji: '🥬', length_cm: '41.0 cm', weight: '2.5 kg', description: 'The baby is the size of a bunch of kale.', development: 'The baby is in the final position for birth.' },
      { week: 40, size_label: 'a small pumpkin', size_emoji: '🎃', length_cm: '45.0 cm', weight: '3.4 kg', description: 'The baby is the size of a small pumpkin.', development: 'Full term! Ready to meet you.' },
    ];
    const sorted = [...data].sort((a, b) => Math.abs(a.week - week) - Math.abs(b.week - week));
    return sorted[0];
  },

  _getFallbackDiet(region) { return []; },

  _getFallbackInsight(week) {
    return { week, insight_text: 'Your body is doing amazing work.', tip_text: 'Stay hydrated and rest well.', exercise_text: 'Gentle walking', category: 'general' };
  },

  _getFallbackBodyChanges() {
    return [
      { id: 'back_pain', symptom: 'Back Pain', title: 'Back Pain is Very Common', explanation: 'As your belly grows, your center of gravity shifts forward.', emoji: '🔙', tips: ['Take rest', 'Use a pregnancy pillow', 'Try prenatal yoga', 'Apply warm compress'], when_to_worry: 'See doctor if severe.' },
      { id: 'swelling', symptom: 'Swelling', title: 'Mild Swelling is Normal', explanation: 'Your body produces 50% more blood during pregnancy.', emoji: '🦶', tips: ['Elevate feet', 'Drink water', 'Avoid standing too long', 'Wear comfortable shoes'], when_to_worry: 'Contact doctor if sudden or severe.' },
      { id: 'nausea', symptom: 'Nausea', title: 'Morning Sickness Can Happen Any Time', explanation: 'Rising hormone levels trigger nausea.', emoji: '🤢', tips: ['Eat small meals', 'Keep crackers by bed', 'Avoid strong smells', 'Ginger tea helps'], when_to_worry: 'If no food/water for 24 hours.' },
      { id: 'fatigue', symptom: 'Fatigue', title: 'Extreme Tiredness is Normal', explanation: 'Your body is working overtime.', emoji: '😴', tips: ['Take short naps', 'Go to bed earlier', 'Stay hydrated', 'Light exercise'], when_to_worry: 'If extreme or with pale skin.' },
      { id: 'heartburn', symptom: 'Heartburn', title: 'Heartburn is Common', explanation: 'Progesterone relaxes the esophageal valve.', emoji: '🔥', tips: ['Eat smaller meals', 'Avoid spicy food', 'Don\'t lie down after eating', 'Sleep elevated'], when_to_worry: 'If severe or with difficulty swallowing.' },
    ];
  },
};

export default databaseService;
