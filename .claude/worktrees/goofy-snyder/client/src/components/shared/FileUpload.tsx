import { useState, useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export default function FileUpload({ accept, maxSizeMb = 10, multiple = false, onFilesSelected }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(f => f.size <= maxSizeMb * 1024 * 1024);
    const updated = multiple ? [...files, ...valid] : valid.slice(0, 1);
    setFiles(updated);
    onFilesSelected(updated);
  }, [files, maxSizeMb, multiple, onFilesSelected]);

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesSelected(updated);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colours ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Drag and drop files here, or{' '}
          <label className="text-primary cursor-pointer hover:underline">
            browse
            <input type="file" className="hidden" accept={accept} multiple={multiple} onChange={e => handleFiles(e.target.files)} />
          </label>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Maximum {maxSizeMb}MB per file</p>
      </div>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeFile(i)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
