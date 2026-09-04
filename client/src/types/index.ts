export interface User {
  id: number;
  username: string;
  email: string;
  homePage?: string;
  avatarUrl?: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'text';
  fileSize: number;
}

export interface Comment {
  id: number;
  username: string;
  email: string;
  homePage?: string;
  text: string;
  parentCommentId?: number | null;
  rootCommentId?: number | null;
  createdAt: string;
  user?: User | null;
  attachments?: Attachment[];
  replies?: Comment[];
  repliesCount?: number;
}

export interface PaginatedCommentsResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetCommentsParams {
  page?: number;
  limit?: number;
  sortBy?: 'username' | 'email' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CaptchaResponse {
  captchaId: string;
  captchaSvg: string;
}

export interface CreateCommentPayload {
  username: string;
  email: string;
  homePage?: string;
  text: string;
  parentCommentId?: number;
  captchaId?: string;
  captchaCode?: string;
  attachmentIds?: number[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  homePage?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
