<template>
  <div class="page-container">
    <div class="page-header">
      <h2>个人中心</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="profile-card" shadow="never">
          <div class="profile-avatar">
            <el-avatar :size="100" :icon="UserFilled" />
            <h3 class="profile-name">管理员</h3>
            <p class="profile-role">超级管理员</p>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">128</span>
              <span class="stat-label">登录次数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">15</span>
              <span class="stat-label">操作记录</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">3</span>
              <span class="stat-label">消息通知</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button type="primary" link @click="handleEdit">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="用户名">
              <span v-if="!isEditing">{{ formData.username }}</span>
              <el-input v-else v-model="formData.username" />
            </el-form-item>
            <el-form-item label="手机号">
              <span v-if="!isEditing">{{ formData.phone }}</span>
              <el-input v-else v-model="formData.phone" />
            </el-form-item>
            <el-form-item label="邮箱">
              <span v-if="!isEditing">{{ formData.email }}</span>
              <el-input v-else v-model="formData.email" />
            </el-form-item>
            <el-form-item label="注册时间">
              <span>{{ formData.registerTime }}</span>
            </el-form-item>
            <el-form-item label="最后登录">
              <span>{{ formData.lastLoginTime }}</span>
            </el-form-item>

            <el-form-item v-if="isEditing">
              <el-button @click="isEditing = false">取消</el-button>
              <el-button type="primary" @click="handleSave">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="password-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 表单数据
const isEditing = ref(false)
const formRef = ref(null)
const formData = ref({
  username: 'admin',
  phone: '13800138000',
  email: 'admin@parking.com',
  registerTime: '2026-01-01 10:00:00',
  lastLoginTime: '2026-05-27 09:30:00'
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

// 密码表单
const passwordFormRef = ref(null)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 编辑
const handleEdit = () => {
  isEditing.value = true
}

// 保存
const handleSave = async () => {
  await formRef.value.validate()
  ElMessage.success('保存成功')
  isEditing.value = false
}

// 修改密码
const handleChangePassword = async () => {
  await passwordFormRef.value.validate()
  ElMessage.success('密码修改成功')
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}
</script>

<style scoped lang="scss">
.page-container {
  padding: $spacing-lg;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  margin-bottom: $spacing-lg;

  h2 {
    margin: 0;
    font-size: $font-size-xl;
    color: $text-primary;
  }
}

.profile-card {
  background: $bg-card;
  border: 1px solid $border-color;

  :deep(.el-card__body) {
    padding: $spacing-xl;
  }
}

.profile-avatar {
  text-align: center;
  padding-bottom: $spacing-lg;
  border-bottom: 1px solid $border-color;

  .profile-name {
    margin: $spacing-md 0 $spacing-xs;
    font-size: $font-size-lg;
    color: $text-primary;
  }

  .profile-role {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding-top: $spacing-lg;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .stat-value {
      font-size: $font-size-xl;
      font-weight: 600;
      color: $primary-color;
    }

    .stat-label {
      font-size: $font-size-xs;
      color: $text-muted;
    }
  }
}

.info-card,
.password-card {
  background: $bg-card;
  border: 1px solid $border-color;

  :deep(.el-card__header) {
    border-bottom: 1px solid $border-color;
    padding: $spacing-md $spacing-lg;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    color: $text-primary;
  }
}

.profile-form,
.password-form {
  padding: $spacing-md 0;

  :deep(.el-form-item__label) {
    color: $text-secondary;
  }

  .el-input {
    max-width: 300px;
  }
}
</style>
