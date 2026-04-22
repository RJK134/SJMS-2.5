import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageHeader from '@/components/shared/PageHeader';
import FormField from '@/components/shared/FormField';
import { useCreate } from '@/hooks/useApi';
import { Loader2, Send } from 'lucide-react';

const schema = z.object({ subject: z.string().min(1, 'Subject is required'), category: z.enum(['ACADEMIC','FINANCIAL','WELLBEING','ACCOMMODATION','IT','OTHER']), description: z.string().min(10, 'Please provide more detail') });
type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

export default function RaiseTicket() {
  const [, navigate] = useLocation();
  const createTicket = useCreate('my-tickets', '/v1/support');
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormInput, undefined, FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    createTicket.mutate(
      { ...data, priority: 'NORMAL' },
      { onSuccess: () => navigate('/student/support/tickets') },
    );
  };
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Raise Support Ticket" breadcrumbs={[{ label: 'My Tickets', href: '/student/support/tickets' }, { label: 'New' }]} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card><CardHeader><CardTitle>Ticket Details</CardTitle></CardHeader><CardContent className="space-y-4">
          <FormField label="Subject" error={errors.subject?.message} required><Input {...register('subject')} placeholder="Brief description of your query" /></FormField>
          <FormField label="Category" error={errors.category?.message} required>
            <Select onValueChange={(v: string) => setValue('category', v as FormData['category'])}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent><SelectItem value="ACADEMIC">Academic</SelectItem><SelectItem value="FINANCIAL">Financial</SelectItem><SelectItem value="WELLBEING">Wellbeing</SelectItem><SelectItem value="ACCOMMODATION">Accommodation</SelectItem><SelectItem value="IT">IT</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent></Select>
          </FormField>
          <FormField label="Description" error={errors.description?.message} required><textarea {...register('description')} className="w-full min-h-[120px] rounded-md border px-3 py-2 text-sm" placeholder="Please describe your query in detail..." /></FormField>
          {createTicket.isError && <Alert variant="destructive"><AlertDescription>Failed to submit ticket. Please try again.</AlertDescription></Alert>}
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => navigate('/student/support/tickets')}>Cancel</Button><Button type="submit" disabled={isSubmitting || createTicket.isPending}>{(isSubmitting || createTicket.isPending) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} Submit Ticket</Button></div>
        </CardContent></Card>
      </form>
    </div>
  );
}
