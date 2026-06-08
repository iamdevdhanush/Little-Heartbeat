import { getConfirmedMedications, getTodaysSchedules, markScheduleTaken as markTaken, getScheduleStats } from '../services/prescriptionService.js';

const STORAGE_KEYS = {
  REMINDER_HISTORY: '@lh_reminder_history',
  ADHERENCE_SNAPSHOTS: '@lh_adherence_snapshots',
  STREAK_DATA: '@lh_streak_data',
  REMINDER_LOG: '@lh_reminder_log',
};

function loadJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function getDateStr(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function getWeekId(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const diff = d - startOfYear;
  const weekNum = Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getMonthId(dateStr) {
  return dateStr.substring(0, 7);
}

function parseTimingToTimes(timing, frequencyNumeric) {
  const lower = (timing || '').toLowerCase();
  const freq = frequencyNumeric || 1;
  const times = [];

  if (lower.includes('empty stomach') || (lower.includes('before') && lower.includes('breakfast'))) {
    times.push('07:00');
  } else if (lower.includes('before breakfast')) {
    times.push('07:30');
  } else if (lower.includes('after lunch')) {
    times.push('14:00');
  } else if (lower.includes('before lunch')) {
    times.push('12:30');
  } else if (lower.includes('after dinner') || (lower.includes('after') && lower.includes('dinner'))) {
    times.push('21:00');
  } else if (lower.includes('before dinner')) {
    times.push('19:30');
  } else if (lower.includes('before sleep') || lower.includes('bedtime') || lower.includes('at night') || lower.includes('night')) {
    times.push('22:00');
  }

  if (lower.includes('morning') || lower.includes('breakfast')) {
    if (!times.some(t => t.startsWith('0') || t.startsWith('07') || t.startsWith('08'))) {
      times.push('08:00');
    }
  }
  if (lower.includes('afternoon') || lower.includes('lunch') || lower.includes('noon')) {
    if (!times.some(t => t.startsWith('12') || t.startsWith('13') || t.startsWith('14'))) {
      times.push('14:00');
    }
  }
  if (lower.includes('evening') || lower.includes('dinner')) {
    if (!times.some(t => t.startsWith('18') || t.startsWith('19') || t.startsWith('20'))) {
      times.push('20:00');
    }
  }

  if (lower.includes('with food') || lower.includes('with meal') || lower.includes('after food') || lower.includes('after meal')) {
    if (times.length === 0) {
      times.push('08:30', '14:30', '20:30');
    }
  }
  if (lower.includes('before food') || lower.includes('before meal')) {
    if (times.length === 0) {
      times.push('07:30', '12:30', '19:30');
    }
  }

  if (lower.includes('every') && lower.includes('hour')) {
    const hourMatch = lower.match(/every\s*(\d+)\s*hour/);
    const interval = hourMatch ? parseInt(hourMatch[1]) : 6;
    for (let h = 0; h < 24; h += interval) {
      times.push(`${String(h).padStart(2, '0')}:00`);
    }
    return times.slice(0, Math.max(freq, Math.ceil(24 / interval)));
  }

  const frequencyMap = {
    'once daily': 1, 'once a day': 1, 'daily': 1,
    'twice daily': 2, 'twice a day': 2, 'bid': 2,
    'three times daily': 3, 'three times a day': 3, 'thrice daily': 3, 'tid': 3,
    'four times daily': 4, 'four times a day': 4, 'qid': 4,
  };

  const effectiveFreq = frequencyMap[lower.trim()] || freq;

  if (times.length === 0 && freq > 1) {
    const interval = 24 / effectiveFreq;
    for (let i = 0; i < effectiveFreq; i++) {
      const hour = Math.round(8 + i * interval);
      times.push(`${String(hour).padStart(2, '0')}:00`);
    }
  } else if (times.length === 0) {
    times.push('08:00');
  }

  return times.slice(0, effectiveFreq);
}

function generateTodayReminders(medicine) {
  const today = getDateStr();
  const times = parseTimingToTimes(medicine.timing, medicine.frequencyNumeric);

  return times.map((time, idx) => ({
    id: `rem-${medicine.id}-${today}-${idx}`,
    medicineId: medicine.id,
    medicineName: medicine.name,
    dosage: medicine.dosage || '',
    instructions: medicine.instructions || '',
    scheduledTime: `${today}T${time}:00`,
    date: today,
    time,
    status: 'pending',
    takenAt: null,
    skippedAt: null,
    snoozedUntil: null,
    notifyCount: 0,
  }));
}

function generateDateReminders(medicine, dateStr) {
  const times = parseTimingToTimes(medicine.timing, medicine.frequencyNumeric);

  return times.map((time, idx) => ({
    id: `rem-${medicine.id}-${dateStr}-${idx}`,
    medicineId: medicine.id,
    medicineName: medicine.name,
    dosage: medicine.dosage || '',
    instructions: medicine.instructions || '',
    scheduledTime: `${dateStr}T${time}:00`,
    date: dateStr,
    time,
    status: 'pending',
    takenAt: null,
    skippedAt: null,
    snoozedUntil: null,
    notifyCount: 0,
  }));
}

class StreakEngine {
  getKey() { return STORAGE_KEYS.STREAK_DATA; }

  load() {
    return loadJson(this.getKey(), { current: 0, longest: 0, lastAdherentDate: null, history: [] });
  }

  save(data) {
    saveJson(this.getKey(), data);
  }

  calculate(dailyAdherenceHistory) {
    const data = this.load();
    const sortedDates = Object.keys(dailyAdherenceHistory)
      .filter(d => dailyAdherenceHistory[d].total > 0)
      .sort();

    if (sortedDates.length === 0) {
      return { ...data, todayComplete: false };
    }

    const today = getDateStr();
    const todayData = dailyAdherenceHistory[today];
    const todayComplete = todayData && todayData.total > 0 && todayData.taken === todayData.total;

    let currentStreak = 0;
    const cursor = new Date();
    while (true) {
      const ds = getDateStr(cursor);
      const day = dailyAdherenceHistory[ds];
      if (day && day.total > 0 && day.taken === day.total) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    if (currentStreak > data.longest) {
      data.longest = currentStreak;
    }
    data.current = currentStreak;
    data.lastAdherentDate = sortedDates[sortedDates.length - 1] || null;
    this.save(data);

    return { ...data, todayComplete };
  }

  reset() {
    const data = { current: 0, longest: this.load().longest, lastAdherentDate: null, history: [] };
    this.save(data);
    return data;
  }
}

class AdherenceEngine {
  constructor() {
    this.history = this._loadHistory();
  }

  _loadHistory() {
    return loadJson(STORAGE_KEYS.ADHERENCE_SNAPSHOTS, {});
  }

  _saveHistory() {
    saveJson(STORAGE_KEYS.ADHERENCE_SNAPSHOTS, this.history);
  }

  _ensureDate(dateStr) {
    if (!this.history[dateStr]) {
      this.history[dateStr] = { total: 0, taken: 0, skipped: 0, missed: 0, pending: 0 };
    }
  }

  recordReminder(reminder) {
    const dateStr = reminder.date || getDateStr();
    this._ensureDate(dateStr);

    const prevStatus = this.history[dateStr]._lastStatus;
    if (prevStatus === 'taken' && reminder.status !== 'taken') {
      this.history[dateStr].taken = Math.max(0, this.history[dateStr].taken - 1);
    }
    if (prevStatus === 'skipped' && reminder.status !== 'skipped') {
      this.history[dateStr].skipped = Math.max(0, this.history[dateStr].skipped - 1);
    }

    if (reminder.status === 'taken') {
      this.history[dateStr].taken = (this.history[dateStr].taken || 0) + 1;
    } else if (reminder.status === 'skipped') {
      this.history[dateStr].skipped = (this.history[dateStr].skipped || 0) + 1;
    }

    this.history[dateStr].total = this.history[dateStr].taken + this.history[dateStr].skipped + this.history[dateStr].missed;
    this.history[dateStr].pending = this.history[dateStr]._totalPlanned
      ? this.history[dateStr]._totalPlanned - this.history[dateStr].taken - this.history[dateStr].skipped - this.history[dateStr].missed
      : 0;
    this.history[dateStr]._lastStatus = reminder.status;
    this._saveHistory();
  }

  setPlannedForDate(dateStr, count) {
    this._ensureDate(dateStr);
    this.history[dateStr]._totalPlanned = count;
    this.history[dateStr].total = count;
    this.history[dateStr].pending = count - (this.history[dateStr].taken || 0) - (this.history[dateStr].skipped || 0) - (this.history[dateStr].missed || 0);
    this._saveHistory();
  }

  markMissed(reminder) {
    const dateStr = reminder.date || getDateStr();
    this._ensureDate(dateStr);
    this.history[dateStr].missed = (this.history[dateStr].missed || 0) + 1;
    this.history[dateStr].pending = Math.max(0, (this.history[dateStr].pending || 1) - 1);
    this.history[dateStr].total = this.history[dateStr].taken + this.history[dateStr].skipped + this.history[dateStr].missed;
    this.history[dateStr]._lastStatus = 'missed';
    this._saveHistory();
  }

  getDailyRate(dateStr) {
    this._ensureDate(dateStr);
    const day = this.history[dateStr];
    if (day.total === 0) return { rate: 0, taken: 0, total: 0 };
    return {
      rate: Math.round((day.taken / day.total) * 100),
      taken: day.taken,
      skipped: day.skipped,
      missed: day.missed,
      pending: day.pending,
      total: day.total,
    };
  }

  getWeeklyRate(dateStr) {
    const d = new Date(dateStr ? dateStr + 'T00:00:00' : Date.now());
    const dayOfWeek = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));

    let totalTaken = 0, totalAll = 0;
    for (let i = 0; i < 7; i++) {
      const ds = getDateStr(monday);
      this._ensureDate(ds);
      totalTaken += this.history[ds].taken || 0;
      totalAll += this.history[ds].total || 0;
      monday.setDate(monday.getDate() + 1);
    }

    return {
      rate: totalAll > 0 ? Math.round((totalTaken / totalAll) * 100) : 0,
      taken: totalTaken,
      total: totalAll,
      weekId: getWeekId(dateStr || getDateStr()),
    };
  }

  getMonthlyRate(dateStr) {
    const d = dateStr || getDateStr();
    const monthStart = d.substring(0, 7) + '-01';
    const monthEnd = new Date(new Date(monthStart).getFullYear(), new Date(monthStart).getMonth() + 1, 0);
    const endStr = getDateStr(monthEnd);

    let totalTaken = 0, totalAll = 0;
    const cursor = new Date(monthStart);
    while (true) {
      const ds = getDateStr(cursor);
      if (ds > endStr) break;
      this._ensureDate(ds);
      totalTaken += this.history[ds].taken || 0;
      totalAll += this.history[ds].total || 0;
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      rate: totalAll > 0 ? Math.round((totalTaken / totalAll) * 100) : 0,
      taken: totalTaken,
      total: totalAll,
      monthId: getMonthId(d),
    };
  }

  getHistory(days = 90) {
    const result = {};
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = getDateStr(d);
      this._ensureDate(ds);
      result[ds] = { ...this.history[ds] };
    }
    return result;
  }

  getFullHistory() {
    return { ...this.history };
  }
}

class ReminderService {
  constructor() {
    this.adherence = new AdherenceEngine();
    this.streaks = new StreakEngine();
    this._timers = new Map();
    this._snoozeTimers = new Map();
    this._onReminderDue = null;
    this._isRunning = false;
    this._dailyCheckInterval = null;
  }

  setOnReminderDue(callback) {
    this._onReminderDue = callback;
  }

  async loadMedicines(userId) {
    const meds = await getConfirmedMedications(userId);
    return meds.filter(m => m.active !== false);
  }

  generateRemindersForToday(medicines) {
    const today = getDateStr();
    const allReminders = [];

    for (const med of medicines) {
      const reminders = generateTodayReminders(med);
      allReminders.push(...reminders);
    }

    allReminders.sort((a, b) => a.time.localeCompare(b.time));
    return allReminders;
  }

  generateRemindersForDate(medicines, dateStr) {
    const allReminders = [];
    for (const med of medicines) {
      const reminders = generateDateReminders(med, dateStr);
      allReminders.push(...reminders);
    }
    allReminders.sort((a, b) => a.time.localeCompare(b.time));
    return allReminders;
  }

  getSavedReminders(dateStr) {
    const all = loadJson(STORAGE_KEYS.REMINDER_HISTORY, {});
    const todayReminders = loadJson(STORAGE_KEYS.REMINDER_LOG, []);
    const dateKey = dateStr || getDateStr();
    const saved = all[dateKey] || [];
    const merged = [...todayReminders.filter(r => r.date === dateKey)];

    for (const s of saved) {
      if (!merged.find(m => m.id === s.id)) {
        merged.push(s);
      }
    }

    return merged.sort((a, b) => a.time?.localeCompare?.(b.time || '') || 0);
  }

  saveReminders(dateStr, reminders) {
    const all = loadJson(STORAGE_KEYS.REMINDER_HISTORY, {});
    all[dateStr] = reminders;
    saveJson(STORAGE_KEYS.REMINDER_HISTORY, all);
  }

  logCurrentReminders(reminders) {
    saveJson(STORAGE_KEYS.REMINDER_LOG, reminders);
  }

  setPlannedCount(dateStr, count) {
    this.adherence.setPlannedForDate(dateStr, count);
  }

  async takeReminder(reminderId, userId) {
    const reminders = loadJson(STORAGE_KEYS.REMINDER_LOG, []);
    const idx = reminders.findIndex(r => r.id === reminderId);
    if (idx === -1) return null;

    reminders[idx] = {
      ...reminders[idx],
      status: 'taken',
      takenAt: new Date().toISOString(),
      skippedAt: null,
      snoozedUntil: null,
    };

    saveJson(STORAGE_KEYS.REMINDER_LOG, reminders);
    this._saveToHistory(reminders[idx].date, reminders[idx]);
    this.adherence.recordReminder(reminders[idx]);

    this._clearReminderTimer(reminderId);
    this._clearSnooze(reminderId);

    try {
      await markTaken(reminderId, userId);
    } catch {}

    return reminders[idx];
  }

  async skipReminder(reminderId, userId) {
    const reminders = loadJson(STORAGE_KEYS.REMINDER_LOG, []);
    const idx = reminders.findIndex(r => r.id === reminderId);
    if (idx === -1) return null;

    reminders[idx] = {
      ...reminders[idx],
      status: 'skipped',
      skippedAt: new Date().toISOString(),
      takenAt: null,
      snoozedUntil: null,
    };

    saveJson(STORAGE_KEYS.REMINDER_LOG, reminders);
    this._saveToHistory(reminders[idx].date, reminders[idx]);
    this.adherence.recordReminder(reminders[idx]);

    this._clearReminderTimer(reminderId);
    this._clearSnooze(reminderId);

    return reminders[idx];
  }

  async snoozeReminder(reminderId, minutes = 10) {
    const reminders = loadJson(STORAGE_KEYS.REMINDER_LOG, []);
    const idx = reminders.findIndex(r => r.id === reminderId);
    if (idx === -1) return null;

    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    reminders[idx] = {
      ...reminders[idx],
      status: 'snoozed',
      snoozedUntil,
    };

    saveJson(STORAGE_KEYS.REMINDER_LOG, reminders);

    this._clearReminderTimer(reminderId);
    this._scheduleSnoozeCallback(reminderId, snoozedUntil);

    return reminders[idx];
  }

  getAdherence(dateStr) {
    return {
      daily: this.adherence.getDailyRate(dateStr),
      weekly: this.adherence.getWeeklyRate(dateStr),
      monthly: this.adherence.getMonthlyRate(dateStr),
    };
  }

  getStreaks() {
    const dailyHistory = this.adherence.getHistory(365);
    return this.streaks.calculate(
      Object.fromEntries(
        Object.entries(dailyHistory).map(([d, v]) => [d, { taken: v.taken, total: v.total }])
      )
    );
  }

  start(medicines, userId) {
    if (this._isRunning) return;
    this._isRunning = true;

    this._scheduleDailyReminders(medicines, userId);
    this._scheduleAdherenceCheck(medicines, userId);

    this._dailyCheckInterval = setInterval(() => {
      this._checkDayRollover(medicines, userId);
    }, 60000);

    this.startMissedDetection();
  }

  stop() {
    this._isRunning = false;
    for (const timer of this._timers.values()) clearTimeout(timer);
    for (const timer of this._snoozeTimers.values()) clearTimeout(timer);
    if (this._dailyCheckInterval) clearInterval(this._dailyCheckInterval);
    this._timers.clear();
    this._snoozeTimers.clear();
  }

  startMissedDetection() {
    this._checkMissed();
  }

  _checkMissed() {
    const reminders = loadJson(STORAGE_KEYS.REMINDER_LOG, []);
    const now = new Date();
    let changed = false;

    for (let i = 0; i < reminders.length; i++) {
      const r = reminders[i];
      if (r.status === 'pending' || r.status === 'snoozed') {
        const scheduledTime = new Date(r.scheduledTime);
        const snoozedTime = r.snoozedUntil ? new Date(r.snoozedUntil) : null;
        const effectiveTime = snoozedTime && snoozedTime > scheduledTime ? snoozedTime : scheduledTime;
        const graceMs = 60 * 60 * 1000;

        if (now - effectiveTime > graceMs) {
          reminders[i] = { ...r, status: 'missed', missedAt: now.toISOString() };
          this.adherence.markMissed(reminders[i]);
          changed = true;
        }
      }
    }

    if (changed) {
      saveJson(STORAGE_KEYS.REMINDER_LOG, reminders);
    }
  }

  _scheduleDailyReminders(medicines, userId) {
    const today = getDateStr();
    let reminders = this.generateRemindersForToday(medicines);

    const savedReminders = this.getSavedReminders(today);
    if (savedReminders.length > 0) {
      const existingIds = new Set(savedReminders.map(r => r.id));
      const newReminders = reminders.filter(r => !existingIds.has(r.id));
      reminders = [...savedReminders, ...newReminders];
    }

    this.saveReminders(today, reminders);
    this.logCurrentReminders(reminders);
    this.setPlannedCount(today, reminders.length);

    for (const reminder of reminders) {
      if (reminder.status === 'pending' || reminder.status === 'snoozed') {
        this._scheduleNotification(reminder, userId);
      }
    }
  }

  _scheduleNotification(reminder, userId) {
    const scheduledTime = new Date(reminder.scheduledTime);
    const now = new Date();
    let delay = scheduledTime.getTime() - now.getTime();

    if (reminder.snoozedUntil) {
      const snoozedTime = new Date(reminder.snoozedUntil);
      delay = snoozedTime.getTime() - now.getTime();
    }

    if (delay < 0) {
      const nextDay = new Date(scheduledTime);
      nextDay.setDate(nextDay.getDate() + 1);
      delay = nextDay.getTime() - now.getTime();
    }

    const timerId = setTimeout(() => {
      if (this._onReminderDue) {
        this._onReminderDue(reminder, userId);
      }
      this._scheduleFollowUp(reminder, userId);
    }, delay);

    this._timers.set(reminder.id, timerId);
  }

  _scheduleFollowUp(reminder, userId) {
    const followUpDelay = 30 * 60 * 1000;
    const timerId = setTimeout(() => {
      const reminders = loadJson(STORAGE_KEYS.REMINDER_LOG, []);
      const current = reminders.find(r => r.id === reminder.id);
      if (current && (current.status === 'pending' || current.status === 'snoozed')) {
        current.notifyCount = (current.notifyCount || 0) + 1;
        if (current.notifyCount < 3 && this._onReminderDue) {
          this._onReminderDue(current, userId);
          this._scheduleFollowUp(current, userId);
        } else if (current.notifyCount >= 3) {
          current.status = 'missed';
          current.missedAt = new Date().toISOString();
          this.adherence.markMissed(current);
          saveJson(STORAGE_KEYS.REMINDER_LOG, reminders);
        }
      }
    }, followUpDelay);

    this._timers.set(`followup-${reminder.id}`, timerId);
  }

  _scheduleSnoozeCallback(reminderId, snoozedUntil) {
    const delay = new Date(snoozedUntil).getTime() - Date.now();
    if (delay <= 0) return;

    const timerId = setTimeout(() => {
      const reminders = loadJson(STORAGE_KEYS.REMINDER_LOG, []);
      const reminder = reminders.find(r => r.id === reminderId);
      if (reminder && this._onReminderDue) {
        reminder.status = 'pending';
        reminder.snoozedUntil = null;
        saveJson(STORAGE_KEYS.REMINDER_LOG, reminders);
        this._onReminderDue(reminder, null);
      }
    }, delay);

    this._snoozeTimers.set(reminderId, timerId);
  }

  _scheduleAdherenceCheck(medicines, userId) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 5, 0, 0);
    const delay = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this._checkMissed();
      this.streaks.calculate(
        Object.fromEntries(
          Object.entries(this.adherence.getHistory(365))
            .map(([d, v]) => [d, { taken: v.taken, total: v.total }])
        )
      );
      this._scheduleDailyReminders(medicines, userId);
      this._scheduleAdherenceCheck(medicines, userId);
    }, delay);
  }

  _checkDayRollover(medicines, userId) {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      this._scheduleDailyReminders(medicines, userId);
    }
  }

  _clearReminderTimer(reminderId) {
    const timer = this._timers.get(reminderId);
    if (timer) { clearTimeout(timer); this._timers.delete(reminderId); }
    const followUp = this._timers.get(`followup-${reminderId}`);
    if (followUp) { clearTimeout(followUp); this._timers.delete(`followup-${reminderId}`); }
  }

  _clearSnooze(reminderId) {
    const timer = this._snoozeTimers.get(reminderId);
    if (timer) { clearTimeout(timer); this._snoozeTimers.delete(reminderId); }
  }

  _saveToHistory(dateStr, reminder) {
    const all = loadJson(STORAGE_KEYS.REMINDER_HISTORY, {});
    if (!all[dateStr]) all[dateStr] = [];
    const idx = all[dateStr].findIndex(r => r.id === reminder.id);
    if (idx >= 0) {
      all[dateStr][idx] = reminder;
    } else {
      all[dateStr].push(reminder);
    }
    saveJson(STORAGE_KEYS.REMINDER_HISTORY, all);
  }
}

export const reminderService = new ReminderService();
export { ReminderService, AdherenceEngine, StreakEngine, parseTimingToTimes, getDateStr, getWeekId, getMonthId, STORAGE_KEYS };
