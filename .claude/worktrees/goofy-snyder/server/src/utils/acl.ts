// Anti-Corruption Layer — maps between v1 (flat) and v2 (nested) response shapes
// Supports content negotiation: Accept: application/vnd.fhe.v1+json vs v2

import type { Request } from 'express';

type AnyRecord = Record<string, unknown>;

// ─── Version Detection ──────────────────────────────────────────────────────

export function getApiVersion(req: Request): 1 | 2 {
  const accept = req.get('accept') || '';
  if (accept.includes('application/vnd.fhe.v1+json')) return 1;
  return 2; // default to v2
}

// ─── Student Response Mapping ───────────────────────────────────────────────

export function mapStudentResponse(student: AnyRecord, version: 1 | 2): AnyRecord {
  if (version === 1) {
    // v1: flatten Person + PersonName + PersonAddress into student
    const person = (student.person || {}) as AnyRecord;
    const contacts = (person.contacts || []) as AnyRecord[];
    const addresses = (person.addresses || []) as AnyRecord[];
    const primaryEmail = contacts.find((c: AnyRecord) => c.contactType === 'EMAIL' && c.isPrimary);
    const homeAddress = addresses.find((a: AnyRecord) => a.addressType === 'HOME' && a.isPrimary);

    return {
      id: student.id,
      studentNumber: student.studentNumber,
      title: person.title,
      firstName: person.firstName,
      lastName: person.lastName,
      dateOfBirth: person.dateOfBirth,
      gender: person.gender,
      email: primaryEmail?.value ?? null,
      address: homeAddress ? {
        line1: homeAddress.addressLine1,
        line2: homeAddress.addressLine2,
        city: homeAddress.city,
        county: homeAddress.county,
        postcode: homeAddress.postcode,
        country: homeAddress.countryCode,
      } : null,
      feeStatus: student.feeStatus,
      entryRoute: student.entryRoute,
      originalEntryDate: student.originalEntryDate,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  // v2: return full nested structure as-is
  return student;
}

// ─── Programme Response Mapping ─────────────────────────────────────────────

export function mapProgrammeResponse(programme: AnyRecord, version: 1 | 2): AnyRecord {
  if (version === 1) {
    const dept = (programme.department || {}) as AnyRecord;
    const school = (dept.school || {}) as AnyRecord;
    const faculty = (school.faculty || {}) as AnyRecord;

    return {
      id: programme.id,
      programmeCode: programme.programmeCode,
      title: programme.title,
      level: programme.level,
      creditTotal: programme.creditTotal,
      duration: programme.duration,
      modeOfStudy: programme.modeOfStudy,
      status: programme.status,
      departmentName: dept.title ?? null,
      schoolName: school.title ?? null,
      facultyName: faculty.title ?? null,
      createdAt: programme.createdAt,
      updatedAt: programme.updatedAt,
    };
  }

  return programme;
}

// ─── Generic List Mapping ───────────────────────────────────────────────────

export function mapListResponse(
  items: AnyRecord[],
  mapper: (item: AnyRecord, version: 1 | 2) => AnyRecord,
  version: 1 | 2,
): AnyRecord[] {
  return items.map(item => mapper(item, version));
}
