import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'صورة المعاينة',
}) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالحة (PNG, JPG, WEBP)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.uploadImage(file);
      onChange(res.url);
    } catch (err: any) {
      setError(err.message || 'فشل رفع الصورة');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-1 text-xs bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-1 rounded transition-colors ${
              mode === 'upload' ? 'bg-white text-emerald-700 font-semibold shadow-xs' : 'text-slate-600'
            }`}
          >
            رفع صورة
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-1 rounded transition-colors ${
              mode === 'url' ? 'bg-white text-emerald-700 font-semibold shadow-xs' : 'text-slate-600'
            }`}
          >
            رابط مباشر
          </button>
        </div>
      </div>

      {/* Image Preview Box */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-44 flex items-center justify-center">
          <img
            src={value}
            alt="معاينة الصورة"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 shadow-md"
            >
              <X className="w-4 h-4" />
              حذف الصورة
            </button>
          </div>
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-xs">
            تم الاختيار (معاينة)
          </div>
        </div>
      ) : mode === 'upload' ? (
        <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-emerald-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-medium">جاري رفع الصورة...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">اضغط لرفع صورة من جهازك</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP حتى 50 ميجابايت</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </>
          )}
        </label>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            تطبيق
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  );
};
