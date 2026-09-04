import { apiClient } from '../api/client';
import type { CaptchaResponse } from '../types';

export const captchaService = {
  async getCaptcha(): Promise<CaptchaResponse> {
    const response = await apiClient.get<CaptchaResponse>('/captcha');
    return response.data;
  },
};
