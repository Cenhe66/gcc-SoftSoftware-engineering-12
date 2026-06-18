App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:8080',
    wsUrl: 'ws://localhost:8080/ws/parking',
    location: null,
    selectParkingMode: false // 停车场选择模式标记
  },

  onLaunch() {
    console.log('App Launch')
    this.checkLoginStatus()
    this.getLocation()
  },

  onShow() {
    console.log('App Show')
  },

  onHide() {
    console.log('App Hide')
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
