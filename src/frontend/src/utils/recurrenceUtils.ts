import { RecurrenceFrequency } from '../backend';

export function formatRecurrencePattern(frequency: RecurrenceFrequency): string {
  if ('daily' in frequency) {
    const interval = Number(frequency.daily);
    return interval === 1 ? 'Daily' : `Every ${interval} days`;
  }
  if ('weekly' in frequency) {
    const interval = Number(frequency.weekly);
    return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
  }
  if ('monthly' in frequency) {
    const interval = Number(frequency.monthly);
    return interval === 1 ? 'Monthly' : `Every ${interval} months`;
  }
  return 'Unknown';
}
