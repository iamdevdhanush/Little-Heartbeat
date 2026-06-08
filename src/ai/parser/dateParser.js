import { DATE_PATTERNS } from '../extraction/patterns.js';

function normalizeDate(raw) {
  if (!raw) return null;

  const cleaned = raw.replace(/(?:th|st|nd|rd)\b/gi, '').trim();

  const parts = cleaned.match(/(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{2,4})/);
  if (parts) {
    let [, month, day, year] = parts;
    year = year.length === 2 ? `20${year}` : year;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const textDate = cleaned.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/i);
  if (textDate) {
    const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
    const [, day, monthStr, year] = textDate;
    const month = months[monthStr.toLowerCase().substring(0, 3)];
    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }

  return null;
}

export function parseDates(text) {
  let appointmentDate = null;
  let prescriptionDate = null;

  for (const pattern of DATE_PATTERNS.appointment) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        appointmentDate = normalized;
        break;
      }
    }
    if (appointmentDate) break;
  }

  const allDates = [];
  for (const pattern of DATE_PATTERNS.prescriptionDate) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const normalized = normalizeDate(match[1] || match[0]);
      if (normalized) {
        allDates.push(normalized);
      }
    }
  }

  if (allDates.length > 0) {
    prescriptionDate = allDates[0];
    if (!appointmentDate && allDates.length > 1) {
      appointmentDate = allDates[allDates.length - 1];
    }
  }

  return {
    appointmentDate,
    prescriptionDate,
    allDates: [...new Set(allDates)],
  };
}
