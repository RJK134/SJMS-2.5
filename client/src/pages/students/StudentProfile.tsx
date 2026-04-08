import { useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useDetail } from '@/hooks/useApi';
import type { Student } from '@/types/api';
import OverviewTab from './tabs/OverviewTab';
import PersonalTab from './tabs/PersonalTab';
import AcademicTab from './tabs/AcademicTab';
import FinanceTab from './tabs/FinanceTab';
import AttendanceTab from './tabs/AttendanceTab';
import SupportTab from './tabs/SupportTab';
import DocumentsTab from './tabs/DocumentsTab';
import ComplianceTab from './tabs/ComplianceTab';
import AuditTab from './tabs/AuditTab';

export default function StudentProfile() {
  const [, params] = useRoute('/admin/students/:id');
  const id = params?.id;
  const { data, isLoading } = useDetail<Student>('students', '/v1/students', id);
  const student = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-12 text-muted-foreground">Student not found</div>;
  }

  const person = student.person;
  const fullName = person ? `${person.title ?? ''} ${person.firstName} ${person.lastName}`.trim() : student.studentNumber;

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        subtitle={student.studentNumber}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Students', href: '/admin/students' },
          { label: fullName },
        ]}
      >
        <StatusBadge status={student.feeStatus} />
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Student Number" value={student.studentNumber} />
        <StatCard label="Fee Status" value={student.feeStatus.replace(/_/g, ' ')} />
        <StatCard label="Entry Route" value={student.entryRoute.replace(/_/g, ' ')} />
        <StatCard label="Entry Date" value={new Date(student.originalEntryDate).toLocaleDateString('en-GB')} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-9 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab student={student} /></TabsContent>
        <TabsContent value="personal"><PersonalTab student={student} /></TabsContent>
        <TabsContent value="academic"><AcademicTab student={student} /></TabsContent>
        <TabsContent value="finance"><FinanceTab student={student} /></TabsContent>
        <TabsContent value="attendance"><AttendanceTab student={student} /></TabsContent>
        <TabsContent value="support"><SupportTab student={student} /></TabsContent>
        <TabsContent value="documents"><DocumentsTab student={student} /></TabsContent>
        <TabsContent value="compliance"><ComplianceTab student={student} /></TabsContent>
        <TabsContent value="audit"><AuditTab student={student} /></TabsContent>
      </Tabs>
    </div>
  );
}
