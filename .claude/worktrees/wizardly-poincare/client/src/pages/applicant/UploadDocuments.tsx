import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/shared/FileUpload';
export default function UploadDocuments() { return (<div className="space-y-6"><PageHeader title="Upload Documents" subtitle="Supporting documents for your application" /><Card><CardHeader><CardTitle>Upload</CardTitle></CardHeader><CardContent><FileUpload accept=".pdf,.jpg,.png,.doc,.docx" onFilesSelected={() => {}} /></CardContent></Card></div>); }
