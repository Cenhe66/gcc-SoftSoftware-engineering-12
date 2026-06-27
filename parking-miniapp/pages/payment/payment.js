const { get, post } = require('../../utils/request')
const { showToast, showLoading, hideLoading, formatDate } = require('../../utils/util')

Page({
  data: {
    amount: '0.00',
    paymentType: 'parking',  // parking 或 reservation
    reservationId: null,
    recordId: null,
    orderInfo: {
      parkingName: '',
      spaceCode: '',
      startTime: '',
      endTime: '',
      duration: '',
      orderNo: '',
      fee: '0.00',
      discount: '0.00'
    },
    selectedMethod: 'wechat',
    balance: '0.00',
    canPay: true
  },

  onLoad(options) {
    const { recordId, reservationId, amount, type } = options
    
    // 先设置金额
    if (amount) {
      this.setData({ amount })
    }
    
    // 设置支付类型（优先使用URL参数中的type）
    if (type) {
      this.setData({ paymentType: type })
    }
    
    // 设置业务ID并加载详情
    if (recordId && recordId !== 'undefined') {
      this.setData({ recordId })
      // 如果没有指定type，默认为停车费
      if (!type) {
        this.setData({ paymentType: 'parking' })
      }
      this.loadParkingRecord(recordId)
    } else if (reservationId && reservationId !== 'undefined') {
      this.setData({ reservationId })
      // 如果没有指定type，默认为预约费
      if (!type) {
        this.setData({ paymentType: 'reservation' })
      }
      this.loadReservation(reservationId)
    }

    this.loadBalance()
  },

  // 加载停车记录
  loadParkingRecord(recordId) {
    get(`/api/parking-record/detail/${recordId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const data = res.data
          this.setData({
            orderInfo: {
              parkingName: data.parkingName || '未知停车场',
              spaceCode: data.spaceCode || '-',
              startTime: formatDate(data.entryTime, 'YYYY-MM-DD HH:mm'),
              endTime: data.exitTime ? formatDate(data.exitTime, 'YYYY-MM-DD HH:mm') : '未离场',
              duration: data.durationMinutes ? `${Math.floor(data.durationMinutes / 60)}小时${data.durationMinutes % 60}分钟` : '-',
              orderNo: `PR${recordId}`,
              fee: data.fee || '0.00',
              discount: '0.00'
            },
            amount: data.fee || '0.00'
          })
        }
      })
      .catch(err => {
        console.error('加载停车记录失败:', err)
        showToast('加载失败')
      })
  },

  // 加载预约信息
  loadReservation(reservationId) {
    get(`/api/reservation/detail/${reservationId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const data = res.data
          
          // 根据支付类型显示不同的信息
          if (this.data.paymentType === 'parking') {
            // 停车费支付：显示入场时间、离场时间、停车时长
            const entryTime = data.entryTime ? formatDate(data.entryTime, 'YYYY-MM-DD HH:mm') : '-'
            const exitTime = data.exitTime ? formatDate(data.exitTime, 'YYYY-MM-DD HH:mm') : '-'
            
            // 计算停车时长
            let duration = '-'
            if (data.entryTime && data.exitTime) {
              const entry = new Date(data.entryTime)
              const exit = new Date(data.exitTime)
              const minutes = Math.floor((exit - entry) / (1000 * 60))
              const hours = Math.floor(minutes / 60)
              const mins = minutes % 60
              duration = hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
            }
            
            this.setData({
              orderInfo: {
                parkingName: data.parkingName || '未知停车场',
                spaceCode: data.spaceCode || '-',
                entryTime: entryTime,
                exitTime: exitTime,
                duration: duration,
                orderNo: `PK${reservationId}`,
                fee: data.parkingFee || this.data.amount || '0.00',
                parkingFee: data.parkingFee || '0.00',
                discount: '0.00'
              },
              amount: data.parkingFee || this.data.amount || '0.00'
            })
          } else {
            // 预约费支付：显示预约开始时间、结束时间、预约时长
            const start = new Date(data.startTime)
            const end = new Date(data.endTime)
            const hours = Math.ceil((end - start) / (1000 * 60 * 60))
            
            this.setData({
              orderInfo: {
                parkingName: data.parkingName || '未知停车场',
                spaceCode: data.spaceCode || '-',
                entryTime: formatDate(data.startTime, 'YYYY-MM-DD HH:mm'),
                exitTime: formatDate(data.endTime, 'YYYY-MM-DD HH:mm'),
                duration: `${hours}小时`,
                orderNo: `RS${reservationId}`,
                fee: data.reserveFee || this.data.amount || '0.00',
                parkingFee: data.reserveFee || '0.00',
                discount: '0.00'
              },
              amount: data.reserveFee || this.data.amount || '0.00'
            })
          }
        }
      })
      .catch(err => {
        console.error('加载预约信息失败:', err)
        showToast('加载失败')
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
    
    // 检查余额是否足够
    if (method === 'balance' && parseFloat(this.data.balance) < parseFloat(this.data.amount)) {
      this.setData({ canPay: false })
    } else {
      this.setData({ canPay: true })
    }
  },

  // 确认支付
  confirmPay() {
    const { selectedMethod, amount, orderInfo, reservationId, recordId, paymentType } = this.data

    if (!this.data.canPay) {
      showToast('余额不足，请选择其他支付方式')
      return
    }

    showLoading('支付中...')

    // 构建支付请求参数
    // bizId: 预约费和停车费都使用 reservationId（因为停车费是基于预约的）
    const bizId = reservationId ? parseInt(reservationId) : (recordId ? parseInt(recordId) : null)
    
    if (!bizId) {
      hideLoading()
      showToast('订单信息不完整')
      return
    }

    const payData = {
      userId: wx.getStorageSync('userInfo')?.id || 1,
      bizType: paymentType === 'reservation' ? 2 : 1,  // 1-停车费 2-预约费
      bizId: bizId,
      amount: parseFloat(amount),
      payChannel: selectedMethod === 'wechat' ? 1 : 2  // 1-微信支付 2-余额
    }

    post('/api/payment/create', payData)
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          const paymentOrder = res.data
          if (selectedMethod === 'wechat') {
            // 调用微信支付
            this.callWechatPay(paymentOrder)
          } else {
            // 余额支付已在后端处理完成，直接成功
            this.onPaySuccess()
          }
        } else {
          showToast(res.message || '支付失败')
        }
      })
      .catch(err => {
        hideLoading()
        console.error('支付失败:', err)
        showToast(err.message || '支付失败')
      })
  },

  // 调用微信支付
  callWechatPay(paymentOrder) {
    // 检查是否有微信支付参数（真实微信支付环境）
    if (paymentOrder && paymentOrder.timeStamp) {
      wx.requestPayment({
        timeStamp: paymentOrder.timeStamp,
        nonceStr: paymentOrder.nonceStr,
        package: paymentOrder.package,
        signType: paymentOrder.signType || 'MD5',
        paySign: paymentOrder.paySign,
        success: () => {
          // 微信支付成功，调用支付回调接口
          this.callPayCallback(paymentOrder.orderNo)
        },
        fail: (err) => {
          console.error('微信支付失败:', err)
          showToast('支付取消')
        }
      })
    } else {
      // 模拟环境下没有真实支付参数，模拟支付成功并调用回调
      console.log('模拟支付成功，调用支付回调')
      this.callPayCallback(paymentOrder.orderNo)
    }
  },

  // 调用支付回调接口
  callPayCallback(orderNo) {
    showLoading('处理支付结果...')
    post('/api/payment/callback', {
      orderNo: orderNo,
      transactionId: 'MOCK_' + Date.now()  // 模拟交易号
    })
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          this.onPaySuccess()
        } else {
          showToast(res.message || '支付处理失败')
        }
      })
      .catch(err => {
        hideLoading()
        console.error('支付回调失败:', err)
        showToast(err.message || '支付处理失败')
      })
  },

  // 支付成功
  onPaySuccess() {
    showToast('支付成功', 'success')
    setTimeout(() => {
      // 返回预约列表
      wx.switchTab({
        url: '/pages/reservation-list/reservation-list'
      })
    }, 1500)
  }
})