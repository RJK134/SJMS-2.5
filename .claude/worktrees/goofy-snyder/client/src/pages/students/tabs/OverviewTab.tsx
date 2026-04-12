import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import type { Student } from '@/types/api';

export default function OverviewTab({ student }: { student: Student }) {
  const person = student.person;
  const primaryEmail = person?.contacts?.find(c => c.contactType === 'EMAIL' && c.isPrimary);
  const homeAddress = person?.addresses?.find(a => a.addressType === 'HOME' && a.isPrimary);

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Key Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Row label="Full Name" value={person ? `${person.title ?? ''} ${person.firstName} ${person.lastName}`.trim() : '—'} />
          <Row label="Date of Birth" value={person?.dateOfBirth ? new Date(person.dateOfBirth).toLocaleDateString('en-GB') : '—'} />
          <Row label="Gender" value={person?.gender?.replace(/_/g, ' ') ?? '—'} />
          <Row label="Email" value={primaryEmail?.value ?? '—'} />
          <Row label="Entry Route" value={student.entryRoute.replace(/_/g, ' ')} />
          <Row label="Original Entry Date" value={new Date(student.originalEntryDate).toLocaleDateString('en-GB')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Current Enrolments</CardTitle></CardHeader>
        <CardContent>
          {student.enrolments && student.enrolments.length > 0 ? (
            <div className="space-y-3">
              {student.enrolments.map(enr => (
                <div key={enr.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{enr.programme?.title ?? enr.programmeId}</p>
                    <p className="text-sm text-muted-foreground">Year {enr.yearOfStudy} · {enr.academicYear}</p>
                  </div>
                  <StatusBadge status={enr.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No current enrolments</p>
          )}
        </CardContent>
      </Card>

      {homeAddress && (
        <Card>
          <CardHeader><CardTitle>Home Address</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{homeAddress.addressLine1}</p>
            {homeAddress.addressLine2 && <p>{homeAddress.addressLine2}</p>}
            <p>{homeAddress.city}{homeAddress.county ? `, ${homeAddress.county}` : ''}</p>
            <p>{homeAddress.postcode}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
