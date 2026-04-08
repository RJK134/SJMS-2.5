import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import { Percent } from 'lucide-react';
export default function MyAttendance() { return (<div className="space-y-6"><PageHeader title="My Attendance" /><div className="grid grid-cols-3 gap-4"><StatCard label="Overall Attendance" value="92%" icon={Percent} changeType="positive" /><StatCard label="This Term" value="88%" /><StatCard label="Sessions Attended" value="45/49" /></div><Card><CardHeader><CardTitle>Attendance by Module</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your attendance record broken down by module and teaching week.</p></CardContent></Card></div>); }
