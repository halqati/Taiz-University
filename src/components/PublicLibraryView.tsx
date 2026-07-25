import React, { useState, useEffect } from 'react';
import {
  Building2,
  Layers,
  BookOpenCheck,
  Video,
  FileText,
  Search,
  Download,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Film,
  Archive,
  FileCode,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { College, Level, Course, Lecture, LibraryFile, FileType } from '../types';
import { api } from '../services/api';

export const PublicLibraryView: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [files, setFiles] = useState<LibraryFile[]>([]);

  // Navigation State
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFileType, setActiveFileType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Load initial data (only active & non-deleted)
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const colls = await api.getColleges(true);
        setColleges(colls);
        if (colls.length > 0) {
          setSelectedCollege(colls[0]);
        }
      } catch (err) {
        console.error('Error loading public view:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // When selected college changes, load its active levels and courses
  useEffect(() => {
    if (selectedCollege) {
      async function loadCollegeContent() {
        setLoading(true);
        try {
          const [levs, crss] = await Promise.all([
            api.getLevels(selectedCollege!.id, true),
            api.getCourses(selectedCollege!.id, undefined, true),
          ]);
          setLevels(levs);
          setCourses(crss);
          setSelectedLevel(null);
          setSelectedCourse(null);
          setSelectedLecture(null);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadCollegeContent();
    }
  }, [selectedCollege]);

  // When selected course changes, load its active lectures
  useEffect(() => {
    if (selectedCourse) {
      async function loadCourseLectures() {
        setLoading(true);
        try {
          const lecs = await api.getLectures(selectedCourse!.id, true);
          setLectures(lecs);
          setSelectedLecture(null);
          setFiles([]);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadCourseLectures();
    }
  }, [selectedCourse]);

  // When selected lecture changes, load its active files
  useEffect(() => {
    if (selectedLecture) {
      async function loadLectureFiles() {
        setLoading(true);
        try {
          const fls = await api.getFiles(selectedLecture!.id, true);
          setFiles(fls);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadLectureFiles();
    }
  }, [selectedLecture]);

  const filteredCourses = courses.filter((c) => {
    const matchesLevel = !selectedLevel || c.levelId === selectedLevel.id;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const filteredFiles = files.filter((f) => {
    if (activeFileType !== 'ALL' && f.type !== activeFileType) return false;
    return f.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
        return <FileCode className="w-5 h-5 text-emerald-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search & Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>البوابة الأكاديمية للطلاب</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            استكشف المقررات والمحاضرات الدراسية
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            مستودع إلكتروني متكامل يحتوي على المراجع، المحاضرات، وملفات PDF والفيديو ومقاطع الشرح الجامعية المعتمدة.
          </p>

          <div className="pt-2 relative max-w-xl">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مادة، محاضرة، أو ملف تعليمي..."
              className="w-full pr-12 pl-4 py-3 bg-slate-950/80 text-white placeholder-slate-400 border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* College Selection Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>اختر الكلية الأكاديمية</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">عدد الكليات النشطة: {colleges.length}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {colleges.map((college) => {
            const isSelected = selectedCollege?.id === college.id;
            return (
              <button
                key={college.id}
                onClick={() => setSelectedCollege(college)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-emerald-400' : 'bg-slate-300'
                  }`}
                />
                <span>{college.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] ${
                    isSelected ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {college.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Levels & Courses, Right Lecture & Files */}
      {selectedCollege && (
        <div className="space-y-6">
          {/* Breadcrumb Navigation Trail */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-2 text-xs font-bold text-slate-600 flex-wrap">
            <span className="text-slate-900">{selectedCollege.name}</span>
            {selectedLevel && (
              <>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {selectedLevel.name}
                </span>
              </>
            )}
            {selectedCourse && (
              <>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900">{selectedCourse.name}</span>
              </>
            )}
            {selectedLecture && (
              <>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-700 font-extrabold">{selectedLecture.title}</span>
              </>
            )}
          </div>

          {!selectedCourse ? (
            /* VIEW 1: LEVELS FILTER & COURSES GRID */
            <div className="space-y-6">
              {/* Level Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedLevel(null)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedLevel === null
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  جميع المستويات ({levels.length})
                </button>
                {levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      selectedLevel?.id === lvl.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {lvl.name}
                  </button>
                ))}
              </div>

              {/* Courses Grid */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-emerald-600" />
                  <span>المواد والمقررات الدراسية المتاحة</span>
                </h4>

                {filteredCourses.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <BookOpenCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">لا توجد مواد دراسية متطابقة</p>
                    <p className="text-xs text-slate-500 mt-1">جرب تغيير المستوى أو البحث بكلمات أخرى</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-36 bg-slate-100 relative overflow-hidden">
                            <img
                              src={course.image}
                              alt={course.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {course.code && (
                              <span className="absolute top-3 right-3 bg-slate-900/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md backdrop-blur-xs">
                                {course.code}
                              </span>
                            )}
                          </div>

                          <div className="p-4 space-y-2">
                            <h5 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                              {course.name}
                            </h5>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {course.description || 'لا يوجد وصف متاح للمادة'}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 pt-0 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-[-4px] transition-transform">
                          <span>استعرض المحاضرات والملفات</span>
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VIEW 2: LECTURES & FILES OF SELECTED COURSE */
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setSelectedLecture(null);
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>العودة لقائمة المواد</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lectures Sidebar */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span>محاضرات المادة ({lectures.length})</span>
                  </h4>

                  {lectures.length === 0 ? (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                      لا توجد محاضرات مضافة لهذه المادة بعد.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lectures.map((lecture) => {
                        const isSelected = selectedLecture?.id === lecture.id;
                        return (
                          <div
                            key={lecture.id}
                            onClick={() => setSelectedLecture(lecture)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden relative">
                              <img
                                src={lecture.thumbnail}
                                alt={lecture.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs truncate">{lecture.title}</h5>
                              <p
                                className={`text-[10px] truncate ${
                                  isSelected ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {lecture.description || 'محاضرة رقمية'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Files Display Area */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedLecture ? (
                    <>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              المحاضرة المختارة
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 mt-1">
                              {selectedLecture.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {selectedLecture.description}
                            </p>
                          </div>
                        </div>

                        {/* File Type Filter Tabs */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          {['ALL', 'PDF', 'Video', 'ZIP', 'DOCX'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setActiveFileType(type)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                activeFileType === type
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {type === 'ALL' ? 'الكل' : type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Files List */}
                      {filteredFiles.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                          <p className="text-xs font-bold text-slate-700">لا توجد ملفات متطابقة</p>
                          <p className="text-[11px] text-slate-500">لم يتم رفع ملفات تعليمية لهذه المحاضرة بعد.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredFiles.map((file) => (
                            <div
                              key={file.id}
                              className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                                  {renderFileIcon(file.type)}
                                </div>
                                <div className="min-w-0">
                                  <h6 className="font-bold text-xs text-slate-900 truncate">
                                    {file.name}
                                  </h6>
                                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-medium">
                                    <span>النوع: {file.type}</span>
                                    <span>•</span>
                                    <span>الحجم: {formatSize(file.sizeBytes || file.size)}</span>
                                    <span>•</span>
                                    <span>
                                      {new Date(file.uploadedAt || file.createdAt).toLocaleDateString('ar-EG')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={file.downloadUrl || file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>تحميل الملف</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                      اختر محاضرة من القائمة الجانبية لعرض الملفات والملخصات المتاحة.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
