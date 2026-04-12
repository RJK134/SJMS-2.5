import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function MyOffers() { return (<div className="space-y-6"><PageHeader title="My Offers" subtitle="Conditional and unconditional offers" /><Card><CardHeader><CardTitle>Offers</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">View offer conditions, accept or decline offers, and track condition status.</p></CardContent></Card></div>); }
