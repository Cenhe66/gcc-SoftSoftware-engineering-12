const { post } = require('../../utils/request')
const { showToast, showLoading, hideLoading } = require('../../utils/util')

Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    agreed: false,
    canLogin: false,
    testAccounts: [
      { openid: 'test_openid_001', nickname: '测试用户-张三', phone: '13800138001', avatarUrl: '' },
      { openid: 'test_openid_002', nickname: '测试用户-李四', phone: '13800138002', avatarUrl: '' },
      { openid: 'test_openid_003', nickname: '测试用户-王五', phone: '13800138003', avatarUrl: '' }
    ]
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
        getApp().setToken(res.data.token)
        getApp().setUserInfo({
          id: res.data.userId,
          nickName: res.data.nickname,
          avatarUrl: res.data.avatarUrl,
          userType: res.data.userType,
          phone: phone
        })

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
              getApp().setToken(result.data.token)
              getApp().setUserInfo({
                id: result.data.userId,
                nickName: result.data.nickname,
                avatarUrl: result.data.avatarUrl,
                userType: result.data.userType
              })

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
            showToast('登录失败，请重试')
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

  // 显示测试账号选择
  showTestAccounts() {
    const accounts = this.data.testAccounts
    wx.showActionSheet({
      itemList: accounts.map(item => item.nickname),
      success: (res) => {
        const account = accounts[res.tapIndex]
        this.testLogin(account)
      }
    })
  },

  // 测试账号登录
  testLogin(account) {
    showLoading('登录中...')
    post('/api/user/login', {
      openid: account.openid,
      nickname: account.nickname,
      avatarUrl: account.avatarUrl || ''
    }).then(res => {
      hideLoading()
      if (res.code === 200 && res.data) {
        getApp().setToken(res.data.token)
        getApp().setUserInfo({
          id: res.data.userId,
          nickName: res.data.nickname,
          avatarUrl: res.data.avatarUrl,
          userType: res.data.userType,
          phone: account.phone
        })
        showToast('登录成功', 'success')
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1000)
      } else {
        showToast(res.message || '登录失败')
      }
    }).catch(err => {
      hideLoading()
      console.error('测试登录失败:', err)
      showToast('登录失败')
    })
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
})
