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
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const schema = z.object({
  firstName: z.string().min(1, 'Forename is required'),
  lastName: z.string().min(1, 'Surname is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  feeStatus: z.enum(['HOME', 'OVERSEAS', 'EU_TRANSITIONAL', 'ISLANDS', 'CHANNEL_ISLANDS']),
  entryRoute: z.enum(['UCAS', 'DIRECT', 'CLEARING', 'INTERNATIONAL', 'INTERNAL_TRANSFER']),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

export default function StudentCreate() {
  const [, navigate] = useLocation();
  const createStudent = useCreate('students', '/v1/students');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormInput, undefined, FormData>({
    resolver: zodResolver(schema),
    defaultValues: { feeStatus: 'HOME', entryRoute: 'UCAS' },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      await createStudent.mutateAsync({
        personId: 'pending',
        feeStatus: data.feeStatus,
        entryRoute: data.entryRoute,
        originalEntryDate: new Date().toISOString(),
      });
      navigate('/admin/students');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create student. Please try again.';
      setSubmitError(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="New Student"
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Students', href: '/admin/students' }, { label: 'New Student' }]}
      />

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <FormField label="Forename" error={errors.firstName?.message} required>
              <Input {...register('firstName')} placeholder="Enter forename" />
            </FormField>
            <FormField label="Surname" error={errors.lastName?.message} required>
              <Input {...register('lastName')} placeholder="Enter surname" />
            </FormField>
            <FormField label="Date of Birth" error={errors.dateOfBirth?.message} required>
              <Input type="date" {...register('dateOfBirth')} />
            </FormField>
            <FormField label="Gender">
              <Select onValueChange={(v: string) => setValue('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Enrolment Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <FormField label="Fee Status" error={errors.feeStatus?.message} required>
              <Select defaultValue="HOME" onValueChange={(v: string) => setValue('feeStatus', v as FormData['feeStatus'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOME">Home</SelectItem>
                  <SelectItem value="OVERSEAS">Overseas</SelectItem>
                  <SelectItem value="EU_TRANSITIONAL">EU Transitional</SelectItem>
                  <SelectItem value="ISLANDS">Islands</SelectItem>
                  <SelectItem value="CHANNEL_ISLANDS">Channel Islands</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Entry Route" error={errors.entryRoute?.message} required>
              <Select defaultValue="UCAS" onValueChange={(v: string) => setValue('entryRoute', v as FormData['entryRoute'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UCAS">UCAS</SelectItem>
                  <SelectItem value="DIRECT">Direct</SelectItem>
                  <SelectItem value="CLEARING">Clearing</SelectItem>
                  <SelectItem value="INTERNATIONAL">International</SelectItem>
                  <SelectItem value="INTERNAL_TRANSFER">Internal Transfer</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/students')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Create Student
          </Button>
        </div>
      </form>
    </div>
  );
}
