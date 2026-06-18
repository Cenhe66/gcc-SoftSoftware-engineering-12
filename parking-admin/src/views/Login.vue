<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <el-icon :size="48" color="#409EFF"><Parking /></el-icon>
        <h1 class="title">智慧停车管理系统</h1>
        <p class="subtitle">后台管理登录</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              :prefix-icon="Key"
              size="large"
              class="captcha-input"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <span class="captcha-text">{{ captchaCode }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>© 2026 智慧停车管理系统</p>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'

const router = useRouter()

// 登录表单
const loginFormRef = ref(null)
const loginForm = ref({
  username: '',
  password: '',
  captcha: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 验证码
const captchaCode = ref('')
const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = result
}

const refreshCaptcha = () => {
  generateCaptcha()
  loginForm.value.captcha = ''
}

// 记住我
const rememberMe = ref(false)

// 登录状态
const loading = ref(false)

// 登录处理
const handleLogin = async () => {
  await loginFormRef.value.validate()

  if (loginForm.value.captcha.toLowerCase() !== captchaCode.value.toLowerCase()) {
    ElMessage.error('验证码错误')
    refreshCaptcha()
    return
  }

  loading.value = true

  // 模拟登录
  setTimeout(() => {
    loading.value = false
    ElMessage.success('登录成功')
    router.push('/dashboard')
  }, 1000)
}

onMounted(() => {
  generateCaptcha()
})
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a1929 0%, #0d2137 50%, #1a3a5c 100%);
  position: relative;
  overflow: hidden;
}

.login-box {
  width: 420px;
  padding: $spacing-xl * 2;
  background: rgba(255, 255, 255, 0.05);
  border-radius: $border-radius-lg;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  .title {
    font-size: $font-size-xl;
    color: $text-primary;
    margin: $spacing-md 0 $spacing-xs;
    font-weight: 600;
  }

  .subtitle {
    font-size: $font-size-sm;
    color: $text-muted;
    margin: 0;
  }
}

.login-form {
  .el-input {
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: none;

      &.is-focus {
        border-color: $primary-color;
      }

      input {
        color: $text-primary;
        background: transparent;

        &::placeholder {
          color: $text-muted;
        }
      }

      .el-input__icon {
        color: $text-muted;
      }
    }
  }

  .el-checkbox {
    color: $text-secondary;

    :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
      color: $primary-color;
    }

    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
      background-color: $primary-color;
      border-color: $primary-color;
    }
  }
}

.captcha-wrapper {
  display: flex;
  gap: $spacing-md;

  .captcha-input {
    flex: 1;
  }

  .captcha-image {
    width: 120px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: $border-radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s;

    &:hover {
      border-color: $primary-color;
    }

    .captcha-text {
      font-size: 20px;
      font-weight: 600;
      color: $primary-color;
      letter-spacing: 4px;
      font-family: 'Courier New', monospace;
    }
  }
}

.login-btn {
  width: 100%;
  font-size: $font-size-md;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  p {
    font-size: $font-size-xs;
    color: $text-muted;
    margin: 0;
  }
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
    filter: blur(60px);
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -100px;
    animation: float 20s infinite ease-in-out;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    bottom: -50px;
    left: -50px;
    animation: float 15s infinite ease-in-out reverse;
  }

  .circle-3 {
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 10s infinite ease-in-out;
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
}
</style>
