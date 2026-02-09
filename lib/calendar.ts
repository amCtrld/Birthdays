import { format } from 'date-fns';

export function generateICS(birthdays: { name: string; month: number; day: number; }[], ownerEmail: string) {
  const now = new Date();
  const prodId = 'BDQueue';
  const events = birthdays.map(b => {
    // Use current year for next occurrence
    const year = now.getMonth() + 1 > b.month || (now.getMonth() + 1 === b.month && now.getDate() > b.day)
      ? now.getFullYear() + 1 : now.getFullYear();
    const date = format(new Date(year, b.month - 1, b.day), 'yyyyMMdd');
    return [
      'BEGIN:VEVENT',
      `UID:${b.name.replace(/\s/g, '')}-${b.month}-${b.day}@bdqueue`,
      `DTSTAMP:${format(now, 'yyyyMMddTHHmmss')}Z`,
      `DTSTART;VALUE=DATE:${date}`,
      `SUMMARY:${b.name}'s Birthday`,
      'RRULE:FREQ=YEARLY',
      'END:VEVENT',
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${prodId}//EN`,
    'CALSCALE:GREGORIAN',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}
