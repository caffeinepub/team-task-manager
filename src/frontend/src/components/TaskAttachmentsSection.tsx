import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '../backend';
import { ExternalBlob } from '../backend';
import { useAddTaskAttachment } from '../hooks/useAddTaskAttachment';
import { formatFileSize } from '../utils/fileUtils';
import { Paperclip, Download, Upload } from 'lucide-react';

interface TaskAttachmentsSectionProps {
  task: Task;
}

export default function TaskAttachmentsSection({ task }: TaskAttachmentsSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: addAttachment } = useAddTaskAttachment();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      addAttachment(
        { taskId: task.id, attachment: blob },
        {
          onSuccess: () => {
            setUploading(false);
            setUploadProgress(0);
            e.target.value = '';
          },
          onError: () => {
            setUploading(false);
            setUploadProgress(0);
          },
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Attachments ({task.attachments.length})</h3>
        </div>
        <div className="relative">
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <Button asChild size="sm" disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? `Uploading ${uploadProgress}%` : 'Upload File'}
            </label>
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>

      {task.attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attachments yet.</p>
      ) : (
        <div className="space-y-2">
          {task.attachments.map((attachment, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Attachment {index + 1}</p>
                  <p className="text-xs text-muted-foreground">Click download to view</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const url = attachment.getDirectURL();
                  window.open(url, '_blank');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
