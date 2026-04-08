import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import FormField from '@/components/shared/FormField';
import { useCreate } from '@/hooks/useApi';
import { Loader2, Save } from 'lucide-react';

const schema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  programmeId: z.string().min(1, 'Programme is required'),
  academicYear: z.string().regex(/^\d{4}\/\d{2}$/, 'Format: YYYY/YY'),
  yearOfStudy: z.coerce.number().min(1).max(6),
  modeOfStudy: z.enum(['FULL_TIME', 'PART_TIME', 'SANDWICH', 'DISTANCE', 'BLOCK_RELEASE']),
  startDate: z.string().min(1, 'Start date is required'),
  feeStatus: z.enum(['HOME', 'OVERSEAS', 'EU_TRANSITIONAL', 'ISLANDS', 'CHANNEL_ISLANDS']),
});
type FormData = z.infer<typeof schema>;

export default function EnrolmentCreate() {
  const [, navigate] = useLocation();
  const create = useCreate('enrolments', '/v1/enrolments');
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { academicYear: '2025/26', yearOfStudy: 1, modeOfStudy: 'FULL_TIME', feeStatus: 'HOME' },
  });

  const onSubmit = async (data: FormData) => {
    try { await create.mutateAsync({ ...data, startDate: new Date(data.startDate).toISOString() }); navigate('/admin/enrolments'); } catch { /* handled */ }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="New Enrolment" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Enrolments', href: '/admin/enrolments' }, { label: 'New' }]} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Enrolment Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <FormField label="Student ID" error={errors.studentId?.message} required><Input {...register('studentId')} placeholder="Student ID" /></FormField>
            <FormField label="Programme ID" error={errors.programmeId?.message} required><Input {...register('programmeId')} placeholder="Programme ID" /></FormField>
            <FormField label="Academic Year" error={errors.academicYear?.message} required><Input {...register('academicYear')} placeholder="2025/26" /></FormField>
            <FormField label="Year of Study" error={errors.yearOfStudy?.message} required><Input type="number" {...register('yearOfStudy')} /></FormField>
            <FormField label="Start Date" error={errors.startDate?.message} required><Input type="date" {...register('startDate')} /></FormField>
            <FormField label="Mode of Study">
              <Select defaultValue="FULL_TIME" onValueChange={v => setValue('modeOfStudy', v as FormData['modeOfStudy'])}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="FULL_TIME">Full-time</SelectItem><SelectItem value="PART_TIME">Part-time</SelectItem><SelectItem value="SANDWICH">Sandwich</SelectItem></SelectContent>
              </Select>
            </FormField>
            <FormField label="Fee Status">
              <Select defaultValue="HOME" onValueChange={v => setValue('feeStatus', v as FormData['feeStatus'])}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="HOME">Home</SelectItem><SelectItem value="OVERSEAS">Overseas</SelectItem><SelectItem value="EU_TRANSITIONAL">EU Transitional</SelectItem></SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/enrolments')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Create Enrolment</Button>
        </div>
      </form>
    </div>
  );
}
