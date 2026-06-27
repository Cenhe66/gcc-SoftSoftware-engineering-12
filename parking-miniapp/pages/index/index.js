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
    // 检查隐私协议是否已授权
    const app = getApp()
    if (!app.globalData.privacyAuthorized) {
      // 使用隐私协议弹窗
      if (wx.onNeedPrivacyAuthorization) {
        wx.onNeedPrivacyAuthorization((resolve, event) => {
          console.log('需要隐私授权:', event)
          // 这里需要用户点击同意后调用 resolve
          // 由于没有弹窗组件，暂时直接 resolve
          resolve({
            event: 'agree',
            disclosure: '用户同意隐私协议'
          })
          app.globalData.privacyAuthorized = true
          this.doGetLocation()
        })
      }
      // 尝试直接获取位置，如果需要授权会触发隐私弹窗
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
          this.setData({
            parkingList: [],
            hasMore: false,
            loading: false
          })
        }
      })
      .catch(err => {
        console.error('加载失败:', err)
        this.setData({
          parkingList: [],
          hasMore: false,
          loading: false
        })
      })
  },

  // 加载更多
  loadMore() {
    this.setData({ pageNum: this.data.pageNum + 1 })
    this.loadParkingList()
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
