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
    const response = await apiClient.get<any>('/comments', {
      params,
    });
    const res = response.data;
    const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    const meta = res?.meta || {
      total: items.length,
      page: params?.page || 1,
      limit: params?.limit || 25,
      totalPages: Math.ceil(items.length / (params?.limit || 25)),
    };

    return {
      data: items,
      meta,
      total: meta.total ?? items.length,
      page: meta.page ?? 1,
      limit: meta.limit ?? 25,
      totalPages: meta.totalPages ?? 0,
    };
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
