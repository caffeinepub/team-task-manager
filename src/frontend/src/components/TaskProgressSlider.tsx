import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface TaskProgressSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function TaskProgressSlider({ value, onChange }: TaskProgressSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Progress</Label>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <Slider value={[value]} onValueChange={(values) => onChange(values[0])} max={100} step={5} className="w-full" />
    </div>
  );
}
