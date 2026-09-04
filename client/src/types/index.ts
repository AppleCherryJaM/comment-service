export interface User {
  id: string;
  name: string;
  username?: string; // Fallback
  email: string;
  home_page?: string;
  homePage?: string; // Fallback
  created_at?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'text';
  fileSize: number;
}

export interface Comment {
  id: string;
  user_name: string;
  username?: string; // Fallback helper
  email: string;
  home_page?: string;
  homePage?: string; // Fallback helper
  text: string;
  parent_comment_id?: string | null;
  root_comment_id?: string | null;
  created_at: string;
  createdAt?: string; // Fallback helper
  user?: User | null;
  attachments?: Attachment[];
  replies?: Comment[];
  replies_count?: number;
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
  sortBy?: 'user_name' | 'username' | 'email' | 'created_at' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CaptchaResponse {
  captchaId: string;
  captchaSvg: string;
}

export interface CreateCommentPayload {
  userName: string;
  email: string;
  homePage?: string;
  text: string;
  parentCommentId?: string;
  captchaId?: string;
  captchaCode?: string;
  attachmentIds?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  home_page?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
