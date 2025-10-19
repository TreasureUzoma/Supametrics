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
    let message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "Something went wrong";

    if (error.code === "ERR_NETWORK") {
      message = "Unable to connect to server. Please check your internet.";
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosFetch;
