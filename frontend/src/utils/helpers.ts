// Format a date string like "1990-01-15" to "15 Jan 1990"
export function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Mask sensitive fields like Aadhaar and PAN for display
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length !== 12) return aadhaar;
  return `XXXX XXXX ${aadhaar.slice(8)}`;
}

export function maskPAN(pan: string): string {
  if (!pan || pan.length !== 10) return pan;
  return `${pan.slice(0, 2)}XXXXX${pan.slice(7)}`;
}

// Returns a short human-readable label for a status value
export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
  };
  return map[status] || status;
}

// Truncate long strings for table display
export function truncate(str: string, max = 40): string {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '…' : str;
}
