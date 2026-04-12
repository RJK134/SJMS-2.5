// Phase 5C — Page Generator for remaining portal pages
import * as fs from 'fs';
import * as path from 'path';

const BASE = path.join(__dirname, '..', 'client', 'src', 'pages');

interface Page {
  dir: string;
  file: string;
  title: string;
  breadcrumbs: string; // JSON array string
  content: string; // TSX for the page body
  imports?: string;
}

function listPage(p: Page): string {
  return `${p.imports ?? ''}import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ${p.file.replace('.tsx', '')}() {
  return (
    <div className="space-y-6">
      <PageHeader title="${p.title}" breadcrumbs={${p.breadcrumbs}} />
      ${p.content}
    </div>
  );
}
`;
}

const PAGES: Page[] = [
  // ── STEP 1: Support (6) ──
  { dir: 'support', file: 'TicketList.tsx', title: 'Support Tickets', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Support'},{label:'Tickets'}]`,
    imports: `import { useState } from 'react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';
import { useLocation } from 'wouter';
`,
    content: `{(() => {
        const [, navigate] = useLocation();
        const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'createdAt', order: 'desc' });
        const { data, isLoading } = useList<any>('tickets', '/v1/support', params);
        const columns: Column<any>[] = [
          { key: 'subject', label: 'Subject', sortable: true },
          { key: 'category', label: 'Category' },
          { key: 'priority', label: 'Priority', render: (r: any) => <StatusBadge status={r.priority} /> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'createdAt', label: 'Created', render: (r: any) => new Date(r.createdAt).toLocaleDateString('en-GB') },
        ];
        return <DataTable columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
          onRowClick={(row: any) => navigate('/admin/support/tickets/' + row.id)} onPageChange={page => setParams(p => ({...p, page}))}
          searchPlaceholder="Search tickets..." onSearch={s => setParams(p => ({...p, search: s, page: 1}))}
          currentSort={params.sort} currentOrder={params.order} />;
      })()}` },
  { dir: 'support', file: 'TicketDetail.tsx', title: 'Ticket Detail', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Support',href:'/admin/support/tickets'},{label:'Ticket'}]`,
    imports: `import { useRoute } from 'wouter';
import StatusBadge from '@/components/shared/StatusBadge';
import { useDetail } from '@/hooks/useApi';
import { Loader2, MessageSquare } from 'lucide-react';
`,
    content: `{(() => {
        const [, params] = useRoute('/admin/support/tickets/:id');
        const { data, isLoading } = useDetail<any>('tickets', '/v1/support', params?.id);
        const t = data?.data;
        if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
        if (!t) return <p className="text-muted-foreground">Ticket not found</p>;
        return (<>
          <div className="flex items-center gap-3 mb-4"><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></div>
          <Card><CardHeader><CardTitle>{t.subject}</CardTitle></CardHeader><CardContent><p className="text-sm">{t.description}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Interactions</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Interaction timeline loads from the support API</p></CardContent></Card>
        </>);
      })()}` },
  { dir: 'support', file: 'FlagManagement.tsx', title: 'Student Flags', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Support'},{label:'Flags'}]`,
    content: `<Card><CardHeader><CardTitle>Active Student Flags</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage at-risk, Tier 4, debt, disciplinary, safeguarding, and wellbeing flags. Track resolution and escalation.</p></CardContent></Card>` },
  { dir: 'support', file: 'PersonalTutoring.tsx', title: 'Personal Tutoring', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Support'},{label:'Personal Tutoring'}]`,
    content: `<Card><CardHeader><CardTitle>Tutoring Records</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Personal tutor meeting records, action items, and review scheduling.</p></CardContent></Card>` },
  { dir: 'support', file: 'WellbeingRecords.tsx', title: 'Wellbeing', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Support'},{label:'Wellbeing'}]`,
    content: `<Card><CardHeader><CardTitle>Wellbeing Referrals</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Wellbeing referrals, risk assessments, action plans, and support coordination.</p></CardContent></Card>` },
  { dir: 'support', file: 'DisabilityRecords.tsx', title: 'Disability Support', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Support'},{label:'Disability'}]`,
    content: `<Card><CardHeader><CardTitle>Disability Records & Adjustments</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Disability registrations, reasonable adjustments, DSA funding, and review scheduling.</p></CardContent></Card>` },

  // ── STEP 2: UKVI Compliance (4) ──
  { dir: 'compliance', file: 'UKVIDashboard.tsx', title: 'UKVI Compliance', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Compliance'},{label:'UKVI'}]`,
    imports: `import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { Shield, AlertTriangle } from 'lucide-react';
`,
    content: `{(() => {
        const { data } = useList<any>('ukvi', '/v1/ukvi', { limit: 100 });
        const recs = data?.data ?? [];
        const compliant = recs.filter((r: any) => r.complianceStatus === 'COMPLIANT').length;
        const atRisk = recs.filter((r: any) => r.complianceStatus === 'AT_RISK').length;
        return (<>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Sponsored" value={recs.length} icon={Shield} />
            <StatCard label="Compliant" value={compliant} changeType="positive" />
            <StatCard label="At Risk" value={atRisk} icon={AlertTriangle} changeType="negative" />
          </div>
          <Card><CardHeader><CardTitle>UKVI Records</CardTitle></CardHeader><CardContent>
            {recs.slice(0, 15).map((r: any) => (
              <div key={r.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span>{r.student?.person ? r.student.person.firstName + ' ' + r.student.person.lastName : r.studentId}</span>
                <StatusBadge status={r.complianceStatus} />
              </div>
            ))}
            {recs.length === 0 && <p className="text-muted-foreground">No UKVI records</p>}
          </CardContent></Card>
        </>);
      })()}` },
  { dir: 'compliance', file: 'UKVIDetail.tsx', title: 'UKVI Student Detail', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Compliance',href:'/admin/compliance/ukvi'},{label:'Student'}]`,
    content: `<Card><CardHeader><CardTitle>UKVI Record</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Detailed UKVI record — CAS, visa, BRP, sponsorship dates, contact points, and Home Office reports.</p></CardContent></Card>` },
  { dir: 'compliance', file: 'ContactPoints.tsx', title: 'Contact Points', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Compliance'},{label:'Contact Points'}]`,
    content: `<Card><CardHeader><CardTitle>Contact Point Schedule</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Schedule and track mandatory UKVI contact points — registration, attendance, and meeting verification.</p></CardContent></Card>` },
  { dir: 'compliance', file: 'HomeOfficeReports.tsx', title: 'Home Office Reports', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Compliance'},{label:'Reports'}]`,
    content: `<Card><CardHeader><CardTitle>Home Office Reporting</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Generate and track reports to the Home Office — no-shows, withdrawals, suspensions, and non-compliance.</p></CardContent></Card>` },

  // ── STEP 3: EC/Appeals (3) ──
  { dir: 'ec-appeals', file: 'ECClaims.tsx', title: 'EC Claims', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'EC & Appeals'},{label:'EC Claims'}]`,
    content: `<Card><CardHeader><CardTitle>Extenuating Circumstances Claims</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage EC claim submissions, evidence review, panel decisions, and outcome notifications.</p></CardContent></Card>` },
  { dir: 'ec-appeals', file: 'Appeals.tsx', title: 'Appeals', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'EC & Appeals'},{label:'Appeals'}]`,
    content: `<Card><CardHeader><CardTitle>Academic Appeals</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Assessment, progression, award, and disciplinary appeals management. Track hearings and outcomes.</p></CardContent></Card>` },
  { dir: 'ec-appeals', file: 'AcademicMisconduct.tsx', title: 'Academic Misconduct', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'EC & Appeals'},{label:'Misconduct'}]`,
    content: `<Card><CardHeader><CardTitle>Plagiarism & Disciplinary Cases</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage academic misconduct investigations, hearings, penalties, and appeal tracking.</p></CardContent></Card>` },

  // ── STEP 4: Documents & Comms (5) ──
  { dir: 'documents', file: 'DocumentList.tsx', title: 'Documents', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Documents'}]`,
    content: `<Card><CardHeader><CardTitle>Document Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Upload, verify, and manage student documents — transcripts, certificates, evidence, letters, passports, and qualifications.</p></CardContent></Card>` },
  { dir: 'documents', file: 'LetterGeneration.tsx', title: 'Letter Generation', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Documents'},{label:'Letters'}]`,
    content: `<Card><CardHeader><CardTitle>Generate Letter</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Select a template, choose recipients, personalise variables, and generate letters for printing or email.</p></CardContent></Card>` },
  { dir: 'documents', file: 'CommunicationLog.tsx', title: 'Communication Log', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Communications'},{label:'Log'}]`,
    content: `<Card><CardHeader><CardTitle>Communication History</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">View all sent communications — emails, SMS, portal messages, and letters with delivery status tracking.</p></CardContent></Card>` },
  { dir: 'documents', file: 'TemplateManagement.tsx', title: 'Communication Templates', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Communications'},{label:'Templates'}]`,
    content: `<Card><CardHeader><CardTitle>Templates</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Create and manage email, SMS, portal, and letter templates with variable substitution.</p></CardContent></Card>` },
  { dir: 'documents', file: 'BulkCommunication.tsx', title: 'Bulk Communication', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Communications'},{label:'Bulk'}]`,
    content: `<Card><CardHeader><CardTitle>Bulk Messaging</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Send communications to cohorts, programmes, or custom recipient lists. Schedule sends and track delivery.</p></CardContent></Card>` },

  // ── STEP 5: Governance & Accommodation (5) ──
  { dir: 'governance', file: 'Committees.tsx', title: 'Committees', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Governance'},{label:'Committees'}]`,
    content: `<Card><CardHeader><CardTitle>Committee Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Senate, academic board, faculty boards, exam boards, and quality committees. Members, terms of reference, and meeting schedules.</p></CardContent></Card>` },
  { dir: 'governance', file: 'Meetings.tsx', title: 'Meetings', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Governance'},{label:'Meetings'}]`,
    content: `<Card><CardHeader><CardTitle>Meeting Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Schedule meetings, manage agendas, record minutes, and track action items.</p></CardContent></Card>` },
  { dir: 'accommodation', file: 'Blocks.tsx', title: 'Accommodation Blocks', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Accommodation'},{label:'Blocks'}]`,
    content: `<Card><CardHeader><CardTitle>Accommodation Blocks</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage accommodation blocks, facilities, room types, and contact information.</p></CardContent></Card>` },
  { dir: 'accommodation', file: 'Rooms.tsx', title: 'Accommodation Rooms', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Accommodation'},{label:'Rooms'}]`,
    content: `<Card><CardHeader><CardTitle>Room Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Individual room records — type, rent, contract length, availability, and occupancy status.</p></CardContent></Card>` },
  { dir: 'accommodation', file: 'Bookings.tsx', title: 'Accommodation Bookings', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Accommodation'},{label:'Bookings'}]`,
    content: `<Card><CardHeader><CardTitle>Booking Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Student accommodation bookings — applications, offers, acceptances, and vacancy management.</p></CardContent></Card>` },

  // ── STEP 6: Settings (6) ──
  { dir: 'settings', file: 'SystemSettings.tsx', title: 'System Settings', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'System'}]`,
    content: `<Card><CardHeader><CardTitle>System Configuration</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Institution-wide settings — default academic year, fee rates, retention policies, email configuration, and integration endpoints.</p></CardContent></Card>` },
  { dir: 'settings', file: 'UserManagement.tsx', title: 'User Management', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Users'}]`,
    content: `<Card><CardHeader><CardTitle>User Accounts</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage Keycloak user accounts — create, disable, reset passwords, assign roles, and link to Person records.</p></CardContent></Card>` },
  { dir: 'settings', file: 'RoleManagement.tsx', title: 'Role Management', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Roles'}]`,
    content: `<Card><CardHeader><CardTitle>Roles & Permissions</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">View and manage the 36-role hierarchy. Composite roles automatically inherit child permissions via Keycloak.</p></CardContent></Card>` },
  { dir: 'settings', file: 'AuditLogViewer.tsx', title: 'Audit Log', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Audit Log'}]`,
    imports: `import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/shared/DateRangePicker';
`,
    content: `{(() => {
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
      })()}` },
  { dir: 'settings', file: 'AcademicCalendar.tsx', title: 'Academic Calendar', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Calendar'}]`,
    content: `<Card><CardHeader><CardTitle>Academic Calendar 2025/26</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage term dates, exam periods, reading weeks, graduation ceremonies, bank holidays, and teaching weeks.</p></CardContent></Card>` },
  { dir: 'settings', file: 'AcademicYears.tsx', title: 'Academic Years', breadcrumbs: `[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Academic Years'}]`,
    content: `<Card><CardHeader><CardTitle>Academic Year Configuration</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure academic years — start/end dates, enrolment windows, and current year designation.</p></CardContent></Card>` },
];

let count = 0;
for (const p of PAGES) {
  const dir = path.join(BASE, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, p.file), listPage(p));
  count++;
}
console.log(`Generated ${count} admin pages`);
