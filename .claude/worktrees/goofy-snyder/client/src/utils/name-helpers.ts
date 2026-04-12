/**
 * Resolves the current legal name from an effective-dated PersonName array.
 * Falls back to flat Person fields (firstName/lastName) if PersonName is not populated.
 *
 * Format: "Surname, Forename" (UK registry convention)
 */
export function getCurrentLegalName(person: any): string {
  // Effective-dated PersonName (preferred source)
  const legalName = person?.names?.find(
    (n: any) => n.nameType === 'LEGAL' && !n.endDate
  ) ?? person?.personNames?.find(
    (n: any) => n.nameType === 'LEGAL' && !n.endDate
  );

  if (legalName) {
    const surname = legalName.lastName ?? legalName.surname ?? '';
    const forename = legalName.firstName ?? legalName.forename ?? '';
    return `${surname}, ${forename}`.trim().replace(/^, |, $/g, '');
  }

  // Flat Person fields fallback
  const surname = person?.lastName ?? person?.surname ?? '';
  const forename = person?.firstName ?? person?.forename ?? '';
  if (surname || forename) return `${surname}, ${forename}`.trim().replace(/^, |, $/g, '');

  return '\u2014';
}

/**
 * Returns a display-friendly name: "Forename Surname"
 * Prefers PREFERRED name, falls back to LEGAL, then flat fields.
 */
export function getDisplayName(person: any): string {
  const names = person?.names ?? person?.personNames ?? [];

  const preferred = names.find(
    (n: any) => n.nameType === 'PREFERRED' && !n.endDate
  );
  if (preferred) {
    return `${preferred.firstName ?? preferred.forename ?? ''} ${preferred.lastName ?? preferred.surname ?? ''}`.trim();
  }

  const legal = names.find(
    (n: any) => n.nameType === 'LEGAL' && !n.endDate
  );
  if (legal) {
    return `${legal.firstName ?? legal.forename ?? ''} ${legal.lastName ?? legal.surname ?? ''}`.trim();
  }

  // Flat Person fields
  const first = person?.firstName ?? person?.forename ?? '';
  const last = person?.lastName ?? person?.surname ?? '';
  if (first || last) return `${first} ${last}`.trim();

  return 'Unknown';
}
