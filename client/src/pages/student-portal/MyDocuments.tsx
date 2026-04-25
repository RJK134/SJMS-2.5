import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/shared/FileUpload';
import { useList, useCreate } from '@/hooks/useApi';
import { Loader2, FileText, Upload, Info } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  documentType: string;
  verificationStatus?: string;
  createdAt: string;
}

export default function MyDocuments() {
  const { data, isLoading } = useList<Document>('my-documents', '/v1/documents', { limit: 25, sort: 'createdAt', order: 'desc' });
  const createDoc = useCreate('my-documents', '/v1/documents');
  const [uploadMessage, setUploadMessage] = useState('');
  const docs = data?.data ?? [];

  const handleFilesSelected = (files: File[]) => {
    // Create metadata records for selected files (binary upload to MinIO is deferred)
    for (const file of files) {
      createDoc.mutate({
        title: file.name,
        documentType: 'OTHER',
        filePath: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
    }
    setUploadMessage(`${files.length} document record(s) created. Binary file storage is being configured — please also email documents to registry@futurehorizons.ac.uk for now.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Documents" breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'Documents' }]} />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload Document</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <FileUpload accept=".pdf,.jpg,.png,.doc,.docx" onFilesSelected={handleFilesSelected} />
          <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, PNG, DOC, DOCX. Maximum file size: 10MB.</p>
          {uploadMessage && <Alert><Info className="h-4 w-4" /><AlertDescription>{uploadMessage}</AlertDescription></Alert>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> My Documents ({docs.length})</CardTitle></CardHeader>
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
                    {doc.verificationStatus && <Badge variant={doc.verificationStatus === 'VERIFIED' ? 'default' : 'secondary'}>{doc.verificationStatus}</Badge>}
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
