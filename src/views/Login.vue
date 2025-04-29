<template>
  <div class="login-container">
    <!-- 动态背景图形 -->
    <div class="shapes-container">
      <div v-for="(shape, index) in shapes" :key="index" :class="['shape', shape.type]" :style="{
        left: shape.x + '%',
        top: shape.y + '%',
        width: shape.size + 'px',
        height: shape.size + 'px',
        backgroundColor: shape.color,
        transform: `rotate(${shape.rotation}deg)`,
        animationDuration: shape.duration + 's',
        animationDelay: shape.delay + 's',
        opacity: shape.opacity
      }"></div>
    </div>

    <!-- 登录部分 -->
    <div class="content">
      <!-- 左侧登录框 -->
      <div class="login-form-container">
        <div class="login-form">
          <!-- Logo和标题 -->
          <div class="logo-title-container">
            <div class="logo">
              <img src="../assets/logo.png" alt="Logo" class="logo-image" />
            </div>
            <h1 class="title">爬虫管理平台</h1>
          </div>

          <!-- 用户名登录 -->

          <!-- 用户名输入框 -->
          <div class="input-group">
            <input type="text" placeholder="请输入用户名" v-model="username" @keyup.enter="focusPassword" ref="usernameInput" />
          </div>

          <!-- 密码输入框 -->
          <div class="input-group">
            <input :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" v-model="password" @keyup.enter="login" ref="passwordInput" />
            <button class="toggle-password" @click="togglePassword">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
                <path v-if="!showPassword" d="m3 3 18 18"></path>
              </svg>
            </button>
          </div>
          <!-- 登录按钮 -->
          <button class="login-btn" @click="login">登录</button>
        </div>
      </div>

      <!-- 右侧标语 -->
      <div class="tagline-container">
        <h2 class="tagline">
          crawl everything
        </h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import request from '../utils/request'; // 导入封装的 request 函数
import { useAuthStore } from '../store/auth'; // 导入 Pinia store
import { ElMessage } from 'element-plus'; // 导入 ElMessage 用于提示

// 获取路由和认证存储
const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const usernameInput = ref(null);
const passwordInput = ref(null);

// 聚焦密码输入框
const focusPassword = () => {
  passwordInput.value?.focus();
};

// 切换密码可见性
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// 登录方法
const login = async () => {
  try {
    // 表单验证
    if (!username.value || !password.value) {
      ElMessage.warning('请输入用户名和密码');
      return;
    }

    // 使用封装的 request 函数发起登录请求
    const response = await request.post('/login', {
      username: username.value,
      password: password.value
    });

    if (response.data && response.data.token) {
      // 存储 token
      authStore.setToken(response.data.token);
      ElMessage.success('登录成功');
      // 登录成功后跳转到首页
      router.push('/');
    } else {
      // 处理后端未返回 token 的情况
      ElMessage.error(response.data.msg || '登录失败，请检查用户名和密码');
    }
  } catch (error) {
    console.error('登录失败:', error);
    // 处理请求错误，例如网络问题或服务器错误
    const errorMessage = error.response?.data?.msg || '登录请求失败，请稍后重试';
    ElMessage.error(errorMessage);
  }
};

// 动态背景形状
const shapes = ref([]);
const animationFrameId = ref(null);

// 生成随机形状
const generateShapes = () => {
  const shapeTypes = ['circle', 'semi-circle', 'triangle'];
  const colors = [
    'rgba(248, 113, 113, 0.4)', // 红色
    'rgba(147, 197, 253, 0.4)', // 蓝色
    'rgba(196, 181, 253, 0.4)', // 紫色
    'rgba(253, 186, 116, 0.4)', // 橙色
  ];

  const newShapes = [];

  // 生成25-30个随机形状，增加形状数量使背景更丰富
  const shapeCount = Math.floor(Math.random() * 6) + 25;

  for (let i = 0; i < shapeCount; i++) {
    newShapes.push({
      type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 80 + 30, // 调整大小范围使形状更加协调
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      duration: Math.random() * 30 + 20, // 增加动画持续时间
      delay: Math.random() * 5,
      speedX: (Math.random() - 0.5) * 0.05, // 降低移动速度
      speedY: (Math.random() - 0.5) * 0.05,
      opacity: Math.random() * 0.3 + 0.2, // 添加随机透明度
    });
  }

  shapes.value = newShapes;
};

// 动画形状
const animateShapes = () => {
  shapes.value.forEach(shape => {
    // 更新位置
    shape.x += shape.speedX;
    shape.y += shape.speedY;

    // 边界检查
    if (shape.x > 100) shape.x = -10;
    if (shape.x < -10) shape.x = 100;
    if (shape.y > 100) shape.y = -10;
    if (shape.y < -10) shape.y = 100;

    // 缓慢旋转
    shape.rotation += 0.01;
  });

  animationFrameId.value = requestAnimationFrame(animateShapes);
};

// 生命周期钩子
onMounted(() => {
  generateShapes();
  animateShapes();
});

onBeforeUnmount(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
});
</script>

<style scoped>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: white;
}

/* 形状容器 */
.shapes-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 1;
}

.circle {
  border-radius: 50%;
}

.semi-circle {
  border-radius: 50% 0 0 50%;
}

.triangle {
  width: 0 !important;
  height: 0 !important;
  background-color: transparent !important;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 86px solid currentColor;
}

/* 内容布局 */
.content {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  height: 100%;
}

/* 登录表单容器 */
.login-form-container {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(20px);
  background-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border-radius: 24px;
  margin: 2rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-form-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.65);
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

/* Logo和标题容器 */
.logo-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

/* Logo样式 */
.logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 50px;
  width: auto;
}

/* 标题 */
.title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(to right, #ff6b6b, #6b47ff, #4158d0, #00c6ff);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: gradient-shift 8s ease infinite;
  letter-spacing: 0.5px;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}



/* 输入框组 */
.input-group {
  position: relative;
  margin-bottom: 1rem;
}

.input-group input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background-color: rgba(249, 250, 251, 0.8);
  font-size: 1rem;
  color: #111827;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
  transform: translateY(-1px);
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

/* 记住登录和忘记密码 */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.remember {
  display: flex;
  align-items: center;
  color: #4b5563;
  cursor: pointer;
}

.remember input {
  margin-right: 0.5rem;
}

.forgot {
  color: #6366f1;
  text-decoration: none;
}

.forgot:hover {
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.login-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}



/* 右侧标语 */
.tagline-container {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.tagline {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #111827, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }

  .login-form-container,
  .tagline-container {
    width: 100%;
  }

  .tagline-container {
    order: -1;
    padding: 2rem 1rem;
  }

  .tagline {
    font-size: 2rem;
    text-align: center;
  }
}
</style>