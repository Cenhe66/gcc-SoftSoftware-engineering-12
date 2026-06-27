const { get } = require('../../utils/request')
const { showToast, showLoading, hideLoading, getDistance } = require('../../utils/util')

Page({
  data: {
    parkingList: [],
    pageNum: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    locationText: '定位中...',
    latitude: null,
    longitude: null,
    isSearchMode: false, // 是否为搜索模式
    searchKeyword: '' // 搜索关键词
  },

  onLoad(options) {
    // 检查是否为搜索模式
    if (options.mode === 'search') {
      this.setData({
        isSearchMode: true
      })
      wx.setNavigationBarTitle({ title: '搜索停车场' })
    }
    this.getLocation()
  },

  onShow() {
    if (this.data.latitude) {
      this.refreshData()
    }
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  // 获取当前位置
  getLocation() {
    // 检查隐私协议是否已授权
    const app = getApp()
    if (!app.globalData.privacyAuthorized) {
      // 使用隐私协议弹窗
      if (wx.onNeedPrivacyAuthorization) {
        wx.onNeedPrivacyAuthorization((resolve, event) => {
          console.log('需要隐私授权:', event)
          resolve({
            event: 'agree',
            disclosure: '用户同意隐私协议'
          })
          app.globalData.privacyAuthorized = true
          this.doGetLocation()
        })
      }
      // 尝试直接获取位置
      this.doGetLocation()
    } else {
      this.doGetLocation()
    }
  },

  // 实际获取位置的方法
  doGetLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          locationText: '附近'
        })
        this.loadParkingList()
      },
      fail: (err) => {
        console.log('获取位置失败:', err)
        this.setData({
          locationText: '定位失败'
        })
        this.loadParkingList()
      }
    })
  },

  // 刷新数据
  refreshData() {
    this.setData({
      pageNum: 1,
      hasMore: true,
      parkingList: []
    })
    return this.loadParkingList()
  },

  // 加载停车场列表
  loadParkingList() {
    if (this.data.loading) return Promise.resolve()

    this.setData({ loading: true })

    const params = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }

    if (this.data.latitude && this.data.longitude) {
      params.latitude = this.data.latitude
      params.longitude = this.data.longitude
    }

    return get('/api/parking-lot/list', params)
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.records || [])
          
          const processedList = list.map(item => {
            const mappedItem = {
              ...item,
              freeSpace: item.availableSpaces,
              totalSpace: item.totalSpaces,
              pricePerHour: item.hourlyRate
            }
            if (this.data.latitude && this.data.longitude && item.latitude && item.longitude) {
              mappedItem.distance = getDistance(
                this.data.latitude,
                this.data.longitude,
                item.latitude,
                item.longitude
              )
              // 格式化距离文本
              if (mappedItem.distance < 1000) {
                mappedItem.distanceText = mappedItem.distance + 'm'
              } else {
                mappedItem.distanceText = (mappedItem.distance / 1000).toFixed(1) + 'km'
              }
            }
            return mappedItem
          })

          processedList.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))

          this.setData({
            parkingList: this.data.pageNum === 1 ? processedList : [...this.data.parkingList, ...processedList],
            hasMore: false,
            loading: false
          })
        } else {
          this.setMockData()
        }
      })
      .catch(() => {
        this.setMockData()
      })
  },

  // 加载更多
  loadMore() {
    this.setData({ pageNum: this.data.pageNum + 1 })
    this.loadParkingList()
  },

  // 模拟数据
  setMockData() {
    const mockData = [
      {
        id: 1,
        name: '万达广场停车场',
        address: '朝阳区建国路88号万达广场B2-B3层',
        totalSpace: 500,
        freeSpace: 128,
        pricePerHour: 8,
        hasCharging: true,
        isIndoor: true,
        hasElevator: true,
        distance: 350,
        distanceText: '350m'
      },
      {
        id: 2,
        name: '国贸中心停车场',
        address: '朝阳区建国门外大街1号',
        totalSpace: 800,
        freeSpace: 45,
        pricePerHour: 12,
        hasCharging: true,
        isIndoor: true,
        hasElevator: true,
        distance: 580,
        distanceText: '580m'
      },
      {
        id: 3,
        name: '三里屯太古里停车场',
        address: '朝阳区三里屯路19号',
        totalSpace: 300,
        freeSpace: 12,
        pricePerHour: 10,
        hasCharging: false,
        isIndoor: false,
        hasElevator: false,
        distance: 920,
        distanceText: '920m'
      },
      {
        id: 4,
        name: '朝阳大悦城停车场',
        address: '朝阳区朝阳北路101号',
        totalSpace: 600,
        freeSpace: 256,
        pricePerHour: 6,
        hasCharging: true,
        isIndoor: true,
        hasElevator: true,
        distance: 1200,
        distanceText: '1.2km'
      },
      {
        id: 5,
        name: '望京SOHO停车场',
        address: '朝阳区望京街9号',
        totalSpace: 400,
        freeSpace: 89,
        pricePerHour: 7,
        hasCharging: true,
        isIndoor: true,
        hasElevator: true,
        distance: 1850,
        distanceText: '1.9km'
      }
    ]

    this.setData({
      parkingList: this.data.pageNum === 1 ? mockData : [...this.data.parkingList, ...mockData],
      hasMore: false,
      loading: false
    })
  },

  // 选择停车场
  selectParking(e) {
    const id = e.currentTarget.dataset.id
    const parking = this.data.parkingList.find(item => item.id == id)

    if (parking) {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage) {
        prevPage.setData({
          selectedParking: parking
        })
      }
      wx.navigateBack()
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 执行搜索
  doSearch() {
    const { searchKeyword } = this.data
    if (!searchKeyword.trim()) {
      showToast('请输入搜索关键词')
      return
    }
    this.setData({
      pageNum: 1,
      hasMore: true,
      parkingList: []
    })
    this.loadParkingList()
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      pageNum: 1,
      hasMore: true,
      parkingList: []
    })
    this.loadParkingList()
  }
})
