import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet } from 'lucide-react';

export default function CustomReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Custom Report Builder" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Reports' }, { label: 'Custom' }]}>
        <div className="flex gap-2">
          <Button variant="outline"><FileSpreadsheet className="h-4 w-4 mr-2" /> Export CSV</Button>
          <Button><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader><CardTitle>Build Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Entity</label>
              <Select><SelectTrigger><SelectValue placeholder="Select entity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="enrolments">Enrolments</SelectItem>
                  <SelectItem value="modules">Modules</SelectItem>
                  <SelectItem value="programmes">Programmes</SelectItem>
                  <SelectItem value="marks">Marks</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Academic Year</label>
              <Select><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025/26">2025/26</SelectItem>
                  <SelectItem value="2024/25">2024/25</SelectItem>
                  <SelectItem value="2023/24">2023/24</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Format</label>
              <Select defaultValue="csv"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="csv">CSV</SelectItem><SelectItem value="pdf">PDF</SelectItem><SelectItem value="xlsx">Excel</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Select an entity, filters, and fields to generate a custom report. Reports can be exported in CSV, PDF, or Excel format.</p>
        </CardContent>
      </Card>
    </div>
  );
}
