import { parseMedicines } from './medicineParser.js';
import { parseDoctorInfo } from './doctorParser.js';
import { parseDates } from './dateParser.js';

export function parsePrescriptionText(text) {
  if (!text || text.trim().length === 0) {
    return { medicines: [], doctor: {}, dates: {}, rawText: text };
  }

  const medicines = parseMedicines(text);
  const doctor = parseDoctorInfo(text);
  const dates = parseDates(text);

  return {
    medicines,
    doctor,
    dates,
    rawText: text,
    medicineCount: medicines.length,
  };
}

export { parseMedicines } from './medicineParser.js';
export { parseDoctorInfo } from './doctorParser.js';
export { parseDates } from './dateParser.js';
