const { get, post } = require('../../utils/request')
const { showToast, showLoading, hideLoading, formatDate } = require('../../utils/util')

Page({
  data: {
    spaceCode: '',
    moveCarList: [],
    parkingLots: [],
    parkingLotNames: [],
    selectedLotIndex: -1
  },

  onLoad() {
    this.loadParkingLots()
    this.loadMoveCarList()
  },

  // 加载停车场列表
  loadParkingLots() {
    get('/api/parking-lot/list', {}, { hideLoading: true })
      .then(res => {
        console.log('停车场列表:', res)
        if (res.code === 200 && res.data) {
          const lots = res.data
          this.setData({
            parkingLots: lots,
            parkingLotNames: lots.map(item => item.name)
          })
        } else {
          showToast('加载停车场失败')
        }
      })
      .catch(err => {
        console.error('加载停车场失败:', err)
        showToast('加载停车场失败')
        this.setData({ parkingLots: [], parkingLotNames: [] })
      })
  },

  // 选择停车场
  onParkingLotChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({ selectedLotIndex: index })
  },

  onShow() {
    this.loadMoveCarList()
  },

  // 加载挪车记录（合并后端 + 本地记录）
  loadMoveCarList() {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    const localKey = 'moveCarHistory_' + (userId || '0')
    const localHistory = wx.getStorageSync(localKey) || []

    const mergeAndSet = (serverList) => {
      const all = [...serverList, ...localHistory]
      // 去重（以 id 为准）
      const map = new Map()
      all.forEach(item => {
        if (item.id && !map.has(item.id)) {
          map.set(item.id, item)
        }
      })
      const uniqueList = Array.from(map.values())
      // 按时间倒序，取前 3 条
      const sorted = uniqueList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime)).slice(0, 3)
      const processedList = sorted.map(item => ({
        ...item,
        createTime: item.createTime ? formatDate(item.createTime, 'MM-DD HH:mm') : ''
      }))
      this.setData({ moveCarList: processedList })
    }

    // 未登录（匿名用户）只显示本地记录，不调后端
    if (!userId) {
      mergeAndSet([])
      return
    }

    get(`/api/move-car/list/requester/${userId}`, { pageNum: 1, pageSize: 3 }, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.records || [])
          const processedServerList = list.map(item => ({
            ...item,
            statusText: item.status === 0 ? '待处理' : '已完成'
          }))
          mergeAndSet(processedServerList)
        } else {
          mergeAndSet([])
        }
      })
      .catch(() => {
        mergeAndSet([])
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
    const { spaceCode, selectedLotIndex, parkingLots } = this.data
    if (!spaceCode) return
    if (selectedLotIndex < 0) {
      showToast('请先选择停车场')
      return
    }

    const lotId = parkingLots[selectedLotIndex].id
    showLoading('查询中...')

    // 调用API查询车位信息（必须指定停车场+车位号）
    get('/api/parking-space/info', { lotId, spaceCode }, { hideLoading: true })
      .then(res => {
        hideLoading()
        if (res.code === 200 && res.data) {
          this.goToRequestPage(res.data.id, spaceCode)
        } else {
          showToast(res.message || '未找到该车位信息')
        }
      })
      .catch(() => {
        hideLoading()
        showToast('查询失败，请重试')
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
      url: '/pages/move-car-list/move-car-list'
    })
  }
})