import { defineStore } from 'pinia';

interface AuthState {
  token: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('Authorization') || null, // 从 localStorage 初始化 token
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('Authorization', token); // 将 token 存储到 localStorage
    },
    clearToken() {
      this.token = null;
      localStorage.removeItem('Authorization'); // 从 localStorage 移除 token
    },
  },
});