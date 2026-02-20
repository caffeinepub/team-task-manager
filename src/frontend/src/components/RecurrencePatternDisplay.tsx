import { RecurringTask } from '../backend';
import { formatDate } from '../utils/taskUtils';
import { formatRecurrencePattern } from '../utils/recurrenceUtils';
import { Repeat } from 'lucide-react';

interface RecurrencePatternDisplayProps {
  recurring: RecurringTask;
}

export default function RecurrencePatternDisplay({ recurring }: RecurrencePatternDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Repeat className="w-4 h-4" />
      <span>{formatRecurrencePattern(recurring.frequency)}</span>
      <span>•</span>
      <span>Next: {formatDate(recurring.nextOccurrence)}</span>
    </div>
  );
}
