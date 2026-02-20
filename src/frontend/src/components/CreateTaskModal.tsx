import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateTask } from '../hooks/useCreateTask';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { TaskPriority, RecurringTask } from '../backend';
import { Plus } from 'lucide-react';

export default function CreateTaskModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.medium);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');

  const { mutate: createTask, isPending } = useCreateTask();
  const { data: projects = [] } = useGetAllProjects();
  const { data: users = [] } = useGetAllUsers();
  const { data: allTasks = [] } = useGetAllTasks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && assignedEmployee && projectId && dueDate && priority) {
      const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dueDateTimestamp = BigInt(new Date(dueDate).getTime() * 1_000_000);
      const reminderDateTimestamp = reminderDate ? BigInt(new Date(reminderDate).getTime() * 1_000_000) : BigInt(0);

      let recurring: RecurringTask | null = null;
      if (isRecurring) {
        const interval = parseInt(recurrenceInterval) || 1;
        const nextOccurrence = BigInt((new Date(dueDate).getTime() + 86400000 * interval) * 1_000_000);
        recurring = {
          frequency:
            recurrenceType === 'daily'
              ? { __kind__: 'daily' as const, daily: BigInt(interval) }
              : recurrenceType === 'weekly'
              ? { __kind__: 'weekly' as const, weekly: BigInt(interval) }
              : { __kind__: 'monthly' as const, monthly: BigInt(interval) },
          nextOccurrence,
        };
      }

      createTask(
        {
          id,
          title: title.trim(),
          description: description.trim(),
          assignedEmployee,
          projectId,
          dueDate: dueDateTimestamp,
          reminderDate: reminderDateTimestamp,
          priority,
          dependencies,
          recurring,
          customFields: [],
        },
        {
          onSuccess: () => {
            setTitle('');
            setDescription('');
            setAssignedEmployee('');
            setProjectId('');
            setDueDate('');
            setReminderDate('');
            setPriority(TaskPriority.medium);
            setDependencies([]);
            setIsRecurring(false);
            setRecurrenceInterval('1');
            setOpen(false);
          },
        }
      );
    }
  };

  const toggleDependency = (taskId: string) => {
    setDependencies((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger id="task-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assign To</Label>
            <Select value={assignedEmployee} onValueChange={setAssignedEmployee} required>
              <SelectTrigger id="task-assignee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.principal} value={user.principal}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-priority">
              Priority <span className="text-destructive">*</span>
            </Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)} required>
              <SelectTrigger id="task-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskPriority.low}>Low</SelectItem>
                <SelectItem value={TaskPriority.medium}>Medium</SelectItem>
                <SelectItem value={TaskPriority.high}>High</SelectItem>
                <SelectItem value={TaskPriority.critical}>Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due-date">Due Date</Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-reminder-date">Reminder Date (Optional)</Label>
            <Input
              id="task-reminder-date"
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Dependencies (Optional)</Label>
            <div className="max-h-32 overflow-y-auto space-y-2 border rounded-lg p-2">
              {allTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks available</p>
              ) : (
                allTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dep-${task.id}`}
                      checked={dependencies.includes(task.id)}
                      onCheckedChange={() => toggleDependency(task.id)}
                    />
                    <label htmlFor={`dep-${task.id}`} className="text-sm cursor-pointer">
                      {task.title}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(!!checked)} />
              <label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                Make this a recurring task
              </label>
            </div>
            {isRecurring && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <Select value={recurrenceType} onValueChange={(value: any) => setRecurrenceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                  placeholder="Interval"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim() || !assignedEmployee || !projectId || !dueDate || !priority}
            >
              {isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
