import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Task, TimeEntry } from '../backend';
import { useStartTaskTimer } from '../hooks/useStartTaskTimer';
import { useStopTaskTimer } from '../hooks/useStopTaskTimer';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Play, Square, Clock } from 'lucide-react';

interface TimeTrackingControlsProps {
  task: Task;
}

export default function TimeTrackingControls({ task }: TimeTrackingControlsProps) {
  const { identity } = useInternetIdentity();
  const { mutate: startTimer, isPending: isStarting } = useStartTaskTimer();
  const { mutate: stopTimer, isPending: isStopping } = useStopTaskTimer();
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const activeEntry = task.timeEntries.find(
    (entry: TimeEntry) => entry.user.toString() === currentUserPrincipal && !entry.endTime
  );

  useEffect(() => {
    if (!activeEntry) {
      setElapsedTime(0);
      return;
    }

    const startTime = Number(activeEntry.startTime) / 1_000_000;
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startTimer(task.id);
  };

  const handleStop = () => {
    stopTimer(task.id);
  };

  return (
    <div className="flex items-center gap-3">
      {activeEntry ? (
        <>
          <div className="flex items-center gap-2 text-sm font-medium text-[oklch(0.65_0.19_85)]">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{formatElapsedTime(elapsedTime)}</span>
          </div>
          <Button onClick={handleStop} disabled={isStopping} variant="outline" size="sm">
            <Square className="w-4 h-4 mr-2" />
            {isStopping ? 'Stopping...' : 'Stop Timer'}
          </Button>
        </>
      ) : (
        <Button onClick={handleStart} disabled={isStarting} variant="outline" size="sm">
          <Play className="w-4 h-4 mr-2" />
          {isStarting ? 'Starting...' : 'Start Timer'}
        </Button>
      )}
    </div>
  );
}
