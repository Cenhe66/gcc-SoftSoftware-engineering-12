const { get, post } = require('../../utils/request')
const { showToast, showLoading, hideLoading, formatDate } = require('../../utils/util')

Page({
  data: {
    spaceCode: '',
    moveCarList: []
  },

  onLoad() {
    this.loadMoveCarList()
  },

  onShow() {
    this.loadMoveCarList()
  },

  // 加载挪车记录
  loadMoveCarList() {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    get(`/move-car/list/requester/${userId}`, { pageNum: 1, pageSize: 3 }, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || []
          const processedList = list.map(item => ({
            ...item,
            createTime: formatDate(item.createTime, 'MM-DD HH:mm'),
            statusText: item.status === 0 ? '待处理' : '已完成'
          }))
          this.setData({ moveCarList: processedList })
        }
      })
      .catch(() => {
        // 模拟数据
        this.setData({
          moveCarList: [
            {
              id: 1,
              parkingName: '万达广场停车场',
              spaceCode: 'B2-015',
              createTime: '05-27 14:30',
              status: 0,
              statusText: '待处理'
            },
            {
              id: 2,
              parkingName: '国贸中心停车场',
              spaceCode: 'B1-088',
              createTime: '05-26 09:15',
              status: 1,
              statusText: '已完成'
            }
          ]
        })
      })
  },

  // 扫码
  scanCode() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: (res) => {
        console.log('扫码结果:', res.result)
        // 解析二维码内容，获取车位信息
        this.handleScanResult(res.result)
      },
      fail: () => {
        showToast('扫码失败，请重试')
      }
    })
  },

  // 处理扫码结果
  handleScanResult(result) {
    // 假设二维码格式为：parking://space?id=123&code=B2-015
    try {
      if (result.startsWith('parking://space')) {
        const params = this.parseUrlParams(result)
        this.goToRequestPage(params.id, params.code)
      } else {
        showToast('无效的二维码')
      }
    } catch (e) {
      showToast('二维码解析失败')
    }
  },

  // 解析URL参数
  parseUrlParams(url) {
    const params = {}
    const queryString = url.split('?')[1]
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=')
        params[key] = decodeURIComponent(value)
      })
    }
    return params
  },

  // 输入车位号
  onSpaceCodeInput(e) {
    this.setData({
      spaceCode: e.detail.value.toUpperCase()
    })
  },

  // 根据车位号搜索
  searchByCode() {
    const { spaceCode } = this.data
    if (!spaceCode) return

    showLoading('查询中...')
    
    // 调用API查询车位信息
    get('/api/parking-space/info', { spaceCode }, { hideLoading: true })
      .then(res => {
        hideLoading()
        if (res.code === 200 && res.data) {
          this.goToRequestPage(res.data.id, spaceCode)
        } else {
          showToast('未找到该车位信息')
        }
      })
      .catch(() => {
        hideLoading()
        // 模拟成功
        this.goToRequestPage(1, spaceCode)
      })
  },

  // 跳转到挪车请求页面
  goToRequestPage(spaceId, spaceCode) {
    wx.navigateTo({
      url: `/pages/move-car-request/move-car-request?spaceId=${spaceId}&spaceCode=${spaceCode}`
    })
  },

  // 查看记录详情
  viewRecordDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/move-car-message/move-car-message?requestId=${id}`
    })
  },

  // 查看全部记录
  viewAllRecords() {
    wx.navigateTo({
      url: '/pages/move-car-message/move-car-message'
    })
  }
})