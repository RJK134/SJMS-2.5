import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function MakePayment() { return (<div className="space-y-6"><PageHeader title="Payments" subtitle="View history and make payments" /><Card><CardHeader><CardTitle>Payment History</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Payment history and online payment portal for outstanding balances.</p></CardContent></Card></div>); }
