import { apiClient } from '../api/client';
import type {
  Attachment,
  CreateCommentPayload,
  GetCommentsParams,
  PaginatedCommentsResponse,
  Comment,
} from '../types';

export const commentsService = {
  async getComments(params?: GetCommentsParams): Promise<PaginatedCommentsResponse> {
    const response = await apiClient.get<PaginatedCommentsResponse>('/comments', {
      params,
    });
    return response.data;
  },

  async createComment(payload: CreateCommentPayload): Promise<Comment> {
    const response = await apiClient.post<Comment>('/comments', payload);
    return response.data;
  },

  async uploadAttachment(file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Attachment>('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
