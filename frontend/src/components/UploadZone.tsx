import { Upload, FileText } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface UploadZoneProps {
  onUpload?: (file: File) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      // Allow multiple file types
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'text/plain'
      ];
      
      const validFile = files.find((file) => 
        allowedTypes.includes(file.type) || 
        ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.txt']
          .some(ext => file.name.toLowerCase().endsWith(ext))
      );

      if (validFile && onUpload) {
        onUpload(validFile);
      }
    },
    [onUpload],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0] && onUpload) {
        onUpload(files[0]);
      }
    },
    [onUpload],
  );

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-12 text-center transition-all animate-scale-in",
        isDragging && "border-primary bg-primary/10 scale-105",
        "hover:border-primary/50 hover:bg-primary/10",
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-4">
          <Upload className="h-8 w-8 text-primary animate-float" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            {t("landing.uploadPrompt")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("documents.dragDrop")}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{t("landing.uploadHint")}</span>
          </div>
        </div>
        <input
          type="file"
          accept=".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.txt"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
