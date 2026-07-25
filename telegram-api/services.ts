import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase.ts';
import { College, Level, Course, Lecture, LibraryFile, TelegramSettings } from '../src/types/index.ts';

/**
 * 1. Fetch active, non-deleted Colleges
 */
export async function getActiveColleges(): Promise<College[]> {
  try {
    const q = query(collection(db, 'colleges'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as College))
      .filter((item) => item.isDeleted !== true && item.status === 'active');
  } catch (error) {
    // Fallback if index on order field is not ready
    const snap = await getDocs(collection(db, 'colleges'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as College))
      .filter((item) => item.isDeleted !== true && item.status === 'active')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

/**
 * 2. Fetch active, non-deleted Levels for a College
 */
export async function getActiveLevelsByCollege(collegeId: string): Promise<Level[]> {
  try {
    const q = query(
      collection(db, 'levels'),
      where('collegeId', '==', collegeId),
      orderBy('levelOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Level))
      .filter((item) => item.isDeleted !== true && item.status === 'active');
  } catch (error) {
    const snap = await getDocs(
      query(collection(db, 'levels'), where('collegeId', '==', collegeId))
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Level))
      .filter((item) => item.isDeleted !== true && item.status === 'active')
      .sort((a, b) => (a.levelOrder || 0) - (b.levelOrder || 0));
  }
}

/**
 * 3. Fetch active, non-deleted Courses for a Level
 */
export async function getActiveCoursesByLevel(levelId: string): Promise<Course[]> {
  try {
    const q = query(
      collection(db, 'courses'),
      where('levelId', '==', levelId),
      orderBy('order', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Course))
      .filter((item) => item.isDeleted !== true && item.status === 'active');
  } catch (error) {
    const snap = await getDocs(
      query(collection(db, 'courses'), where('levelId', '==', levelId))
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Course))
      .filter((item) => item.isDeleted !== true && item.status === 'active')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

/**
 * 4. Fetch active, non-deleted Lectures for a Course
 */
export async function getActiveLecturesByCourse(courseId: string): Promise<Lecture[]> {
  try {
    const q = query(
      collection(db, 'lectures'),
      where('courseId', '==', courseId),
      orderBy('lectureOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Lecture))
      .filter((item) => item.isDeleted !== true && item.status === 'active');
  } catch (error) {
    const snap = await getDocs(
      query(collection(db, 'lectures'), where('courseId', '==', courseId))
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Lecture))
      .filter((item) => item.isDeleted !== true && item.status === 'active')
      .sort((a, b) => (a.lectureOrder || 0) - (b.lectureOrder || 0));
  }
}

/**
 * 5. Fetch active, non-deleted Files and download URLs for a Lecture
 */
export async function getActiveFilesByLecture(lectureId: string): Promise<LibraryFile[]> {
  try {
    const q = query(
      collection(db, 'files'),
      where('lectureId', '==', lectureId),
      orderBy('order', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as LibraryFile))
      .filter((item) => item.isDeleted !== true && item.status === 'active');
  } catch (error) {
    const snap = await getDocs(
      query(collection(db, 'files'), where('lectureId', '==', lectureId))
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as LibraryFile))
      .filter((item) => item.isDeleted !== true && item.status === 'active')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

/**
 * Optional helper: Get Telegram bot settings from Firestore
 */
export async function getTelegramBotSettings(): Promise<TelegramSettings | null> {
  try {
    const docRef = doc(db, 'telegram_settings', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as TelegramSettings;
    }
    return null;
  } catch (error) {
    return null;
  }
}
