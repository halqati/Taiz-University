export type FileType = 'PDF' | 'Video' | 'ZIP' | 'DOCX';
export type ItemStatus = 'active' | 'inactive';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  status: ItemStatus;
  order: number;
}

export interface College extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  image?: string;
}

export interface Level extends BaseEntity {
  collegeId: string;
  name: string; // e.g., "المستوى الأول", "المستوى الثاني"
  levelOrder: number;
}

export interface Course extends BaseEntity {
  collegeId: string;
  levelId: string;
  name: string;
  code?: string;
  image: string;
  description?: string;
}

export interface Lecture extends BaseEntity {
  courseId: string;
  collegeId?: string;
  levelId?: string;
  title: string;
  thumbnail: string;
  description?: string;
  lectureOrder: number;
}

export interface LibraryFile extends BaseEntity {
  lectureId: string;
  courseId?: string;
  collegeId?: string;
  levelId?: string;
  name: string;
  fileName: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  sizeBytes: number;
  downloadUrl: string;
  url: string;
  storagePath: string;
  type: FileType;
  isPublic: boolean;
  uploadedAt: string;
}

export interface TelegramSettings {
  id?: string;
  botUsername: string;
  welcomeMessage: string;
  requiredChannels: string[];
  channelUsername?: string;
  mainMenu: string;
  supportContact: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin';
}

export interface DashboardStats {
  collegesCount: number;
  levelsCount: number;
  coursesCount: number;
  lecturesCount: number;
  filesCount: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
