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
  programmeCode: z.string().min(1, 'Programme code is required'),
  title: z.string().min(1, 'Title is required'),
  level: z.enum(['LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6', 'LEVEL_7', 'LEVEL_8']),
  creditTotal: z.coerce.number().min(1),
  duration: z.coerce.number().min(1),
  modeOfStudy: z.enum(['FULL_TIME', 'PART_TIME', 'SANDWICH', 'DISTANCE', 'BLOCK_RELEASE']),
  awardingBody: z.string().min(1),
  departmentId: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function ProgrammeCreate() {
  const [, navigate] = useLocation();
  const create = useCreate('programmes', '/v1/programmes');
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { level: 'LEVEL_6', modeOfStudy: 'FULL_TIME', awardingBody: 'Future Horizons Education', creditTotal: 360, duration: 3 },
  });

  const onSubmit = async (data: FormData) => {
    try { await create.mutateAsync({ ...data, status: 'DRAFT' }); navigate('/admin/programmes'); } catch { /* handled */ }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="New Programme" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Programmes', href: '/admin/programmes' }, { label: 'New' }]} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Programme Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <FormField label="Programme Code" error={errors.programmeCode?.message} required><Input {...register('programmeCode')} placeholder="e.g. UG-CS-001" /></FormField>
            <FormField label="Title" error={errors.title?.message} required><Input {...register('title')} placeholder="e.g. BSc (Hons) Computer Science" /></FormField>
            <FormField label="Level" error={errors.level?.message} required>
              <Select defaultValue="LEVEL_6" onValueChange={v => setValue('level', v as FormData['level'])}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['3','4','5','6','7','8'].map(l => <SelectItem key={l} value={`LEVEL_${l}`}>Level {l}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Total Credits" error={errors.creditTotal?.message} required><Input type="number" {...register('creditTotal')} /></FormField>
            <FormField label="Duration (years)" error={errors.duration?.message} required><Input type="number" {...register('duration')} /></FormField>
            <FormField label="Mode of Study">
              <Select defaultValue="FULL_TIME" onValueChange={v => setValue('modeOfStudy', v as FormData['modeOfStudy'])}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem><SelectItem value="PART_TIME">Part-time</SelectItem>
                  <SelectItem value="SANDWICH">Sandwich</SelectItem><SelectItem value="DISTANCE">Distance</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Awarding Body" error={errors.awardingBody?.message} required><Input {...register('awardingBody')} /></FormField>
            <FormField label="Department ID" error={errors.departmentId?.message} required><Input {...register('departmentId')} placeholder="Department ID" /></FormField>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/programmes')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Create Programme</Button>
        </div>
      </form>
    </div>
  );
}
