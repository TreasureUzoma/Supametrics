// eslint-disable-next-line
export type Response<T = any> = {
  success: boolean;
  message: string;
  data?: T | null;
  error?: string;
  pagination?: {
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};
