import { supabase, isSupabaseConfigured } from './supabaseService.js';

const STORAGE_KEY = '@lh_prescriptions';
const MEDICATIONS_KEY = '@lh_medications';
const SCHEDULES_KEY = '@lh_medication_schedules';

function getItem(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Storage error:', e);
    return false;
  }
}

export async function savePrescription(userId, prescriptionResult) {
  const entry = {
    id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rawText: prescriptionResult.rawText,
    ocrConfidence: prescriptionResult.ocrConfidence,
    medicines: prescriptionResult.medicines,
    doctor: prescriptionResult.doctor,
    dates: prescriptionResult.dates,
    confidence: prescriptionResult.confidence,
    fileInfo: prescriptionResult.fileInfo,
    status: 'pending',
    reviewed: false,
  };

  const existing = getItem(STORAGE_KEY) || [];
  existing.unshift(entry);
  setItem(STORAGE_KEY, existing);

  if (isSupabaseConfigured() && userId) {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          user_id: userId,
          raw_text: entry.rawText,
          ocr_confidence: entry.ocrConfidence,
          medicines: entry.medicines,
          doctor: entry.doctor,
          dates: entry.dates,
          confidence: entry.confidence,
          file_info: entry.fileInfo,
          status: entry.status,
        });
      if (error) console.error('Supabase save error:', error);
    } catch (err) {
      console.error('Supabase error:', err);
    }
  }

  return entry;
}

export async function getPrescriptions(userId) {
  const local = getItem(STORAGE_KEY) || [];

  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data?.length > 0) {
        return data.map((r) => ({
          id: r.id,
          userId: r.user_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          rawText: r.raw_text,
          ocrConfidence: r.ocr_confidence,
          medicines: r.medicines,
          doctor: r.doctor,
          dates: r.dates,
          confidence: r.confidence,
          fileInfo: r.file_info,
          status: r.status,
          reviewed: r.reviewed || false,
        }));
      }
    } catch (err) {
      console.error('Supabase fetch error:', err);
    }
  }

  return local;
}

export async function confirmMedication(medicine, userId) {
  const medEntry = {
    id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    userId,
    name: medicine.name,
    dosage: medicine.dosage,
    frequency: medicine.frequency,
    frequencyNumeric: medicine.frequencyNumeric,
    frequencyPer: medicine.frequencyPer,
    timing: medicine.timing,
    duration: medicine.duration,
    instructions: medicine.instructions,
    prescriptionId: medicine.prescriptionId || null,
    confirmedAt: new Date().toISOString(),
    active: true,
    adherence: [],
  };

  const existing = getItem(MEDICATIONS_KEY) || [];
  existing.unshift(medEntry);
  setItem(MEDICATIONS_KEY, existing);

  if (isSupabaseConfigured() && userId) {
    try {
      const { error } = await supabase
        .from('medications')
        .insert({
          user_id: userId,
          name: medEntry.name,
          dosage: medEntry.dosage,
          frequency: medEntry.frequency,
          frequency_numeric: medEntry.frequencyNumeric,
          frequency_per: medEntry.frequencyPer,
          timing: medEntry.timing,
          duration: medEntry.duration,
          instructions: medEntry.instructions,
          prescription_id: medEntry.prescriptionId,
          active: true,
        });
      if (error) console.error('Supabase medication save error:', error);
    } catch (err) {
      console.error('Supabase error:', err);
    }
  }

  return medEntry;
}

export async function generateSchedules(medicine, userId) {
  const schedules = [];
  const freqNumeric = medicine.frequencyNumeric || 1;
  const freqPer = medicine.frequencyPer || 'day';

  const now = new Date();
  const durationDays = medicine.duration
    ? parseInt(medicine.duration.match(/\d+/)?.[0]) || 30
    : 30;

  const doseTimes = [];
  if (medicine.timing) {
    const lowerTiming = medicine.timing.toLowerCase();
    if (
      lowerTiming.includes('morning') ||
      lowerTiming.includes('breakfast') ||
      lowerTiming.includes('empty stomach')
    ) {
      doseTimes.push('08:00');
    }
    if (
      (lowerTiming.includes('evening') || lowerTiming.includes('dinner')) &&
      freqNumeric >= 2
    ) {
      doseTimes.push('20:00');
    }
    if (
      lowerTiming.includes('noon') || lowerTiming.includes('afternoon') ||
      lowerTiming.includes('lunch')
    ) {
      if (!doseTimes.includes('08:00')) doseTimes.push('13:00');
    }
    if (lowerTiming.includes('bedtime') || lowerTiming.includes('night')) {
      doseTimes.push('22:00');
    }
  }

  while (doseTimes.length < freqNumeric) {
    const baseHour = 8;
    for (let i = doseTimes.length; i < freqNumeric; i++) {
      doseTimes.push(`${String(baseHour + (i * 12) / Math.max(1, freqNumeric - 1)).padStart(2, '0')}:00`);
    }
  }

  for (let day = 0; day < durationDays; day++) {
    for (const timeStr of doseTimes.slice(0, freqNumeric)) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const scheduledAt = new Date(now);
      scheduledAt.setDate(scheduledAt.getDate() + day);
      scheduledAt.setHours(hours, minutes, 0, 0);

      schedules.push({
        id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        userId,
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: medicine.dosage,
        scheduledAt: scheduledAt.toISOString(),
        taken: false,
        takenAt: null,
        skipped: false,
        status: 'pending',
      });
    }
  }

  const existing = getItem(SCHEDULES_KEY) || [];
  setItem(SCHEDULES_KEY, [...schedules, ...existing]);

  if (isSupabaseConfigured() && userId) {
    try {
      const { error } = await supabase
        .from('medication_schedules')
        .insert(
          schedules.map((s) => ({
            user_id: userId,
            medicine_id: s.medicineId,
            medicine_name: s.medicineName,
            dosage: s.dosage,
            scheduled_at: s.scheduledAt,
            status: 'pending',
          }))
        );
      if (error) console.error('Supabase schedule error:', error);
    } catch (err) {
      console.error('Supabase error:', err);
    }
  }

  return schedules;
}

export async function getTodaysSchedules(userId) {
  const all = getItem(SCHEDULES_KEY) || [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return all.filter((s) => s.scheduledAt?.startsWith(todayStr));
}

export async function markScheduleTaken(scheduleId, userId) {
  const all = getItem(SCHEDULES_KEY) || [];
  const idx = all.findIndex((s) => s.id === scheduleId);
  if (idx === -1) return false;

  all[idx].taken = true;
  all[idx].takenAt = new Date().toISOString();
  all[idx].status = 'taken';
  setItem(SCHEDULES_KEY, all);

  if (isSupabaseConfigured() && userId) {
    try {
      await supabase
        .from('medication_schedules')
        .update({ status: 'taken', taken_at: all[idx].takenAt })
        .eq('id', scheduleId);
    } catch {}
  }

  return true;
}

export async function deletePrescription(prescriptionId, userId) {
  const existing = getItem(STORAGE_KEY) || [];
  const filtered = existing.filter((p) => p.id !== prescriptionId);
  setItem(STORAGE_KEY, filtered);

  if (isSupabaseConfigured() && userId) {
    try {
      await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId);
    } catch {}
  }

  return true;
}

export async function getConfirmedMedications(userId) {
  const local = getItem(MEDICATIONS_KEY) || [];

  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('confirmed_at', { ascending: false });

      if (!error && data?.length > 0) {
        return data.map((m) => ({
          id: m.id,
          userId: m.user_id,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          frequencyNumeric: m.frequency_numeric,
          frequencyPer: m.frequency_per,
          timing: m.timing,
          duration: m.duration,
          instructions: m.instructions,
          prescriptionId: m.prescription_id,
          confirmedAt: m.confirmed_at,
          active: m.active,
          adherence: [],
        }));
      }
    } catch {}
  }

  return local;
}

export async function updateMedicine(medicineId, updates, userId) {
  const existing = getItem(MEDICATIONS_KEY) || [];
  const idx = existing.findIndex((m) => m.id === medicineId);
  if (idx === -1) return false;

  existing[idx] = { ...existing[idx], ...updates, updatedAt: new Date().toISOString() };
  setItem(MEDICATIONS_KEY, existing);

  if (isSupabaseConfigured() && userId) {
    try {
      await supabase
        .from('medications')
        .update({
          name: updates.name,
          dosage: updates.dosage,
          frequency: updates.frequency,
          timing: updates.timing,
          duration: updates.duration,
          instructions: updates.instructions,
        })
        .eq('id', medicineId);
    } catch {}
  }

  return true;
}

export async function deleteMedicine(medicineId, userId) {
  const existing = getItem(MEDICATIONS_KEY) || [];
  const filtered = existing.filter((m) => m.id !== medicineId);
  setItem(MEDICATIONS_KEY, filtered);

  if (isSupabaseConfigured() && userId) {
    try {
      await supabase
        .from('medications')
        .update({ active: false })
        .eq('id', medicineId);
    } catch {}
  }

  return true;
}

export async function getScheduleStats(userId) {
  const all = getItem(SCHEDULES_KEY) || [];
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = all.filter((s) => s.scheduledAt?.startsWith(today));

  const total = todaySchedules.length;
  const taken = todaySchedules.filter((s) => s.taken).length;
  const pending = total - taken;

  return { total, taken, pending, adherence: total > 0 ? Math.round((taken / total) * 100) : 100 };
}
