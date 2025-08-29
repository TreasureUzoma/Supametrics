// eslint-disable-next-line
export type Response<T = any> = {
  success: boolean;
  message: string;
  data?: T | null;
  error?: string;
};
