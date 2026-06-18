// 格式化日期
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

// 格式化金额
const formatMoney = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return parseFloat(amount).toFixed(2)
}

// 格式化距离
const formatDistance = (distance) => {
  if (!distance) return ''
  if (distance < 1000) {
    return Math.round(distance) + 'm'
  }
  return (distance / 1000).toFixed(1) + 'km'
}

// 计算时间差（分钟）
const getTimeDiff = (startTime, endTime) => {
  const start = new Date(startTime).getTime()
  const end = endTime ? new Date(endTime).getTime() : Date.now()
  return Math.floor((end - start) / (1000 * 60))
}

// 格式化时长
const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0分钟'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
  }
  return `${mins}分钟`
}

// 倒计时格式化
const formatCountdown = (seconds) => {
  if (!seconds || seconds <= 0) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 防抖函数
const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
const throttle = (fn, interval = 300) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 显示提示
const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

// 显示加载
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

// 隐藏加载
const hideLoading = () => {
  wx.hideLoading()
}

// 显示确认对话框
const showConfirm = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

// 显示模态对话框（带回调）
const showModal = (title, content, confirmCallback, cancelCallback) => {
  wx.showModal({
    title,
    content,
    success: (res) => {
      if (res.confirm) {
        confirmCallback && confirmCallback()
      } else if (res.cancel) {
        cancelCallback && cancelCallback()
      }
    }
  })
}

// 页面跳转
const navigateTo = (url, params = {}) => {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  const fullUrl = query ? `${url}?${query}` : url
  
  wx.navigateTo({
    url: fullUrl,
    fail: () => {
      wx.redirectTo({ url: fullUrl })
    }
  })
}

// 返回上一页
const navigateBack = (delta = 1) => {
  wx.navigateBack({ delta })
}

// 重定向页面
const redirectTo = (url, params = {}) => {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  const fullUrl = query ? `${url}?${query}` : url
  
  wx.redirectTo({ url: fullUrl })
}

// 切换到Tab页面
const switchTab = (url) => {
  wx.switchTab({ url })
}

// 获取页面参数
const getPageParams = (options = {}) => {
  return options
}

// 检查登录状态
const checkLogin = () => {
  const token = wx.getStorageSync('token')
  if (!token) {
    navigateTo('/pages/login/login')
    return false
  }
  return true
}

// 计算两个坐标点距离（米）
const getDistance = (lat1, lng1, lat2, lng2) => {
  const radLat1 = lat1 * Math.PI / 180
  const radLat2 = lat2 * Math.PI / 180
  const a = radLat1 - radLat2
  const b = lng1 * Math.PI / 180 - lng2 * Math.PI / 180
  const s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
  const EARTH_RADIUS = 6378137
  return Math.round(s * EARTH_RADIUS)
}

// 生成随机字符串
const randomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

module.exports = {
  formatDate,
  formatMoney,
  formatDistance,
  getTimeDiff,
  formatDuration,
  formatCountdown,
  debounce,
  throttle,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  showModal,
  navigateTo,
  navigateBack,
  redirectTo,
  switchTab,
  getPageParams,
  checkLogin,
  getDistance,
  randomString
}
