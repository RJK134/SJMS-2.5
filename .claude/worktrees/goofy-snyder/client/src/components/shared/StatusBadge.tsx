import { Badge } from '@/components/ui/badge';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default' }> = {
  // Enrolment statuses
  ENROLLED: { label: 'Enrolled', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  INTERRUPTED: { label: 'Interrupted', variant: 'warning' },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'secondary' },
  TRANSFERRED: { label: 'Transferred', variant: 'secondary' },
  // Module registration
  REGISTERED: { label: 'Registered', variant: 'success' },
  DEFERRED: { label: 'Deferred', variant: 'warning' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  // Programme statuses
  DRAFT: { label: 'Draft', variant: 'secondary' },
  APPROVED: { label: 'Approved', variant: 'success' },
  RUNNING: { label: 'Running', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'secondary' },
  // Application statuses
  SUBMITTED: { label: 'Submitted', variant: 'default' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning' },
  CONDITIONAL_OFFER: { label: 'Conditional Offer', variant: 'success' },
  UNCONDITIONAL_OFFER: { label: 'Unconditional Offer', variant: 'success' },
  FIRM: { label: 'Firm', variant: 'success' },
  DECLINED: { label: 'Declined', variant: 'secondary' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  // Assessment
  PENDING: { label: 'Pending', variant: 'secondary' },
  MARKED: { label: 'Marked', variant: 'default' },
  MODERATED: { label: 'Moderated', variant: 'default' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  REFERRED: { label: 'Referred', variant: 'warning' },
  // Fee status
  HOME: { label: 'Home', variant: 'default' },
  OVERSEAS: { label: 'Overseas', variant: 'warning' },
  EU_TRANSITIONAL: { label: 'EU Transitional', variant: 'secondary' },
  // Generic
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' },
};

const VARIANT_CLASSES: Record<string, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  destructive: 'bg-red-100 text-red-800 border-red-200',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  default: 'bg-blue-100 text-blue-800 border-blue-200',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const mapped = STATUS_MAP[status] ?? { label: status.replace(/_/g, ' '), variant: 'secondary' as const };
  return (
    <Badge variant="outline" className={`${VARIANT_CLASSES[mapped.variant]} font-medium text-xs ${className}`}>
      {mapped.label}
    </Badge>
  );
}
