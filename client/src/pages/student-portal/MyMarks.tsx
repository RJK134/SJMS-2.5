import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function MyMarks() { return (<div className="space-y-6"><PageHeader title="My Marks & Results" subtitle="All marks by academic year" /><Card><CardHeader><CardTitle>Results Summary</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your marks by year with classification calculator — first, upper second, lower second, third.</p></CardContent></Card></div>); }
