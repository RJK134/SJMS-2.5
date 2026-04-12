import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
export default function CourseSearch() { return (<div className="space-y-6"><PageHeader title="Course Search" subtitle="Browse available programmes" /><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search programmes..." className="pl-9" /></div><Card><CardHeader><CardTitle>Available Programmes</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Browse undergraduate and postgraduate programmes at Future Horizons Education.</p></CardContent></Card></div>); }
