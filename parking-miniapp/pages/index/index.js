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
    selectMode: false // 是否为选择模式
  },

  onLoad(options) {
    this.checkSelectMode()
    this.getLocation()
  },

  onShow() {
    // 每次显示页面时检查是否为选择模式
    this.checkSelectMode()
    // 每次显示页面时刷新数据
    if (this.data.latitude) {
      this.refreshData()
    }
  },

  // 检查是否为停车场选择模式
  checkSelectMode() {
    const app = getApp()
    if (app.globalData.selectParkingMode) {
      this.setData({ selectMode: true })
      wx.setNavigationBarTitle({ title: '选择停车场' })
      // 清除标记，避免重复触发
      app.globalData.selectParkingMode = false
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
      fail: () => {
        this.setData({
          locationText: '定位失败'
        })
        // 使用默认位置加载
        this.loadParkingList()
      }
    })
  },

  // 刷新位置
  refreshLocation() {
    this.setData({ locationText: '定位中...' })
    this.getLocation()
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

    // 如果有位置信息，添加到参数中
    if (this.data.latitude && this.data.longitude) {
      params.latitude = this.data.latitude
      params.longitude = this.data.longitude
    }

    return get('/api/parking-lot/list', params)
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.records || [])
          
          // 字段映射并计算距离
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
            }
            return mappedItem
          })

          // 按距离排序
          processedList.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))

          this.setData({
            parkingList: this.data.pageNum === 1 ? processedList : [...this.data.parkingList, ...processedList],
            hasMore: false,
            loading: false
          })
        } else {
          // 使用模拟数据
          this.setMockData()
        }
      })
      .catch(err => {
        console.error('加载失败:', err)
        this.setMockData()
      })
  },

  // 加载更多
  loadMore() {
    this.setData({ pageNum: this.data.pageNum + 1 })
    this.loadParkingList()
  },

  // 模拟数据（测试用）
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
        distance: 350
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
        distance: 580
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
        distance: 920
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
        distance: 1200
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
        distance: 1850
      }
    ]

    this.setData({
      parkingList: this.data.pageNum === 1 ? mockData : [...this.data.parkingList, ...mockData],
      hasMore: false,
      loading: false
    })
  },

  // 搜索
  onSearch() {
    wx.navigateTo({
      url: '/pages/parking-select/parking-select?mode=search'
    })
  },

  // 跳转到停车场详情或选择停车场
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    const parking = this.data.parkingList.find(item => item.id == id)

    if (this.data.selectMode) {
      // 选择模式：返回停车场数据到上一页
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage) {
        prevPage.setData({
          selectedParking: parking
        })
      }
      wx.navigateBack()
    } else {
      // 正常模式：跳转到详情页
      wx.navigateTo({
        url: `/pages/parking-detail/parking-detail?id=${id}`
      })
    }
  },

  // 跳转到预约
  goToReservation() {
    wx.switchTab({
      url: '/pages/reservation-list/reservation-list'
    })
  },

  // 跳转到共享车位
  goToShare() {
    wx.navigateTo({
      url: '/pages/share-space/share-space'
    })
  },

  // 跳转到挪车
  goToMoveCar() {
    wx.navigateTo({
      url: '/pages/move-car/move-car'
    })
  },

  // 跳转到AR寻车
  goToARFindCar() {
    wx.navigateTo({
      url: '/pages/ar-find-car/ar-find-car'
    })
  }
})
