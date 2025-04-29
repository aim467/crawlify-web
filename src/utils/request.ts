import axios from 'axios';
import { useAuthStore } from '../store/auth';

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
      console.log(token);
      // 让每个请求携带自定义 token 请根据实际情况自行修改
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    console.error('Request Error:', error); // for debug
    return Promise.reject(error);
  }
);

// 响应拦截器 (可选，可以添加错误处理等)
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const res = response.data;
    // 这里可以根据后端接口的实际返回结构进行调整
    // 例如，如果后端接口在成功时总是返回一个包含 `code` 和 `data` 的对象
    // if (res.code !== 200) { // 假设 200 是成功的状态码
    //   // 处理业务错误
    //   console.error('API Error:', res.message || 'Error');
    //   return Promise.reject(new Error(res.message || 'Error'));
    // }
    return res;
  },
  (error) => {
    // 对响应错误做点什么
    console.error('Response Error:', error.response || error.message || error); // for debug
    // 这里可以添加更具体的错误处理，例如根据 HTTP 状态码处理
    // if (error.response && error.response.status === 401) {
    //   // 处理未授权错误，例如跳转到登录页
    //   const authStore = useAuthStore();
    //   authStore.clearToken();
    //   // router.push('/login'); // 需要引入 router
    // }
    return Promise.reject(error);
  }
);

export default service;