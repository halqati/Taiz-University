import React, { useState } from 'react';
import { Upload, FileText, Film, Archive, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { FileType } from '../types';

interface FileUploaderProps {
  onFileUploadComplete: (data: {
    url: string;
    name: string;
    sizeBytes: number;
    type: FileType;
  }) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    sizeBytes: number;
    type: FileType;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadedFile(null);

    try {
      const result = await api.uploadFileWithProgress(file, (percent) => {
        setProgress(percent);
      });

      setUploadedFile(result);
      onFileUploadComplete(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const renderIcon = (type: FileType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'Video':
        return <Film className="w-5 h-5 text-blue-500" />;
      case 'ZIP':
        return <Archive className="w-5 h-5 text-amber-500" />;
      case 'DOCX':
        return <FileCode className="w-5 h-5 text-indigo-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">رفع الملف</label>

      {/* Upload Zone */}
      <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
          <Upload className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold text-slate-800">اختر ملفاً من جهازك للرفع</span>
        <span className="text-xs text-slate-500 mt-1">يدعم صيغ (PDF, MP4/Video, ZIP, DOCX) حتى 100MB</span>
        <input
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600 animate-bounce" />
              جاري رفع الملف إلى السيرفر...
            </span>
            <span className="text-emerald-700 font-bold">{progress}%</span>
          </div>
          {/* Progress track */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Success Card */}
      {uploadedFile && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-emerald-100 shadow-2xs">
              {renderIcon(uploadedFile.type)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dir-ltr text-right line-clamp-1">
                {uploadedFile.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  {uploadedFile.type}
                </span>
                <span>{formatSize(uploadedFile.sizeBytes)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-medium text-xs bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            تم الرفع
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
