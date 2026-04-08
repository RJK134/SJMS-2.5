import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/shared/DateRangePicker';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuditLogViewer() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Audit Log'}]} />
      {(() => {
        const [entityType, setEntityType] = useState('');
        const [action, setAction] = useState('');
        const [fromDate, setFromDate] = useState('');
        const [toDate, setToDate] = useState('');
        return (<>
          <Card><CardHeader><CardTitle>Filters</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="text-sm font-medium block mb-1">Entity Type</label>
                <Select value={entityType} onValueChange={setEntityType}><SelectTrigger><SelectValue placeholder="All entities" /></SelectTrigger>
                  <SelectContent><SelectItem value="Student">Student</SelectItem><SelectItem value="Enrolment">Enrolment</SelectItem><SelectItem value="Programme">Programme</SelectItem><SelectItem value="Module">Module</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-medium block mb-1">Action</label>
                <Select value={action} onValueChange={setAction}><SelectTrigger><SelectValue placeholder="All actions" /></SelectTrigger>
                  <SelectContent><SelectItem value="CREATE">Create</SelectItem><SelectItem value="UPDATE">Update</SelectItem><SelectItem value="DELETE">Delete</SelectItem></SelectContent></Select></div>
              <div className="col-span-2"><DateRangePicker fromDate={fromDate} toDate={toDate} onFromChange={setFromDate} onToChange={setToDate} label="Date Range" /></div>
            </div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Audit log entries showing entity, action, user, IP address, timestamp, and before/after data snapshots.</p></CardContent></Card>
        </>);
      })()}
    </div>
  );
}
