import { DOCTOR_PATTERNS } from '../extraction/patterns.js';

export function parseDoctorInfo(text) {
  const result = { name: null, clinic: null, license: null };

  for (const pattern of DOCTOR_PATTERNS.name) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const name = (match[1] || '').trim();
      if (name && name.length > 2) {
        result.name = name;
        break;
      }
    }
    if (result.name) break;
  }

  for (const pattern of DOCTOR_PATTERNS.clinic) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const clinic = (match[1] || match[0] || '').trim();
      if (clinic && clinic.length > 3) {
        result.clinic = clinic;
        break;
      }
    }
    if (result.clinic) break;
  }

  for (const pattern of DOCTOR_PATTERNS.license) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const license = (match[1] || '').trim();
      if (license && license.length > 2) {
        result.license = license;
        break;
      }
    }
    if (result.license) break;
  }

  return result;
}
