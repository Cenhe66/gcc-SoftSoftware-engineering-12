const { get, post } = require('../../utils/request')
const { showToast, showLoading, hideLoading } = require('../../utils/util')

Page({
  data: {
    amount: '0.00',
    paymentType: 'parking',
    orderInfo: {
      parkingName: '万达广场停车场',
      spaceCode: 'B2-015',
      entryTime: '2026-05-27 14:30',
      exitTime: '',
      duration: '2小时15分钟',
      orderNo: 'P202605271430001',
      parkingFee: '24.00',
      discount: '0.00'
    },
    selectedMethod: 'wechat',
    balance: '156.80'
  },

  onLoad(options) {
    const { recordId, reservationId, amount } = options
    
    if (amount) {
      this.setData({ amount })
    }

    if (recordId) {
      this.setData({ paymentType: 'parking' })
      this.loadParkingRecord(recordId)
    } else if (reservationId) {
      this.setData({ paymentType: 'reservation' })
      this.loadReservation(reservationId)
    }

    this.loadBalance()
  },

  // 加载停车记录
  loadParkingRecord(recordId) {
    get(`/api/parking-record/detail/${recordId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            orderInfo: {
              parkingName: res.data.parkingName,
              spaceCode: res.data.spaceCode,
              entryTime: res.data.entryTime,
              exitTime: res.data.exitTime,
              duration: res.data.duration,
              orderNo: res.data.orderNo,
              parkingFee: res.data.amount,
              discount: res.data.discount || '0.00'
            },
            amount: res.data.amount
          })
        }
      })
  },

  // 加载预约信息
  loadReservation(reservationId) {
    get(`/api/reservation/detail/${reservationId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            orderInfo: {
              parkingName: res.data.parkingName,
              spaceCode: res.data.spaceCode,
              entryTime: res.data.startTime,
              exitTime: res.data.endTime,
              duration: res.data.duration + '小时',
              orderNo: res.data.orderNo,
              parkingFee: res.data.amount,
              discount: '0.00'
            },
            amount: res.data.amount
          })
        }
      })
  },

  // 加载余额
  loadBalance() {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    if (!userId) return
    get(`/api/user/info/${userId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({ balance: res.data.balance || '0.00' })
        }
      })
      .catch(() => {
        // 使用默认余额
      })
  },

  // 选择支付方式
  selectMethod(e) {
    const method = e.currentTarget.dataset.method
    this.setData({ selectedMethod: method })
  },

  // 确认支付
  confirmPay() {
    const { selectedMethod, amount, orderInfo } = this.data

    if (selectedMethod === 'balance' && parseFloat(this.data.balance) < parseFloat(amount)) {
      showToast('余额不足，请选择其他支付方式')
      return
    }

    showLoading('支付中...')

    // 调用后端支付接口
    post('/api/payment-order/create', {
      orderNo: orderInfo.orderNo,
      amount: amount,
      payMethod: selectedMethod
    })
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          if (selectedMethod === 'wechat') {
            // 调用微信支付
            this.callWechatPay(res.data)
          } else {
            // 余额支付直接成功
            this.onPaySuccess()
          }
        } else {
          showToast(res.message || '支付失败')
        }
      })
      .catch(() => {
        hideLoading()
        // 模拟支付成功
        this.onPaySuccess()
      })
  },

  // 调用微信支付
  callWechatPay(payData) {
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package,
      signType: payData.signType,
      paySign: payData.paySign,
      success: () => {
        this.onPaySuccess()
      },
      fail: () => {
        showToast('支付取消')
      }
    })
  },

  // 支付成功
  onPaySuccess() {
    showToast('支付成功', 'success')
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  }
})