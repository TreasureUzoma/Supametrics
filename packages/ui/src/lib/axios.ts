import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Response } from "../types";

const axiosFetch: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosFetch.interceptors.response.use(
  (response: AxiosResponse<Response>) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default axiosFetch;
