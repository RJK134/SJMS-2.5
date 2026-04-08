import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  fromDate?: string;
  toDate?: string;
  onFromChange: (date: string) => void;
  onToChange: (date: string) => void;
  label?: string;
}

export default function DateRangePicker({ fromDate, toDate, onFromChange, onToChange, label = 'Date Range' }: DateRangePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="date" value={fromDate ?? ''} onChange={e => onFromChange(e.target.value)} className="pl-9" />
        </div>
        <span className="text-muted-foreground">to</span>
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="date" value={toDate ?? ''} onChange={e => onToChange(e.target.value)} className="pl-9" />
        </div>
      </div>
    </div>
  );
}
