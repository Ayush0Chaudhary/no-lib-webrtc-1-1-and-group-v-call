import { BACKEND_URL } from '@/const';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

export const basicAxios = async (endpoint: string, options?: AxiosRequestConfig) => {
  const res = await axios({
    baseURL: BACKEND_URL,
    url: endpoint,
    method: 'GET',
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  return res;
};
