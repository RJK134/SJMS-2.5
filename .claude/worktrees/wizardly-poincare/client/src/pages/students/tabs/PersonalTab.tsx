import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Student } from '@/types/api';

export default function PersonalTab({ student }: { student: Student }) {
  const person = student.person;
  if (!person) return <p className="text-muted-foreground">No personal data available</p>;

  return (
    <div className="space-y-6">
      {/* Contacts */}
      <Card>
        <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>From</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {person.contacts?.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.contactType.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{c.value}</TableCell>
                  <TableCell>{c.isPrimary ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{c.isVerified ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(c.startDate).toLocaleDateString('en-GB')}</TableCell>
                </TableRow>
              )) ?? <TableRow><TableCell colSpan={5} className="text-muted-foreground">No contacts</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader><CardTitle>Addresses</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Postcode</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {person.addresses?.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.addressType.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{a.addressLine1}, {a.city}</TableCell>
                  <TableCell>{a.postcode ?? '—'}</TableCell>
                  <TableCell>{new Date(a.startDate).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{a.endDate ? new Date(a.endDate).toLocaleDateString('en-GB') : 'Current'}</TableCell>
                </TableRow>
              )) ?? <TableRow><TableCell colSpan={5} className="text-muted-foreground">No addresses</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Identifiers */}
      <Card>
        <CardHeader><CardTitle>Identifiers</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Issuer</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {person.identifiers?.map(id => (
                <TableRow key={id.id}>
                  <TableCell>{id.identifierType}</TableCell>
                  <TableCell className="font-mono">{id.value}</TableCell>
                  <TableCell>{id.issuer ?? '—'}</TableCell>
                </TableRow>
              )) ?? <TableRow><TableCell colSpan={3} className="text-muted-foreground">No identifiers</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Demographics */}
      {person.demographic && (
        <Card>
          <CardHeader><CardTitle>Demographics (GDPR Protected)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Ethnicity:</span> <span className="ml-2">{person.demographic.ethnicity?.replace(/_/g, ' ') ?? '—'}</span></div>
            <div><span className="text-muted-foreground">Religion:</span> <span className="ml-2">{person.demographic.religion?.replace(/_/g, ' ') ?? '—'}</span></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
