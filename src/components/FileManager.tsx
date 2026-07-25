import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Video,
  Film,
  Archive,
  FileCode,
  Download,
  Calendar,
  Check,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { LibraryFile, Lecture, FileType, ItemStatus } from '../types';
import { api } from '../services/api';
import { FileUploader } from './FileUploader';

interface FileManagerProps {
  onDataChange: () => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ onDataChange }) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState<string>('');

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<LibraryFile | null>(null);

  // Form State
  const [lectureId, setLectureId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<FileType>('PDF');
  const [fileUrl, setFileUrl] = useState('');
  const [sizeBytes, setSizeBytes] = useState<number>(0);
  const [status, setStatus] = useState<ItemStatus>('active');
  const [order, setOrder] = useState<number>(1);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lecsList, filesList] = await Promise.all([
        api.getLectures(),
        api.getFiles(selectedLectureId || undefined),
      ]);
      setLectures(lecsList);
      setFiles(filesList);
      if (!selectedLectureId && lecsList.length > 0) {
        setSelectedLectureId(lecsList[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الملفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLectureId]);

  const openCreateModal = () => {
    setEditingFile(null);
    setLectureId(selectedLectureId || (lectures[0]?.id ?? ''));
    setFileName('');
    setFileType('PDF');
    setFileUrl('');
    setSizeBytes(0);
    setStatus('active');
    setOrder(files.length + 1);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fileItem: LibraryFile) => {
    setEditingFile(fileItem);
    setLectureId(fileItem.lectureId);
    setFileName(fileItem.name);
    setFileType(fileItem.type);
    setFileUrl(fileItem.url);
    setSizeBytes(fileItem.sizeBytes);
    setStatus(fileItem.status || 'active');
    setOrder(fileItem.order || 1);
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (fileItem: LibraryFile) => {
    const newStatus: ItemStatus = fileItem.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateFile(fileItem.id, { status: newStatus });
      loadData();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل تغيير الحالة');
    }
  };

  const handleFileUploadComplete = (uploadData: {
    url: string;
    name: string;
    sizeBytes: number;
    type: FileType;
  }) => {
    setFileUrl(uploadData.url);
    if (!fileName) {
      setFileName(uploadData.name);
    }
    setSizeBytes(uploadData.sizeBytes);
    setFileType(uploadData.type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureId || !fileName.trim() || !fileUrl.trim()) {
      setError('يرجى تحديد المحاضرة، واسم الملف، ورابط/ملف المرفق');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingFile) {
        await api.updateFile(editingFile.id, {
          lectureId,
          name: fileName.trim(),
          type: fileType,
          url: fileUrl.trim(),
          sizeBytes,
          status,
          order: Number(order) || 1,
        });
      } else {
        await api.createFile({
          lectureId,
          name: fileName.trim(),
          type: fileType,
          url: fileUrl.trim(),
          sizeBytes,
          status,
          order: Number(order) || 1,
        });
      }

      setIsModalOpen(false);
      loadData();
      onDataChange();
    } catch (err: any) {
      setError(err.message || 'فشل حفظ الملف');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fileItem: LibraryFile) => {
    if (!confirm(`هل أنت تأكد من نقل الملف "${fileItem.name}" للأرشيف (Soft Delete)؟`)) {
      return;
    }

    try {
      await api.deleteFile(fileItem.id);
      loadData();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل حذف الملف');
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return 'غير محدد';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileIcon = (type: FileType) => {
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

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const getLectureName = (id: string) => lectures.find((l) => l.id === id)?.title || 'محاضرة غير معروفة';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>إدارة الملفات والمرفقات التعليمية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">رفع وإدارة ملحقات المحاضرات (PDF, فيديو, ZIP, Word) إلى Firebase Storage</p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={lectures.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>رفع ملف جديد</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1">
            <Video className="w-4 h-4 text-emerald-600" />
            <span>المحاضرة:</span>
          </label>
          <select
            value={selectedLectureId}
            onChange={(e) => setSelectedLectureId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="">جميع المحاضرات</option>
            {lectures.map((l) => (
              <option key={l.id} value={l.id}>
                #{l.lectureOrder} - {l.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الملف..."
            className="w-full pr-9 pl-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
          >
            <option value="ALL">جميع الأنواع</option>
            <option value="PDF">مستندات PDF</option>
            <option value="Video">فيديوهات Video</option>
            <option value="ZIP">ملفات مضغوطة ZIP</option>
            <option value="DOCX">مستندات Word DOCX</option>
          </select>

          <button
            onClick={loadData}
            title="تحديث القائمة"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">جاري تحميل الملفات...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">لا توجد ملفات مرفوعة لهذه المحاضرة</p>
          <p className="text-xs text-slate-500 mt-1">اضغط على زر "رفع ملف جديد" لبدء رفع الملفات مع شريط التقدم لـ Firebase Storage</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((fileItem) => (
            <div
              key={fileItem.id}
              className={`bg-white border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                fileItem.status === 'inactive' ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-1.5">
                      {renderFileIcon(fileItem.type)}
                      <span className="text-xs font-black text-slate-700">{fileItem.type}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(fileItem)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                        fileItem.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {fileItem.status === 'active' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{fileItem.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={fileItem.downloadUrl || fileItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="فتح/تحميل الملف"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => openEditModal(fileItem)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="تعديل الملف"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fileItem)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف مؤقت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 dir-ltr text-right">
                  {fileItem.name}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-500 font-medium my-3 bg-slate-50 p-2 rounded-lg">
                  <span>الحجم: {formatSize(fileItem.sizeBytes)}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(fileItem.uploadedAt || fileItem.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 truncate font-mono">
                  ترتيب: #{fileItem.order || 1} | المحاضرة: {getLectureName(fileItem.lectureId)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href={fileItem.downloadUrl || fileItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل / معاينة الملف</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload/Edit File Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              {editingFile ? 'تعديل بيانات الملف' : 'رفع ملف جديد إلى Firebase Storage'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تتبع لمحاضرة *</label>
                <select
                  value={lectureId}
                  onChange={(e) => setLectureId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                >
                  <option value="">اختر المحاضرة...</option>
                  {lectures.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.lectureOrder} - {l.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Uploader with progress bar */}
              {!editingFile && (
                <FileUploader onFileUploadComplete={handleFileUploadComplete} />
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الملف *</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="مثال: ملخص المحاضرة الأولى.pdf"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الملف *</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as FileType)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="PDF">PDF (مستند)</option>
                    <option value="Video">Video (فيديو)</option>
                    <option value="ZIP">ZIP (أرشيف)</option>
                    <option value="DOCX">DOCX (وورد)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الظهور</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط/مسار المرفق في Storage *</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://firebasestorage.googleapis.com/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dir-ltr text-right"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || !fileUrl}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? (
                    'جاري الحفظ...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingFile ? 'حفظ التعديلات' : 'حفظ الملف'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
