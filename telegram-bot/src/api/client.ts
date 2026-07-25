import { College, Level, Course, Lecture, LibraryFile, TelegramSettings } from '../../../src/types';

/**
 * Telegram API Client for communicating with backend endpoints (/telegram/*)
 */
export class TelegramApiClient {
  private baseUrl: string;
  private secret: string;

  constructor() {
    this.baseUrl = (process.env.TELEGRAM_API_URL || 'http://localhost:3000/telegram').replace(/\/$/, '');
    this.secret = process.env.TELEGRAM_API_SECRET || 'default_telegram_secret_key_2026';
  }

  private async fetchApi<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-secret': this.secret,
        'x-api-key': this.secret,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json.data as T;
  }

  async getSettings(): Promise<TelegramSettings | null> {
    try {
      return await this.fetchApi<TelegramSettings>('/settings');
    } catch {
      return null;
    }
  }

  async getColleges(): Promise<College[]> {
    return this.fetchApi<College[]>('/colleges');
  }

  async getLevels(collegeId: string): Promise<Level[]> {
    return this.fetchApi<Level[]>(`/levels/${collegeId}`);
  }

  async getCourses(levelId: string): Promise<Course[]> {
    return this.fetchApi<Course[]>(`/courses/${levelId}`);
  }

  async getLectures(courseId: string): Promise<Lecture[]> {
    return this.fetchApi<Lecture[]>(`/lectures/${courseId}`);
  }

  async getFiles(lectureId: string): Promise<LibraryFile[]> {
    return this.fetchApi<LibraryFile[]>(`/files/${lectureId}`);
  }
}

export const apiClient = new TelegramApiClient();
