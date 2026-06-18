const { post, get } = require('../../utils/request')
const { showToast, showLoading, hideLoading, showModal, formatDate } = require('../../utils/util')

Page({
  data: {
    selectedParking: {},
    visitorName: '',
    visitorPlate: '',
    visitorPhone: '',
    validDate: '',
    minDate: '',
    maxDate: '',
    durationOptions: ['2小时', '4小时', '8小时', '12小时', '24小时'],
    durationIndex: 0,
    remark: '',
    canGenerate: false,
    showModal: false,
    authCode: '',
    expireTime: ''
  },

  onLoad() {
    const now = new Date()
    const today = formatDate(now, 'YYYY-MM-DD')
    const maxDate = formatDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD')

    this.setData({
      validDate: today,
      minDate: today,
      maxDate: maxDate
    })
  },

  // 选择停车场
  selectParking() {
    wx.navigateTo({
      url: '/pages/parking-select/parking-select'
    })
  },

  // 输入访客姓名
  onVisitorNameInput(e) {
    this.setData({ visitorName: e.detail.value })
    this.checkCanGenerate()
  },

  // 输入车牌号
  onVisitorPlateInput(e) {
    this.setData({ visitorPlate: e.detail.value.toUpperCase() })
    this.checkCanGenerate()
  },

  // 输入手机号
  onVisitorPhoneInput(e) {
    this.setData({ visitorPhone: e.detail.value })
    this.checkCanGenerate()
  },

  // 选择日期
  onDateChange(e) {
    this.setData({ validDate: e.detail.value })
  },

  // 选择时长
  onDurationChange(e) {
    this.setData({ durationIndex: e.detail.value })
  },

  // 输入备注
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  // 检查是否可以生成
  checkCanGenerate() {
    const { selectedParking, visitorName, visitorPlate, visitorPhone } = this.data
    const canGenerate = selectedParking.id &&
                        visitorName.length >= 2 &&
                        visitorPlate.length >= 7 &&
                        /^1[3-9]\d{9}$/.test(visitorPhone)
    this.setData({ canGenerate })
  },

  // 验证表单
  validateForm() {
    const { selectedParking, visitorName, visitorPlate, visitorPhone } = this.data
    const errors = []

    if (!selectedParking.id) {
      errors.push('请选择停车场')
    }

    if (!visitorName || visitorName.length < 2) {
      errors.push('访客姓名至少2个字符')
    }

    // 车牌号验证（支持新能源车牌）
    const plateRegex = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/
    if (!visitorPlate || !plateRegex.test(visitorPlate)) {
      errors.push('请输入正确的车牌号码')
    }

    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!visitorPhone || !phoneRegex.test(visitorPhone)) {
      errors.push('请输入正确的手机号码')
    }

    return errors
  },

  // 生成授权码
  generateAuthCode() {
    // 表单验证
    const errors = this.validateForm()
    if (errors.length > 0) {
      showToast(errors[0])
      return
    }

    const { selectedParking, visitorName, visitorPlate, visitorPhone, validDate, durationIndex, remark } = this.data

    showLoading('生成中...')

    const authData = {
      parkingId: selectedParking.id,
      visitorName: visitorName,
      visitorPlate: visitorPlate,
      visitorPhone: visitorPhone,
      validDate: validDate,
      duration: this.data.durationOptions[durationIndex],
      remark: remark
    }

    post('/api/visitor-auth/generate', authData)
      .then(res => {
        hideLoading()
        if (res.code === 200 && res.data) {
          this.setData({
            authCode: res.data.authCode,
            expireTime: res.data.expireTime,
            showModal: true
          })
          // 延迟绘制二维码，等待弹窗渲染完成
          setTimeout(() => {
            this.drawQrCode()
          }, 100)
        } else {
          this.generateMockCode()
        }
      })
      .catch(() => {
        hideLoading()
        this.generateMockCode()
      })
  },

  // 生成模拟授权码
  generateMockCode() {
    const mockCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const expireTime = formatDate(new Date(Date.now() + 2 * 60 * 60 * 1000), 'MM-DD HH:mm')

    this.setData({
      authCode: mockCode,
      expireTime: expireTime,
      showModal: true
    })
    // 延迟绘制二维码
    setTimeout(() => {
      this.drawQrCode()
    }, 100)
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false })
  },

  // 分享授权码
  shareAuthCode() {
    const { authCode, expireTime, selectedParking, visitorName } = this.data
    const shareText = `访客停车授权码：${authCode}\n有效期至：${expireTime}\n停车场：${selectedParking.name}\n访客：${visitorName}`

    wx.setClipboardData({
      data: shareText,
      success: () => {
        showToast('授权信息已复制，请粘贴发送给访客')
      },
      fail: () => {
        showToast('复制失败，请重试')
      }
    })
  },

  // 保存授权码图片到相册
  saveAuthCode() {
    const { authCode, expireTime, selectedParking } = this.data

    // 先绘制授权码图片
    this.drawAuthCodeImage((tempFilePath) => {
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => {
          showToast('保存成功')
        },
        fail: (err) => {
          if (err.errMsg.includes('auth deny')) {
            showModal('提示', '需要授权保存到相册权限', () => {
              wx.openSetting()
            })
          } else {
            showToast('保存失败')
          }
        }
      })
    })
  },

  // 绘制授权码图片
  drawAuthCodeImage(callback) {
    const { authCode, expireTime, selectedParking } = this.data
    const query = wx.createSelectorQuery()
    query.select('#saveCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const width = 300
        const height = 400
        const dpr = wx.getSystemInfoSync().pixelRatio

        // 设置canvas尺寸
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        // 绘制背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        // 绘制标题
        ctx.fillStyle = '#323233'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('访客停车授权', width / 2, 40)

        // 绘制授权码
        ctx.fillStyle = '#1989fa'
        ctx.font = 'bold 36px sans-serif'
        ctx.fillText(authCode, width / 2, 100)

        // 绘制信息
        ctx.fillStyle = '#969799'
        ctx.font = '14px sans-serif'
        ctx.fillText(`有效期至：${expireTime}`, width / 2, 140)
        ctx.fillText(`停车场：${selectedParking.name}`, width / 2, 165)

        // 绘制提示
        ctx.fillStyle = '#c8c9cc'
        ctx.font = '12px sans-serif'
        ctx.fillText('请向停车场入口工作人员出示此授权码', width / 2, 380)

        // 导出图片
        wx.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => {
            callback && callback(res.tempFilePath)
          },
          fail: () => {
            showToast('生成图片失败')
          }
        })
      })
  },

  // 绘制二维码到弹窗canvas
  drawQrCode() {
    const { authCode } = this.data
    const query = wx.createSelectorQuery()
    query.select('#authCodeCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const size = 200
        const dpr = wx.getSystemInfoSync().pixelRatio

        canvas.width = size * dpr
        canvas.height = size * dpr
        ctx.scale(dpr, dpr)

        // 绘制白色背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, size, size)

        // 绘制简单的二维码样式（实际项目中应使用后端生成的二维码图片）
        this.drawSimpleQR(ctx, authCode, size)
      })
  },

  // 绘制简单二维码图案（演示用）
  drawSimpleQR(ctx, text, size) {
    const cellSize = 10
    const margin = 20
    const qrSize = size - margin * 2
    const cells = Math.floor(qrSize / cellSize)

    // 绘制定位点
    const drawPositionPattern = (x, y) => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize)
      ctx.fillStyle = '#000000'
      ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize)
    }

    // 三个定位角
    drawPositionPattern(margin, margin)
    drawPositionPattern(margin + (cells - 7) * cellSize, margin)
    drawPositionPattern(margin, margin + (cells - 7) * cellSize)

    // 随机填充数据区域（实际应使用二维码编码算法）
    ctx.fillStyle = '#000000'
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        // 跳过定位点区域
        if ((i < 9 && j < 9) || (i > cells - 9 && j < 9) || (i < 9 && j > cells - 9)) {
          continue
        }
        // 使用文本生成伪随机图案
        const charCode = text.charCodeAt((i + j) % text.length) || 0
        if ((charCode + i * j) % 3 === 0) {
          ctx.fillRect(margin + i * cellSize, margin + j * cellSize, cellSize, cellSize)
        }
      }
    }
  },

  // 获取二维码图片URL
  getQrCodeUrl() {
    const { authCode } = this.data
    // 使用后端接口生成二维码，或生成微信小程序码
    // 这里使用一个占位服务，实际项目中应该调用自己的接口
    return `${getApp().globalData.baseUrl}/api/qrcode/generate?text=${encodeURIComponent(authCode)}&size=200`
  }
})