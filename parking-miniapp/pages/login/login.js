const { post } = require('../../utils/request')
const { showToast, showLoading, hideLoading } = require('../../utils/util')

Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    agreed: false,
    canLogin: false
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (token) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  // 手机号输入
  onPhoneInput(e) {
    const phone = e.detail.value
    this.setData({ 
      phone,
      canLogin: this.checkCanLogin(phone, this.data.code, this.data.agreed)
    })
  },

  // 验证码输入
  onCodeInput(e) {
    const code = e.detail.value
    this.setData({ 
      code,
      canLogin: this.checkCanLogin(this.data.phone, code, this.data.agreed)
    })
  },

  // 检查是否可以登录
  checkCanLogin(phone, code, agreed) {
    return /^1[3-9]\d{9}$/.test(phone) && /^\d{6}$/.test(code) && agreed
  },

  // 切换协议同意状态
  toggleAgreement() {
    const agreed = !this.data.agreed
    this.setData({ 
      agreed,
      canLogin: this.checkCanLogin(this.data.phone, this.data.code, agreed)
    })
  },

  // 发送验证码
  sendCode() {
    const { phone } = this.data
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast('请输入正确的手机号')
      return
    }

    showLoading('发送中...')
    
    // 模拟发送验证码
    setTimeout(() => {
      hideLoading()
      showToast('验证码已发送')
      this.startCountdown()
    }, 1000)
  },

  // 开始倒计时
  startCountdown() {
    this.setData({ countdown: 60 })
    this.timer = setInterval(() => {
      const countdown = this.data.countdown - 1
      if (countdown <= 0) {
        clearInterval(this.timer)
      }
      this.setData({ countdown })
    }, 1000)
  },

  // 手机号登录
  login() {
    const { phone, code } = this.data
    if (!this.data.canLogin) return

    showLoading('登录中...')

    // 调用后端登录接口（模拟微信登录）
    post('/api/user/login', {
      phone,
      code,
      loginType: 1
    }).then(res => {
      hideLoading()
      if (res.code === 200 && res.data) {
        // 保存登录信息
        getApp().setToken(res.data.token || 'mock_token_' + Date.now())
        getApp().setUserInfo(res.data.user || { phone, nickName: '用户' + phone.slice(-4) })
        
        showToast('登录成功', 'success')
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1500)
      } else {
        showToast(res.message || '登录失败')
      }
    }).catch(err => {
      hideLoading()
      console.error('登录失败:', err)
      showToast('登录失败，请重试')
    })
  },

  // 微信登录
  wxLogin() {
    if (!this.data.agreed) {
      showToast('请先同意用户协议和隐私政策')
      return
    }

    showLoading('登录中...')

    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端登录接口
          post('/api/user/login', {
            wxCode: res.code,
            loginType: 2
          }).then(result => {
            hideLoading()
            if (result.code === 200 && result.data) {
              getApp().setToken(result.data.token || 'mock_token_' + Date.now())
              getApp().setUserInfo(result.data.user || { nickName: '微信用户' })
              
              showToast('登录成功', 'success')
              setTimeout(() => {
                wx.switchTab({ url: '/pages/index/index' })
              }, 1500)
            } else {
              showToast(result.message || '登录失败')
            }
          }).catch(err => {
            hideLoading()
            console.error('登录失败:', err)
            // 模拟登录成功（用于测试）
            this.mockLogin()
          })
        } else {
          hideLoading()
          showToast('微信登录失败')
        }
      },
      fail: () => {
        hideLoading()
        showToast('微信登录失败')
      }
    })
  },

  // 模拟登录（测试用）
  mockLogin() {
    const mockUser = {
      id: 1,
      nickName: '测试用户',
      phone: '13800138000',
      avatar: ''
    }
    const mockToken = 'mock_token_' + Date.now()
    
    getApp().setToken(mockToken)
    getApp().setUserInfo(mockUser)
    
    showToast('登录成功', 'success')
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' })
    }, 1500)
  },

  // 显示用户协议
  showUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议内容...',
      showCancel: false
    })
  },

  // 显示隐私政策
  showPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策内容...',
      showCancel: false
    })
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
})
