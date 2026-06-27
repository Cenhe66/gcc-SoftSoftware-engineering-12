// 环境配置
const ENV = {
  DEV: 'development',
  PROD: 'production'
}

// 当前环境（根据需要修改）
const CURRENT_ENV = ENV.DEV

// 环境对应的API基础地址
const ENV_CONFIG = {
  [ENV.DEV]: {
    BASE_URL: 'http://localhost:8080',
    WS_URL: 'ws://localhost:8080/ws/parking'
  },
  [ENV.PROD]: {
    BASE_URL: 'https://your-production-domain.com',
    WS_URL: 'wss://your-production-domain.com/ws/parking'
  }
}

// API基础地址（根据当前环境自动选择）
const BASE_URL = ENV_CONFIG[CURRENT_ENV].BASE_URL

// WebSocket地址
const WS_URL = ENV_CONFIG[CURRENT_ENV].WS_URL

// 请求超时时间（毫秒）
const TIMEOUT = 30000

// 分页默认参数
const PAGE_DEFAULT = {
  pageNum: 1,
  pageSize: 10
}

// 存储键名
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  LOCATION: 'location'
}

// 页面路径
const PAGES = {
  INDEX: '/pages/index/index',
  LOGIN: '/pages/login/login',
  USER_CENTER: '/pages/user-center/user-center',
  PARKING_DETAIL: '/pages/parking-detail/parking-detail',
  RESERVATION: '/pages/reservation/reservation',
  RESERVATION_LIST: '/pages/reservation-list/reservation-list',
  PARKING_RECORD: '/pages/parking-record/parking-record',
  PAYMENT: '/pages/payment/payment',
  SHARE_SPACE: '/pages/share-space/share-space',
  SHARE_RECORD: '/pages/share-record/share-record',
  MOVE_CAR: '/pages/move-car/move-car',
  MOVE_CAR_MESSAGE: '/pages/move-car-message/move-car-message',
  AR_FIND_CAR: '/pages/ar-find-car/ar-find-car',
  HEALTH_CHECK: '/pages/health-check/health-check'
}

// 车位状态
const SPACE_STATUS = {
  FREE: 0,
  OCCUPIED: 1,
  RESERVED: 2,
  SHARED: 3,
  DISABLED: 4
}

const SPACE_STATUS_TEXT = {
  [SPACE_STATUS.FREE]: '空闲',
  [SPACE_STATUS.OCCUPIED]: '占用',
  [SPACE_STATUS.RESERVED]: '已预约',
  [SPACE_STATUS.SHARED]: '共享中',
  [SPACE_STATUS.DISABLED]: '禁用'
}

const SPACE_STATUS_COLOR = {
  [SPACE_STATUS.FREE]: '#07c160',
  [SPACE_STATUS.OCCUPIED]: '#ee0a24',
  [SPACE_STATUS.RESERVED]: '#ff976a',
  [SPACE_STATUS.SHARED]: '#1989fa',
  [SPACE_STATUS.DISABLED]: '#969799'
}

// 预约状态
const RESERVATION_STATUS = {
  PENDING: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  CANCELLED: 3,
  EXPIRED: 4
}

const RESERVATION_STATUS_TEXT = {
  [RESERVATION_STATUS.PENDING]: '待使用',
  [RESERVATION_STATUS.ACTIVE]: '使用中',
  [RESERVATION_STATUS.COMPLETED]: '已完成',
  [RESERVATION_STATUS.CANCELLED]: '已取消',
  [RESERVATION_STATUS.EXPIRED]: '已过期'
}

// 支付状态
const PAYMENT_STATUS = {
  UNPAID: 0,
  PAID: 1,
  REFUNDED: 2
}

const PAYMENT_STATUS_TEXT = {
  [PAYMENT_STATUS.UNPAID]: '未支付',
  [PAYMENT_STATUS.PAID]: '已支付',
  [PAYMENT_STATUS.REFUNDED]: '已退款'
}

// 共享状态
const SHARE_STATUS = {
  ACTIVE: 0,
  PAUSED: 1,
  ENDED: 2
}

const SHARE_STATUS_TEXT = {
  [SHARE_STATUS.ACTIVE]: '共享中',
  [SHARE_STATUS.PAUSED]: '已暂停',
  [SHARE_STATUS.ENDED]: '已结束'
}

// 健康检测状态
const HEALTH_STATUS = {
  NORMAL: 0,
  ABNORMAL: 1
}

const HEALTH_STATUS_TEXT = {
  [HEALTH_STATUS.NORMAL]: '正常',
  [HEALTH_STATUS.ABNORMAL]: '异常'
}

// 快捷挪车消息
const MOVE_CAR_MESSAGES = [
  '您的车辆挡住了我的车，请挪一下',
  '我需要出行，麻烦挪一下车',
  '您的车停在了我的车位上',
  '请尽快挪车，谢谢配合',
  '临时停车，请见谅，麻烦挪一下'
]

// WebSocket消息类型
const WS_MESSAGE_TYPE = {
  HEATMAP_UPDATE: 'HEATMAP_UPDATE',
  SPACE_STATUS_CHANGE: 'SPACE_STATUS_CHANGE',
  MOVE_CAR_MESSAGE: 'MOVE_CAR_MESSAGE',
  RESERVATION_REMIND: 'RESERVATION_REMIND',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS'
}

// 微信订阅消息模板ID（需在小程序后台申请）
const SUBSCRIBE_TEMPLATES = {
  MOVE_CAR: 'your-move-car-template-id'
}

module.exports = {
  BASE_URL,
  WS_URL,
  TIMEOUT,
  PAGE_DEFAULT,
  STORAGE_KEYS,
  PAGES,
  SPACE_STATUS,
  SPACE_STATUS_TEXT,
  SPACE_STATUS_COLOR,
  RESERVATION_STATUS,
  RESERVATION_STATUS_TEXT,
  PAYMENT_STATUS,
  PAYMENT_STATUS_TEXT,
  SHARE_STATUS,
  SHARE_STATUS_TEXT,
  HEALTH_STATUS,
  HEALTH_STATUS_TEXT,
  MOVE_CAR_MESSAGES,
  WS_MESSAGE_TYPE,
  SUBSCRIBE_TEMPLATES
}
