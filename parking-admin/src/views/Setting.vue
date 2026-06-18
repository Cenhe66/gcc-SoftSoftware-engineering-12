<template>
  <div class="page-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <el-card class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>基本设置</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        label-width="120px"
        class="setting-form"
      >
        <el-form-item label="系统名称">
          <el-input v-model="formData.systemName" class="form-input" />
        </el-form-item>
        <el-form-item label="系统Logo">
          <div class="logo-upload">
            <el-icon :size="48" color="#409EFF"><Picture /></el-icon>
            <span>点击更换Logo</span>
          </div>
        </el-form-item>
        <el-form-item label="公司名称">
          <el-input v-model="formData.companyName" class="form-input" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.contactPhone" class="form-input" />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="formData.contactEmail" class="form-input" />
        </el-form-item>
        <el-form-item label="系统描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            class="form-input"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>停车设置</span>
        </div>
      </template>

      <el-form
        :model="parkingSettings"
        label-width="120px"
        class="setting-form"
      >
        <el-form-item label="免费时长">
          <el-input-number
            v-model="parkingSettings.freeDuration"
            :min="0"
            :max="60"
          />
          <span class="form-tip">分钟</span>
        </el-form-item>
        <el-form-item label="计费周期">
          <el-input-number
            v-model="parkingSettings.billingCycle"
            :min="1"
            :max="60"
          />
          <span class="form-tip">分钟/次</span>
        </el-form-item>
        <el-form-item label="首小时费用">
          <el-input-number
            v-model="parkingSettings.firstHourFee"
            :min="0"
            :precision="2"
          />
          <span class="form-tip">元</span>
        </el-form-item>
        <el-form-item label="超时费用">
          <el-input-number
            v-model="parkingSettings.overtimeFee"
            :min="0"
            :precision="2"
          />
          <span class="form-tip">元/小时</span>
        </el-form-item>
        <el-form-item label="日封顶费用">
          <el-input-number
            v-model="parkingSettings.dailyCap"
            :min="0"
            :precision="2"
          />
          <span class="form-tip">元</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveParkingSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>通知设置</span>
        </div>
      </template>

      <el-form
        :model="notificationSettings"
        label-width="120px"
        class="setting-form"
      >
        <el-form-item label="邮件通知">
          <el-switch v-model="notificationSettings.emailEnabled" />
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="notificationSettings.smsEnabled" />
        </el-form-item>
        <el-form-item label="系统通知">
          <el-switch v-model="notificationSettings.systemEnabled" />
        </el-form-item>
        <el-form-item label="通知频率">
          <el-select v-model="notificationSettings.frequency" class="form-select">
            <el-option label="实时" value="realtime" />
            <el-option label="每日汇总" value="daily" />
            <el-option label="每周汇总" value="weekly" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveNotificationSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>数据备份</span>
        </div>
      </template>

      <div class="backup-section">
        <div class="backup-info">
          <p>最后备份时间：<span>2026-05-27 02:00:00</span></p>
          <p>备份文件大小：<span>256 MB</span></p>
        </div>
        <div class="backup-actions">
          <el-button type="primary">
            <el-icon><Download /></el-icon>
            立即备份
          </el-button>
          <el-button>
            <el-icon><Upload /></el-icon>
            恢复数据
          </el-button>
          <el-button type="danger">
            <el-icon><Delete /></el-icon>
            清理旧备份
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 基本设置
const formRef = ref(null)
const formData = ref({
  systemName: '智慧停车管理系统',
  companyName: '智慧停车科技有限公司',
  contactPhone: '400-888-8888',
  contactEmail: 'contact@parking.com',
  description: '专业的智慧停车管理系统，提供停车场管理、停车记录、用户管理等功能。'
})

// 停车设置
const parkingSettings = ref({
  freeDuration: 15,
  billingCycle: 30,
  firstHourFee: 5.00,
  overtimeFee: 3.00,
  dailyCap: 50.00
})

// 通知设置
const notificationSettings = ref({
  emailEnabled: true,
  smsEnabled: false,
  systemEnabled: true,
  frequency: 'daily'
})

// 保存设置
const handleSave = async () => {
  ElMessage.success('基本设置保存成功')
}

const handleSaveParkingSettings = async () => {
  ElMessage.success('停车设置保存成功')
}

const handleSaveNotificationSettings = async () => {
  ElMessage.success('通知设置保存成功')
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

.setting-card {
  background: $bg-card;
  border: 1px solid $border-color;
  margin-bottom: $spacing-lg;

  :deep(.el-card__header) {
    border-bottom: 1px solid $border-color;
    padding: $spacing-md $spacing-lg;
  }

  .card-header {
    font-weight: 500;
    color: $text-primary;
  }
}

.setting-form {
  padding: $spacing-md 0;

  :deep(.el-form-item__label) {
    color: $text-secondary;
  }
}

.form-input {
  max-width: 400px;
}

.form-select {
  width: 200px;
}

.form-tip {
  margin-left: $spacing-sm;
  color: $text-muted;
  font-size: $font-size-sm;
}

.logo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border: 2px dashed $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: $primary-color;
    background: rgba(64, 158, 255, 0.1);
  }

  span {
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.backup-section {
  padding: $spacing-md 0;
}

.backup-info {
  margin-bottom: $spacing-lg;

  p {
    margin: $spacing-sm 0;
    color: $text-secondary;
    font-size: $font-size-sm;

    span {
      color: $text-primary;
      font-weight: 500;
    }
  }
}

.backup-actions {
  display: flex;
  gap: $spacing-md;
}
</style>
