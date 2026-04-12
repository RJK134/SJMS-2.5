import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function MyPaymentPlan() { return (<div className="space-y-6"><PageHeader title="My Payment Plan" /><Card><CardHeader><CardTitle>Instalment Schedule</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your payment plan schedule with instalment dates, amounts, and payment status.</p></CardContent></Card></div>); }
