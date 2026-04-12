import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export default function FilterPanel({ filters, values, onChange, onClear }: FilterPanelProps) {
  const activeCount = Object.values(values).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        {filters.map(filter => (
          <Select key={filter.key} value={values[filter.key] || ''} onValueChange={v => onChange(filter.key, v)}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            Clear all <X className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
      {activeCount > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filters.map(filter => {
            const val = values[filter.key];
            if (!val) return null;
            const opt = filter.options.find(o => o.value === val);
            return (
              <Badge key={filter.key} variant="secondary" className="gap-1">
                {filter.label}: {opt?.label ?? val}
                <X className="h-3 w-3 cursor-pointer" onClick={() => onChange(filter.key, '')} />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
