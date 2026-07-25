import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getCountFromServer,
  setDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { db, storage, auth } from '../lib/firebase';
import {
  College,
  Level,
  Course,
  Lecture,
  LibraryFile,
  DashboardStats,
  AuthResponse,
  User,
  TelegramSettings,
  ItemStatus,
} from '../types';

// Helper to construct baseline metadata
function getNowIso() {
  return new Date().toISOString();
}

// Initial seed data if Firestore is fresh and empty
async function seedInitialDataIfNeeded() {
  try {
    const collegesSnap = await getDocs(collection(db, 'colleges'));
    if (!collegesSnap.empty) return;

    const now = getNowIso();

    // 1. Create College
    const collegeRef = await addDoc(collection(db, 'colleges'), {
      name: 'كلية الهندسة وتقنية المعلومات',
      code: 'CIT',
      description: 'كلية متخصصة في البرمجيات والأمن السيبراني ونظم المعلومات',
      status: 'active' as ItemStatus,
      order: 1,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create Levels
    const level1Ref = await addDoc(collection(db, 'levels'), {
      collegeId: collegeRef.id,
      name: 'المستوى الأول',
      levelOrder: 1,
      order: 1,
      status: 'active' as ItemStatus,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    const level2Ref = await addDoc(collection(db, 'levels'), {
      collegeId: collegeRef.id,
      name: 'المستوى الثاني',
      levelOrder: 2,
      order: 2,
      status: 'active' as ItemStatus,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Create Course
    const courseRef = await addDoc(collection(db, 'courses'), {
      collegeId: collegeRef.id,
      levelId: level1Ref.id,
      name: 'برمجة الحاسوب والأساسيات (C++)',
      code: 'CS101',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      description: 'مقدمة في المفاهيم الأساسية للبرمجة والمصفوفات والدوال',
      status: 'active' as ItemStatus,
      order: 1,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Create Lecture
    const lectureRef = await addDoc(collection(db, 'lectures'), {
      courseId: courseRef.id,
      collegeId: collegeRef.id,
      levelId: level1Ref.id,
      title: 'المحاضرة الأولى: مقدمة في خوارزميات البرمجة',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      description: 'شرح مفاهيم خوارزميات التفكير المنطقي والهياكل الأساسية',
      lectureOrder: 1,
      order: 1,
      status: 'active' as ItemStatus,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Create File
    await addDoc(collection(db, 'files'), {
      lectureId: lectureRef.id,
      courseId: courseRef.id,
      collegeId: collegeRef.id,
      levelId: level1Ref.id,
      name: 'ملخص المحاضرة الأولى - الأساسيات.pdf',
      fileName: 'lecture1_summary.pdf',
      originalName: 'ملخص المحاضرة الأولى - الأساسيات.pdf',
      extension: '.pdf',
      mimeType: 'application/pdf',
      size: 2450000,
      sizeBytes: 2450000,
      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storagePath: 'library_documents/sample.pdf',
      type: 'PDF',
      isPublic: true,
      status: 'active' as ItemStatus,
      order: 1,
      isDeleted: false,
      deletedAt: null,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // 6. Create Initial Telegram Settings
    await setDoc(doc(db, 'telegram_settings', 'main'), {
      botUsername: '@UniLibraryBot',
      welcomeMessage: 'أهلاً بك في البوت الرسمي للمكتبة الجامعية. اختر الكلية للبدء:',
      requiredChannels: ['@UniLibraryNews'],
      mainMenu: '📚 الكليات\n🔍 بحث\n📞 الدعم والمساندة',
      supportContact: '@UniSupportAdmin',
      updatedAt: now,
    });

    console.log('✅ Firestore initial seed populated successfully.');
  } catch (err) {
    console.warn('Initial seed skipped or errored:', err);
  }
}

export const api = {
  // --- Auth via Firebase Authentication ---
  async login(username: string, password: string): Promise<AuthResponse> {
    const adminEmail = username.includes('@') ? username : 'admin@university-library.edu';
    
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, adminEmail, password);
        } catch {
          throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
      } else {
        throw new Error(err.message || 'فشل تسجيل الدخول عبر Firebase Auth');
      }
    }

    const fbUser = userCredential.user;
    const user: User = {
      id: fbUser.uid,
      username: username,
      name: fbUser.displayName || 'مشرف المكتبة الجامعية',
      role: 'admin',
    };

    const token = await fbUser.getIdToken();
    localStorage.setItem('lib_admin_token', token);
    localStorage.setItem('lib_admin_user', JSON.stringify(user));

    return { token, user };
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('lib_admin_token');
    localStorage.removeItem('lib_admin_user');
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('lib_admin_user');
    return raw ? JSON.parse(raw) : null;
  },

  // --- Dashboard Stats from Firestore (filters soft-deleted) ---
  async getStats(): Promise<DashboardStats> {
    await seedInitialDataIfNeeded();

    try {
      const [colls, levs, crss, lecs, fls] = await Promise.all([
        getDocs(query(collection(db, 'colleges'), where('isDeleted', '==', false))),
        getDocs(query(collection(db, 'levels'), where('isDeleted', '==', false))),
        getDocs(query(collection(db, 'courses'), where('isDeleted', '==', false))),
        getDocs(query(collection(db, 'lectures'), where('isDeleted', '==', false))),
        getDocs(query(collection(db, 'files'), where('isDeleted', '==', false))),
      ]);

      return {
        collegesCount: colls.size,
        levelsCount: levs.size,
        coursesCount: crss.size,
        lecturesCount: lecs.size,
        filesCount: fls.size,
      };
    } catch (e) {
      return {
        collegesCount: 0,
        levelsCount: 0,
        coursesCount: 0,
        lecturesCount: 0,
        filesCount: 0,
      };
    }
  },

  // --- Colleges Collection ---
  async getColleges(onlyActive = false): Promise<College[]> {
    await seedInitialDataIfNeeded();
    const snap = await getDocs(query(collection(db, 'colleges'), orderBy('order', 'asc')));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as College))
      .filter((item) => !item.isDeleted && (!onlyActive || item.status === 'active'));
  },

  async createCollege(data: {
    name: string;
    code: string;
    description?: string;
    order?: number;
    status?: ItemStatus;
  }): Promise<College> {
    const now = getNowIso();
    const newDoc = {
      name: data.name,
      code: data.code,
      description: data.description || '',
      order: data.order || 1,
      status: data.status || ('active' as ItemStatus),
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, 'colleges'), newDoc);
    return { id: ref.id, ...newDoc };
  },

  async updateCollege(id: string, data: Partial<College>): Promise<College> {
    const docRef = doc(db, 'colleges', id);
    const updateData = { ...data, updatedAt: getNowIso() };
    await updateDoc(docRef, updateData);
    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as College;
  },

  // Soft Delete
  async deleteCollege(id: string): Promise<void> {
    const docRef = doc(db, 'colleges', id);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: getNowIso(),
      updatedAt: getNowIso(),
    });
  },

  // --- Levels Collection ---
  async getLevels(collegeId?: string, onlyActive = false): Promise<Level[]> {
    let q = query(collection(db, 'levels'), orderBy('levelOrder', 'asc'));
    if (collegeId) {
      q = query(collection(db, 'levels'), where('collegeId', '==', collegeId), orderBy('levelOrder', 'asc'));
    }
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Level))
      .filter((item) => !item.isDeleted && (!onlyActive || item.status === 'active'));
  },

  async createLevel(data: {
    collegeId: string;
    name: string;
    levelOrder: number;
    status?: ItemStatus;
  }): Promise<Level> {
    const now = getNowIso();
    const newDoc = {
      collegeId: data.collegeId,
      name: data.name,
      levelOrder: Number(data.levelOrder) || 1,
      order: Number(data.levelOrder) || 1,
      status: data.status || ('active' as ItemStatus),
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, 'levels'), newDoc);
    return { id: ref.id, ...newDoc };
  },

  async updateLevel(id: string, data: Partial<Level>): Promise<Level> {
    const docRef = doc(db, 'levels', id);
    const updateData = { ...data, updatedAt: getNowIso() };
    await updateDoc(docRef, updateData);
    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Level;
  },

  // Soft Delete
  async deleteLevel(id: string): Promise<void> {
    const docRef = doc(db, 'levels', id);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: getNowIso(),
      updatedAt: getNowIso(),
    });
  },

  // --- Courses Collection ---
  async getCourses(collegeId?: string, levelId?: string, onlyActive = false): Promise<Course[]> {
    let q = query(collection(db, 'courses'), orderBy('name', 'asc'));
    if (collegeId && levelId) {
      q = query(
        collection(db, 'courses'),
        where('collegeId', '==', collegeId),
        where('levelId', '==', levelId),
        orderBy('name', 'asc')
      );
    } else if (collegeId) {
      q = query(collection(db, 'courses'), where('collegeId', '==', collegeId), orderBy('name', 'asc'));
    } else if (levelId) {
      q = query(collection(db, 'courses'), where('levelId', '==', levelId), orderBy('name', 'asc'));
    }
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Course))
      .filter((item) => !item.isDeleted && (!onlyActive || item.status === 'active'));
  },

  async createCourse(data: {
    collegeId: string;
    levelId: string;
    name: string;
    image: string;
    code?: string;
    description?: string;
    order?: number;
    status?: ItemStatus;
  }): Promise<Course> {
    const now = getNowIso();
    const newDoc = {
      collegeId: data.collegeId,
      levelId: data.levelId,
      name: data.name,
      image: data.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      code: data.code || '',
      description: data.description || '',
      order: data.order || 1,
      status: data.status || ('active' as ItemStatus),
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, 'courses'), newDoc);
    return { id: ref.id, ...newDoc };
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const docRef = doc(db, 'courses', id);
    const updateData = { ...data, updatedAt: getNowIso() };
    await updateDoc(docRef, updateData);
    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Course;
  },

  // Soft Delete
  async deleteCourse(id: string): Promise<void> {
    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: getNowIso(),
      updatedAt: getNowIso(),
    });
  },

  // --- Lectures Collection ---
  async getLectures(courseId?: string, onlyActive = false): Promise<Lecture[]> {
    let q = query(collection(db, 'lectures'), orderBy('lectureOrder', 'asc'));
    if (courseId) {
      q = query(collection(db, 'lectures'), where('courseId', '==', courseId), orderBy('lectureOrder', 'asc'));
    }
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Lecture))
      .filter((item) => !item.isDeleted && (!onlyActive || item.status === 'active'));
  },

  async createLecture(data: {
    courseId: string;
    collegeId?: string;
    levelId?: string;
    title: string;
    thumbnail: string;
    description?: string;
    lectureOrder: number;
    status?: ItemStatus;
  }): Promise<Lecture> {
    const now = getNowIso();
    const newDoc = {
      courseId: data.courseId,
      collegeId: data.collegeId || '',
      levelId: data.levelId || '',
      title: data.title,
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      description: data.description || '',
      lectureOrder: Number(data.lectureOrder) || 1,
      order: Number(data.lectureOrder) || 1,
      status: data.status || ('active' as ItemStatus),
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, 'lectures'), newDoc);
    return { id: ref.id, ...newDoc };
  },

  async updateLecture(id: string, data: Partial<Lecture>): Promise<Lecture> {
    const docRef = doc(db, 'lectures', id);
    const updateData = { ...data, updatedAt: getNowIso() };
    await updateDoc(docRef, updateData);
    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Lecture;
  },

  // Soft Delete
  async deleteLecture(id: string): Promise<void> {
    const docRef = doc(db, 'lectures', id);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: getNowIso(),
      updatedAt: getNowIso(),
    });
  },

  // --- Files Collection ---
  async getFiles(lectureId?: string, onlyActive = false): Promise<LibraryFile[]> {
    let q = query(collection(db, 'files'), orderBy('uploadedAt', 'desc'));
    if (lectureId) {
      q = query(collection(db, 'files'), where('lectureId', '==', lectureId), orderBy('uploadedAt', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as LibraryFile))
      .filter((item) => !item.isDeleted && (!onlyActive || item.status === 'active'));
  },

  async createFile(data: {
    lectureId: string;
    courseId?: string;
    collegeId?: string;
    levelId?: string;
    name: string;
    type: LibraryFile['type'];
    url: string;
    downloadUrl?: string;
    fileName?: string;
    originalName?: string;
    extension?: string;
    mimeType?: string;
    size?: number;
    sizeBytes: number;
    storagePath?: string;
    isPublic?: boolean;
    status?: ItemStatus;
    order?: number;
  }): Promise<LibraryFile> {
    const now = getNowIso();
    const newDoc = {
      lectureId: data.lectureId,
      courseId: data.courseId || '',
      collegeId: data.collegeId || '',
      levelId: data.levelId || '',
      name: data.name,
      fileName: data.fileName || data.name,
      originalName: data.originalName || data.name,
      extension: data.extension || (data.name.includes('.') ? data.name.substring(data.name.lastIndexOf('.')) : ''),
      mimeType: data.mimeType || 'application/octet-stream',
      size: Number(data.size || data.sizeBytes) || 0,
      sizeBytes: Number(data.sizeBytes || data.size) || 0,
      url: data.url,
      downloadUrl: data.downloadUrl || data.url,
      storagePath: data.storagePath || '',
      type: data.type || 'PDF',
      isPublic: data.isPublic ?? true,
      status: data.status || ('active' as ItemStatus),
      order: data.order || 1,
      isDeleted: false,
      deletedAt: null,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, 'files'), newDoc);
    return { id: ref.id, ...newDoc };
  },

  async updateFile(id: string, data: Partial<LibraryFile>): Promise<LibraryFile> {
    const docRef = doc(db, 'files', id);
    const updateData = { ...data, updatedAt: getNowIso() };
    await updateDoc(docRef, updateData);
    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as LibraryFile;
  },

  // Soft Delete
  async deleteFile(id: string): Promise<void> {
    const docRef = doc(db, 'files', id);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: getNowIso(),
      updatedAt: getNowIso(),
    });
  },

  // --- Telegram Settings Collection ---
  async getTelegramSettings(): Promise<TelegramSettings> {
    await seedInitialDataIfNeeded();
    const docRef = doc(db, 'telegram_settings', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as TelegramSettings;
    }
    const defaultSettings: TelegramSettings = {
      botUsername: '@UniLibraryBot',
      welcomeMessage: 'مرحباً بك في بوت المكتبة الجامعية الرقمية.',
      requiredChannels: ['@UniLibraryNews'],
      mainMenu: '📚 الكليات\n🔍 بحث\n📞 الدعم والمساندة',
      supportContact: '@UniSupportAdmin',
      updatedAt: getNowIso(),
    };
    await setDoc(docRef, defaultSettings);
    return defaultSettings;
  },

  async updateTelegramSettings(data: Partial<TelegramSettings>): Promise<TelegramSettings> {
    const docRef = doc(db, 'telegram_settings', 'main');
    const updateData = { ...data, updatedAt: getNowIso() };
    await setDoc(docRef, updateData, { merge: true });
    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as TelegramSettings;
  },

  // --- Firebase Storage Uploads ---
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const storagePath = `library_images/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(new Error(error.message || 'فشل رفع الصورة إلى Firebase Storage')),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url: downloadURL, filename: file.name });
        }
      );
    });
  },

  uploadFileWithProgress(
    file: File,
    onProgress: (percent: number) => void
  ): Promise<{
    url: string;
    downloadUrl: string;
    name: string;
    fileName: string;
    originalName: string;
    extension: string;
    mimeType: string;
    size: number;
    sizeBytes: number;
    type: LibraryFile['type'];
    storagePath: string;
  }> {
    const storagePath = `library_documents/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const ext = file.name.includes('.')
      ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      : '';
    let fileType: LibraryFile['type'] = 'PDF';
    if (['.mp4', '.avi', '.mkv', '.mov', '.webm'].includes(ext)) {
      fileType = 'Video';
    } else if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) {
      fileType = 'ZIP';
    } else if (['.doc', '.docx'].includes(ext)) {
      fileType = 'DOCX';
    } else {
      fileType = 'PDF';
    }

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(percent);
          }
        },
        (error) => {
          reject(new Error(error.message || 'فشل رفع الملف إلى Firebase Storage'));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            downloadUrl: downloadURL,
            name: file.name,
            fileName: file.name,
            originalName: file.name,
            extension: ext,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            sizeBytes: file.size,
            type: fileType,
            storagePath: storagePath,
          });
        }
      );
    });
  },
};
