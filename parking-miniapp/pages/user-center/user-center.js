const { get } = require('../../utils/request')
const { showToast, showConfirm } = require('../../utils/util')

Page({
  data: {
    isLogin: false,
    userInfo: {},
    stats: {
      parkingCount: 0,
      reservationCount: 0,
      shareCount: 0,
      totalEarnings: '0.00'
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
    if (this.data.isLogin) {
      this.loadUserStats()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    this.setData({
      isLogin: !!token,
      userInfo: userInfo || {}
    })
  },

  // 加载用户统计数据
  loadUserStats() {
    // 这里可以调用后端API获取统计数据
    // 目前使用模拟数据
    this.setData({
      stats: {
        parkingCount: 12,
        reservationCount: 5,
        shareCount: 3,
        totalEarnings: '156.80'
      }
    })
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转到停车记录
  goToParkingRecord() {
    if (!this.checkLogin()) return
    wx.switchTab({
      url: '/pages/parking-record/parking-record'
    })
  },

  // 跳转到预约列表
  goToReservation() {
    if (!this.checkLogin()) return
    wx.switchTab({
      url: '/pages/reservation-list/reservation-list'
    })
  },

  // 跳转到共享记录
  goToShareRecord() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/share-record/share-record'
    })
  },

  // 跳转到共享车位
  goToShareSpace() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/share-space/share-space'
    })
  },

  // 跳转到共享账单
  goToShareBill() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/share-bill/share-bill'
    })
  },

  // 跳转到健康检测
  goToHealthCheck() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/health-check/health-check'
    })
  },

  // 跳转到访客授权
  goToVisitorAuth() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/visitor-auth/visitor-auth'
    })
  },

  // 联系客服
  contactCustomerService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '4001234567'
          })
        }
      }
    })
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '智能停车管理系统 v1.0.0\n\n基于SpringBoot + 微信小程序开发\n支持预约停车、车位共享、AR寻车等功能',
      showCancel: false
    })
  },

  // 退出登录
  logout() {
    showConfirm('确认退出', '确定要退出登录吗？').then(confirmed => {
      if (confirmed) {
        // 清除登录信息
        getApp().clearLoginInfo()
        
        this.setData({
          isLogin: false,
          userInfo: {},
          stats: {
            parkingCount: 0,
            reservationCount: 0,
            shareCount: 0,
            totalEarnings: '0.00'
          }
        })
        
        showToast('已退出登录')
      }
    })
  },

  // 检查登录
  checkLogin() {
    if (!this.data.isLogin) {
      showToast('请先登录')
      setTimeout(() => {
        this.goToLogin()
      }, 1000)
      return false
    }
    return true
  }
})
