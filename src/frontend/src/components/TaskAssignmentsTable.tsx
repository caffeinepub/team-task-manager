import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus } from '../backend';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useGetUserName } from '../hooks/useGetUserName';
import { formatDate, getPriorityBadgeColor, getPriorityLabel, isOverdue } from '../utils/taskUtils';
import { CheckCircle, Clock, Circle, ArrowUpDown } from 'lucide-react';

interface TaskAssignmentsTableProps {
  tasks: Task[];
}

type SortField = 'employee' | 'project' | 'dueDate' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

function TaskRow({ task }: { task: Task }) {
  const { data: projects = [] } = useGetAllProjects();
  const { data: employeeName } = useGetUserName(task.assignedEmployee);
  
  const project = projects.find((p) => p.id === task.projectId);
  const overdue = isOverdue(task);
  const isCompleted = task.status === TaskStatus.completed;

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="w-4 h-4 text-[oklch(0.65_0.15_145)]" />;
    if (task.status === TaskStatus.inProgress) return <Clock className="w-4 h-4 text-[oklch(0.65_0.19_85)]" />;
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-[oklch(0.65_0.15_145)] hover:bg-[oklch(0.60_0.15_145)]">Completed</Badge>;
    }
    if (task.status === TaskStatus.inProgress) {
      return <Badge className="bg-[oklch(0.65_0.19_85)] hover:bg-[oklch(0.60_0.19_85)]">In Progress</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <TableRow className={isCompleted ? 'opacity-60' : ''}>
      <TableCell>
        <Link
          to="/task/$taskId"
          params={{ taskId: task.id }}
          className="hover:text-[oklch(0.65_0.19_85)] transition-colors font-medium flex items-center gap-2"
        >
          {getStatusIcon()}
          <span className={isCompleted ? 'line-through' : ''}>{task.title}</span>
        </Link>
      </TableCell>
      <TableCell>{employeeName || 'Loading...'}</TableCell>
      <TableCell>{project?.name || 'Unknown'}</TableCell>
      <TableCell>
        <span className={overdue && !isCompleted ? 'text-destructive font-medium' : ''}>
          {formatDate(task.dueDate)}
        </span>
      </TableCell>
      <TableCell>
        <Badge className={getPriorityBadgeColor(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
      </TableCell>
      <TableCell>{getStatusBadge()}</TableCell>
    </TableRow>
  );
}

export default function TaskAssignmentsTable({ tasks }: TaskAssignmentsTableProps) {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'employee':
          comparison = a.assignedEmployee.toString().localeCompare(b.assignedEmployee.toString());
          break;
        case 'project':
          comparison = a.projectId.localeCompare(b.projectId);
          break;
        case 'dueDate':
          comparison = Number(a.dueDate) - Number(b.dueDate);
          break;
        case 'priority': {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'status': {
          const statusOrder = { pending: 0, inProgress: 1, completed: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, sortField, sortDirection]);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Task Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('employee')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    Task Title
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('employee')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    Assigned Employee
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('project')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    Project
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('dueDate')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    Due Date
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    Priority
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
