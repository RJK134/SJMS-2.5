import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, AlertTriangle, CheckCircle, AlertCircle, Loader2, Search, X } from 'lucide-react';

interface EngagementScore {
  studentId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  programme: string;
  programmeCode: string;
  score: number;
  rating: 'green' | 'amber' | 'red';
  totalRecords: number;
  presentCount: number;
}

interface EngagementResponse {
  success: boolean;
  summary: { total: number; green: number; amber: number; red: number };
  data: EngagementScore[];
  pagination: { limit: number; total: number; hasNext: boolean; nextCursor: string | null };
}

const ratingColour = {
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
};

const ratingDot = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const columns: Column<EngagementScore>[] = [
  {
    key: 'rating',
    label: '',
    render: r => <span className={`inline-block w-3 h-3 rounded-full ${ratingDot[r.rating]}`} />,
  },
  { key: 'studentNumber', label: 'Student No.', render: r => <span className="font-mono">{r.studentNumber}</span> },
  { key: 'name', label: 'Name', render: r => `${r.firstName} ${r.lastName}` },
  { key: 'programme', label: 'Programme', render: r => r.programmeCode !== '—' ? `${r.programmeCode} — ${r.programme}` : '—' },
  {
    key: 'score',
    label: 'Attendance',
    render: r => (
      <div className="flex items-center gap-2">
        <div className="w-32 bg-muted rounded-full h-2">
          <div className={`h-2 rounded-full ${ratingDot[r.rating]}`} style={{ width: `${r.score}%` }} />
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${ratingColour[r.rating]}`}>{r.score}%</span>
      </div>
    ),
  },
  { key: 'totalRecords', label: 'Records', render: r => `${r.presentCount}/${r.totalRecords}` },
];

export default function EngagementDashboard() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [riskLevel, setRiskLevel] = useState<string>('');

  const queryParams = new URLSearchParams({
    limit: '25',
    ...(cursor ? { cursor } : {}),
    ...(search ? { search } : {}),
    ...(riskLevel ? { riskLevel } : {}),
  });

  const { data, isLoading, isError } = useQuery<EngagementResponse>({
    queryKey: ['engagement-scores', cursor, search, riskLevel],
    queryFn: async () => {
      const { data } = await api.get(`/v1/reports/dashboard/engagement-scores?${queryParams}`);
      return data;
    },
  });

  const summary = data?.summary;
  const scores = data?.data ?? [];

  const handleSearch = () => {
    setSearch(searchInput);
    setCursor(null);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setRiskLevel('');
    setCursor(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Student Engagement" subtitle="Attendance-based engagement dashboard"
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Attendance' }, { label: 'Engagement' }]} />

      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : isError ? (
          <Card className="col-span-4">
            <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" /> Unable to load engagement data
            </CardContent>
          </Card>
        ) : (
          <>
            <StatCard label="Total Students" value={summary?.total ?? 0} icon={Users} />
            <StatCard label="Green (On Track)" value={summary?.green ?? 0} icon={CheckCircle} changeType="positive" />
            <StatCard label="Amber (At Risk)" value={summary?.amber ?? 0} changeType="neutral" change="Monitor" />
            <StatCard label="Red (Critical)" value={summary?.red ?? 0} icon={AlertTriangle} changeType="negative" />
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-1">Search</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Student name or number..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline" size="icon" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium block mb-1">Risk Level</label>
              <Select value={riskLevel} onValueChange={(v: string) => { setRiskLevel(v); setCursor(null); }}>
                <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green (On Track)</SelectItem>
                  <SelectItem value="amber">Amber (At Risk)</SelectItem>
                  <SelectItem value="red">Red (Critical)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(search || riskLevel) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-1" /> Clear</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <DataTable<EngagementScore>
        columns={columns}
        data={scores}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={setCursor}
        emptyMessage="No attendance data available to calculate engagement scores"
      />
    </div>
  );
}
