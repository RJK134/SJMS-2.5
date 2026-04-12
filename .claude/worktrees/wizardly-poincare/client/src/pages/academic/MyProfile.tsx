import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
export default function MyProfile() {
  const { user } = useAuth();
  return (<div className="space-y-6"><PageHeader title="My Profile" /><Card><CardHeader><CardTitle>Staff Details</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="text-muted-foreground">Name:</span> <span className="ml-2">{user?.firstName} {user?.lastName}</span></p><p><span className="text-muted-foreground">Email:</span> <span className="ml-2">{user?.email}</span></p></CardContent></Card></div>);
}
