import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Task, Comment } from '../backend';
import { useAddTaskComment } from '../hooks/useAddTaskComment';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { formatDate } from '../utils/taskUtils';
import { MessageSquare, Send } from 'lucide-react';

interface TaskCommentsSectionProps {
  task: Task;
}

export default function TaskCommentsSection({ task }: TaskCommentsSectionProps) {
  const [comment, setComment] = useState('');
  const { mutate: addComment, isPending } = useAddTaskComment();
  const { data: users = [] } = useGetAllUsers();

  const getUserName = (principal: string) => {
    const user = users.find((u) => u.principal === principal);
    return user?.name || 'Unknown User';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addComment(
        { taskId: task.id, content: comment.trim() },
        {
          onSuccess: () => {
            setComment('');
          },
        }
      );
    }
  };

  const sortedComments = [...task.comments].sort(
    (a: Comment, b: Comment) => Number(a.timestamp) - Number(b.timestamp)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Comments ({task.comments.length})</h3>
      </div>

      <div className="space-y-3">
        {sortedComments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          sortedComments.map((comment: Comment, index: number) => (
            <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{getUserName(comment.author.toString())}</span>
                <span className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          disabled={isPending}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !comment.trim()} size="sm">
            <Send className="w-4 h-4 mr-2" />
            {isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
