export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function calculateTotalMinutes(startTime: bigint, endTime: bigint): number {
  const start = Number(startTime) / 1_000_000;
  const end = Number(endTime) / 1_000_000;
  const diffMs = end - start;
  return Math.floor(diffMs / (1000 * 60));
}
