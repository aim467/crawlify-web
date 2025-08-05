import axios from 'axios';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

// 创建 axios 实例
const service = axios.create({
  baseURL: "http://localhost:4444", // API 的 base_url
  timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 放行二进制流的处理
    if (response.config.responseType === 'blob') {
      return res;
    }
    
    if (res.code === 401) {
      // 处理未授权错误，例如跳转到登录页
      const authStore = useAuthStore();
      authStore.clearToken();
      router.push('/login');
      return Promise.reject(new Error(res.msg || 'Error'));
    } else if (res.code !== 200) {
      // 处理业务错误
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return res;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 处理未授权错误，例如跳转到登录页
      const authStore = useAuthStore();
      authStore.clearToken();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default service;