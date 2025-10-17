import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const getSessionKey = (): String | null => {
  const item = localStorage.getItem("sessionKey");

  if (!item) {
    return null;
  }

  const sessionKey = JSON.parse(item);
  if (Date.now() > sessionKey.expiry) {
    localStorage.removeItem("sessionKey");
    return null;
  }

  return sessionKey.value;
}


const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
});

// instance.defaults.withCredentials = true;

instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const sessionKey = getSessionKey();
        if (sessionKey) {
          config.headers.Authorization = `Bearer ${sessionKey}`;
        }
        return config;
    },
    (error: AxiosError): Promise<never> => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
  (response: AxiosResponse): any => {
    return response.data;
  },
  (error: AxiosError): Promise<never> => {
    const status: number = error.response?.status || 500;

    console.log("Mã lỗi: ", status);

    switch (status) {
      case 400:
      case 401:
      case 403:
      case 404:
      case 409:
      case 422:
      default:
        return Promise.reject(error);
    }
  }
);

export default instance;