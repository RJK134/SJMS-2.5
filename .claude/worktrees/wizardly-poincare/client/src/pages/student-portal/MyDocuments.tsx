import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/shared/FileUpload';
export default function MyDocuments() { return (<div className="space-y-6"><PageHeader title="My Documents" /><Card><CardHeader><CardTitle>Upload Document</CardTitle></CardHeader><CardContent><FileUpload accept=".pdf,.jpg,.png,.doc,.docx" onFilesSelected={() => {}} /></CardContent></Card><Card><CardHeader><CardTitle>My Documents</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your uploaded documents — transcripts, certificates, evidence, and correspondence.</p></CardContent></Card></div>); }
