const { BASE_URL, WS_URL } = require('./utils/constants')

App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: BASE_URL,
    wsUrl: WS_URL,
    location: null,
    selectParkingMode: false, // 停车场选择模式标记
    privacyAuthorized: false // 隐私协议授权状态
  },

  onLaunch() {
    console.log('App Launch')
    this.checkLoginStatus()
    this.initPrivacy()
  },

  onShow() {
    console.log('App Show')
  },

  onHide() {
    console.log('App Hide')
  },

  // 初始化隐私协议
  initPrivacy() {
    // 检查隐私协议授权状态
    if (wx.getPrivacySetting) {
      wx.getPrivacySetting({
        success: res => {
          console.log('隐私协议状态:', res)
          if (res.needAuthorization) {
            // 需要用户授权隐私协议
            this.globalData.privacyAuthorized = false
          } else {
            // 用户已授权或不需要授权
            this.globalData.privacyAuthorized = true
            this.getLocation()
          }
        },
        fail: err => {
          console.log('获取隐私协议状态失败:', err)
          // 如果获取失败，尝试直接获取位置
          this.getLocation()
        }
      })
    } else {
      // 低版本基础库，直接获取位置
      this.getLocation()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
    }
  },

  // 获取用户位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.globalData.location = {
          latitude: res.latitude,
          longitude: res.longitude
        }
      },
      fail: (err) => {
        console.log('获取位置失败', err)
      }
    })
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 设置token
  setToken(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },

  // 清除登录信息
  clearLoginInfo() {
    this.globalData.userInfo = null
    this.globalData.token = null
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('token')
  }
})
