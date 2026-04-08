import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import { PoundSterling } from 'lucide-react';
export default function MyAccount() { return (<div className="space-y-6"><PageHeader title="My Financial Account" /><div className="grid grid-cols-3 gap-4"><StatCard label="Balance" value="£0.00" icon={PoundSterling} changeType="positive" change="Clear" /><StatCard label="Total Charges" value="£9,250.00" /><StatCard label="Total Payments" value="£9,250.00" /></div><Card><CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your financial transactions — tuition charges, payments, and credits.</p></CardContent></Card></div>); }
