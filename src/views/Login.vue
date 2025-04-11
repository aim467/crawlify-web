<template>
  <div class="login-container">
    <div class="logo-container" v-motion :initial="{ opacity: 0, y: -50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
      <img :src="logoUrl" alt="系统Logo" class="logo-image">
      <h1 class="platform-title">爬虫管理平台</h1>
    </div>
    <div class="login-card" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1, transition: { delay: 300 } }">
      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            class="login-input"
            :class="{ 'input-focus': activeInput === 'username' }"
            @focus="activeInput = 'username'"
            @blur="activeInput = ''">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            class="login-input"
            :class="{ 'input-focus': activeInput === 'password' }"
            @focus="activeInput = 'password'"
            @blur="activeInput = ''">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-button 
          type="primary" 
          class="login-button" 
          :class="{ 'button-hover': isButtonHover }"
          @click="handleLogin"
          @mouseenter="isButtonHover = true"
          @mouseleave="isButtonHover = false">登录</el-button>
      </el-form>
    </div>
    <div class="copyright" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 500 } }">© 2024 爬虫管理平台 版权所有</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['login']);
const router = useRouter();

const logoUrl = 'https://ai-public.mastergo.com/ai/img_res/de1e878e5cb64a628cbf9769892cac4b.jpg';
const loginForm = ref({
  username: '',
  password: ''
});

// 用于输入框焦点效果
const activeInput = ref('');
// 用于按钮悬停效果
const isButtonHover = ref(false);

const handleLogin = () => {
  router.push('/');
};
</script>

<style scoped>
/* 登录页面容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #bbdefb 50%, #c5cae9 100%);
  position: relative;
  overflow: hidden;
}

/* 背景动效元素 */
.login-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  z-index: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
  animation: pulse 15s infinite ease-in-out;
}

/* Logo容器 */
.logo-container {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-image {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.05);
}

.platform-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a237e;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 登录卡片 */
.login-card {
  width: 24rem;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.07);
}

/* 输入框样式 */
.login-input {
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  border-radius: 0.5rem;
  border: 1px solid #e0e0e0;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.input-focus :deep(.el-input__wrapper) {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2) !important;
  transform: translateY(-2px);
}

/* 登录按钮 */
.login-button {
  width: 100%;
  border-radius: 0.5rem;
  height: 2.75rem;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 1rem;
  background: linear-gradient(45deg, #1976d2, #2196f3);
  border: none;
  box-shadow: 0 4px 10px rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
}

.button-hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(33, 150, 243, 0.4);
  background: linear-gradient(45deg, #1565c0, #1976d2);
}

/* 版权信息 */
.copyright {
  margin-top: 2rem;
  color: #546e7a;
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>