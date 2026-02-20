import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TaskPriority } from '../backend';
import { X } from 'lucide-react';

export type SortOption = 'priority' | 'dueDate' | 'reminderDate';

interface TaskFilterControlsProps {
  selectedPriorities: TaskPriority[];
  onPrioritiesChange: (priorities: TaskPriority[]) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function TaskFilterControls({
  selectedPriorities,
  onPrioritiesChange,
  sortBy,
  onSortChange,
}: TaskFilterControlsProps) {
  const priorities = [
    { value: TaskPriority.low, label: 'Low' },
    { value: TaskPriority.medium, label: 'Medium' },
    { value: TaskPriority.high, label: 'High' },
    { value: TaskPriority.critical, label: 'Critical' },
  ];

  const togglePriority = (priority: TaskPriority) => {
    if (selectedPriorities.includes(priority)) {
      onPrioritiesChange(selectedPriorities.filter((p) => p !== priority));
    } else {
      onPrioritiesChange([...selectedPriorities, priority]);
    }
  };

  const clearFilters = () => {
    onPrioritiesChange([]);
  };

  const hasActiveFilters = selectedPriorities.length > 0;

  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-2">
          <Label>Filter by Priority</Label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => (
              <div key={priority.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority.value}`}
                  checked={selectedPriorities.includes(priority.value)}
                  onCheckedChange={() => togglePriority(priority.value)}
                />
                <label
                  htmlFor={`priority-${priority.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {priority.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-[200px] space-y-2">
          <Label htmlFor="sort-by">Sort By</Label>
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger id="sort-by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority (High to Low)</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="reminderDate">Reminder Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedPriorities.map((priority) => (
            <Badge key={priority} variant="secondary" className="gap-1">
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
              <button
                onClick={() => togglePriority(priority)}
                className="ml-1 hover:bg-background/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
