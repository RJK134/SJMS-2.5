import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function StudentMyModules() { return (<div className="space-y-6"><PageHeader title="My Modules" subtitle="Modules registered this academic year" /><Card><CardHeader><CardTitle>2025/26 Modules</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your registered modules with assessment deadlines, marks, and feedback.</p></CardContent></Card></div>); }
