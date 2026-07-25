import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Edit2,
  Trash2,
  BookOpenCheck,
  Calendar,
  Check,
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Lecture, Course, ItemStatus } from '../types';
import { api } from '../services/api';
import { ImageUploader } from './ImageUploader';

interface LectureManagerProps {
  onDataChange: () => void;
}

export const LectureManager: React.FC<LectureManagerProps> = ({ onDataChange }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  // Form State
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [lectureOrder, setLectureOrder] = useState<number>(1);
  const [status, setStatus] = useState<ItemStatus>('active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [crsList, lecsList] = await Promise.all([
        api.getCourses(),
        api.getLectures(selectedCourseId || undefined),
      ]);
      setCourses(crsList);
      setLectures(lecsList);
      if (!selectedCourseId && crsList.length > 0) {
        setSelectedCourseId(crsList[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المحاضرات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId]);

  const openCreateModal = () => {
    setEditingLecture(null);
    setCourseId(selectedCourseId || (courses[0]?.id ?? ''));
    setTitle('');
    setThumbnail('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80');
    setDescription('');
    setLectureOrder(lectures.length + 1);
    setStatus('active');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setCourseId(lecture.courseId);
    setTitle(lecture.title);
    setThumbnail(lecture.thumbnail);
    setDescription(lecture.description || '');
    setLectureOrder(lecture.lectureOrder);
    setStatus(lecture.status || 'active');
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (lecture: Lecture) => {
    const newStatus: ItemStatus = lecture.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateLecture(lecture.id, { status: newStatus });
      loadData();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل تغيير الحالة');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title.trim()) {
      setError('يرجى اختيار المادة وكتابة اسم المحاضرة');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingLecture) {
        await api.updateLecture(editingLecture.id, {
          courseId,
          title: title.trim(),
          thumbnail,
          description: description.trim(),
          lectureOrder: Number(lectureOrder),
          order: Number(lectureOrder),
          status,
        });
      } else {
        await api.createLecture({
          courseId,
          title: title.trim(),
          thumbnail,
          description: description.trim(),
          lectureOrder: Number(lectureOrder),
          status,
        });
      }

      setIsModalOpen(false);
      loadData();
      onDataChange();
    } catch (err: any) {
      setError(err.message || 'فشل عملية الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lecture: Lecture) => {
    if (!confirm(`هل أنت تأكد من نقل محاضرة "${lecture.title}" للأرشيف (Soft Delete)؟`)) {
      return;
    }

    try {
      await api.deleteLecture(lecture.id);
      loadData();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل حذف المحاضرة');
    }
  };

  const filteredLectures = lectures.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.name || 'مادة غير معروفة';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            <span>إدارة المحاضرات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">إضافة محاضرة غير محدودة داخل المادة التعليمية ورفع الصور لـ Firebase Storage</p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={courses.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة محاضرة جديدة</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
            <BookOpenCheck className="w-4 h-4 text-emerald-600" />
            <span>اختر المادة الدراسية:</span>
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden max-w-sm w-full"
          >
            <option value="">جميع المواد</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.code ? `(${c.code})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث باسم المحاضرة..."
              className="w-full pr-9 pl-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <button
            onClick={loadData}
            title="تحديث البيانات"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lectures List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">جاري تحميل المحاضرات...</p>
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">لا توجد محاضرات مسجلة لهذه المادة</p>
          <p className="text-xs text-slate-500 mt-1">اضغط على "إضافة محاضرة جديدة" لإنشاء المحاضرة الأولى</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLectures.map((lecture) => (
            <div
              key={lecture.id}
              className={`bg-white border rounded-2xl overflow-hidden transition-all flex flex-col justify-between group ${
                lecture.status === 'inactive' ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-lg'
              }`}
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={lecture.thumbnail}
                    alt={lecture.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="bg-slate-900/80 text-emerald-400 font-extrabold text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      رقم #{lecture.lectureOrder}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(lecture)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 backdrop-blur-xs ${
                        lecture.status === 'active'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      }`}
                    >
                      {lecture.status === 'active' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{lecture.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    </button>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(lecture)}
                      className="p-1.5 bg-white/90 text-slate-700 hover:text-emerald-700 rounded-lg shadow-md transition-colors"
                      title="تعديل المحاضرة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lecture)}
                      className="p-1.5 bg-white/90 text-slate-700 hover:text-red-600 rounded-lg shadow-md transition-colors"
                      title="حذف مؤقت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 line-clamp-2">
                    {lecture.title}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {lecture.description || 'لا يوجد وصف مضاف لهذه المحاضرة.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{getCourseName(lecture.courseId)}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(lecture.createdAt).toLocaleDateString('ar-EG')}
                </span>
                <span>تحديث: {lecture.updatedAt ? new Date(lecture.updatedAt).toLocaleDateString('ar-EG') : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Lecture Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              {editingLecture ? 'تعديل المحاضرة' : 'إضافة محاضرة تعليمية جديدة'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تتبع لمادة دراسية *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                >
                  <option value="">اختر المادة...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم/عنوان المحاضرة *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: المحاضرة الأولى: مقدمة مفاهيمية"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ترتيب المحاضرة</label>
                  <input
                    type="number"
                    min={1}
                    value={lectureOrder}
                    onChange={(e) => setLectureOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الظهور</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail Image Uploader */}
              <ImageUploader
                value={thumbnail}
                onChange={(newUrl) => setThumbnail(newUrl)}
                label="الصورة المصغرة للمحاضرة (رفع لـ Firebase Storage) *"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف المحاضرة</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملخص محاور وموضوعات هذه المحاضرة..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
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
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? (
                    'جاري الحفظ...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingLecture ? 'حفظ التعديلات' : 'إضافة المحاضرة'}</span>
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
