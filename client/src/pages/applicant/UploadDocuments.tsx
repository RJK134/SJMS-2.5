import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Upload, Info } from 'lucide-react';
import { useList } from '@/hooks/useApi';
import FileUpload from '@/components/shared/FileUpload';

interface Document {
  id: string;
  title: string;
  documentType: string;
  status: string;
  createdAt: string;
}

export default function UploadDocuments() {
  const [uploadMessage, setUploadMessage] = useState('');
  const { data, isLoading } = useList<Document>('my-documents', '/v1/documents', { limit: 20 });
  const docs = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Upload Documents" subtitle="Supporting documents for your application" />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload New Document</CardTitle></CardHeader>
        <CardContent>
          <FileUpload accept=".pdf,.jpg,.png,.doc,.docx" onFilesSelected={() => setUploadMessage('Document upload is being configured. Please email your documents to admissions@futurehorizons.ac.uk in the meantime.')} />
          <p className="text-xs text-muted-foreground mt-2">Accepted formats: PDF, JPG, PNG, DOC, DOCX. Maximum file size: 10MB.</p>
          {uploadMessage && <Alert className="mt-3"><Info className="h-4 w-4" /><AlertDescription>{uploadMessage}</AlertDescription></Alert>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Your Documents ({docs.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.documentType.replace(/_/g, ' ')}</Badge>
                    <Badge variant={doc.status === 'VERIFIED' ? 'default' : 'secondary'}>{doc.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
