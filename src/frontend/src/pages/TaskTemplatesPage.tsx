import { useState } from 'react';
import { useGetAllTaskTemplates } from '../hooks/useGetAllTaskTemplates';
import { useCreateTaskTemplate } from '../hooks/useCreateTaskTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TaskPriority } from '../backend';
import { getPriorityBadgeColor, getPriorityLabel } from '../utils/taskUtils';
import { FileText, Plus } from 'lucide-react';

export default function TaskTemplatesPage() {
  const { data: templates = [], isLoading } = useGetAllTaskTemplates();
  const { mutate: createTemplate, isPending } = useCreateTaskTemplate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.medium);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      createTemplate(
        {
          id,
          title: title.trim(),
          description: description.trim(),
          priority,
          customFields: [],
        },
        {
          onSuccess: () => {
            setTitle('');
            setDescription('');
            setPriority(TaskPriority.medium);
            setOpen(false);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[oklch(0.65_0.19_85)]" />
          <h1 className="text-3xl font-bold">Task Templates</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-title">Template Title</Label>
                <Input
                  id="template-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter template title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter template description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                  <SelectTrigger id="template-priority">
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
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !title.trim()}>
                  {isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No templates yet. Create your first template to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <Badge className={getPriorityBadgeColor(template.priority)}>
                    {getPriorityLabel(template.priority)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {template.description && <p className="text-sm text-muted-foreground">{template.description}</p>}
                <Button variant="outline" className="w-full" size="sm">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
