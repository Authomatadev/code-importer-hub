/**
 * Chilean RUT (Rol Único Tributario) validation utilities
 * Uses the modulo 11 algorithm for verification digit calculation
 */

/**
 * Clean RUT string - removes dots and dashes, converts to uppercase
 */
export function cleanRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim();
}

/**
 * Format RUT with dots and dash (XX.XXX.XXX-X)
 */
export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return clean;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  // Add dots every 3 digits from right to left
  let formatted = '';
  for (let i = body.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formatted = '.' + formatted;
    }
    formatted = body[i] + formatted;
  }
  
  return `${formatted}-${dv}`;
}

/**
 * Calculate the verification digit using modulo 11 algorithm
 */
export function calculateVerificationDigit(rutBody: string): string {
  const cleanBody = rutBody.replace(/\D/g, '');
  
  let sum = 0;
  let multiplier = 2;
  
  // Iterate from right to left
  for (let i = cleanBody.length - 1; i >= 0; i--) {
    sum += parseInt(cleanBody[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const result = 11 - remainder;
  
  if (result === 11) return '0';
  if (result === 10) return 'K';
  return result.toString();
}

/**
 * Validate Chilean RUT using modulo 11 algorithm
 * @param rut - RUT string in any format (with or without dots/dash)
 * @returns true if valid, false otherwise
 */
export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut);
  
  // Must have at least 2 characters (1 digit + 1 verification digit)
  if (clean.length < 2) return false;
  
  // Check format: digits followed by digit or K
  if (!/^\d+[0-9K]$/.test(clean)) return false;
  
  const body = clean.slice(0, -1);
  const providedDv = clean.slice(-1);
  
  // Body must be numeric
  if (!/^\d+$/.test(body)) return false;
  
  // Calculate expected verification digit
  const expectedDv = calculateVerificationDigit(body);
  
  return providedDv === expectedDv;
}

/**
 * Check if RUT has a valid format (not necessarily valid verification digit)
 */
export function hasValidRutFormat(rut: string): boolean {
  const clean = cleanRut(rut);
  return /^\d{1,8}[0-9K]$/.test(clean);
}
