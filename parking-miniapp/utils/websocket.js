const { WS_URL } = require('./constants')

// WebSocket 状态
const WS_STATUS = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}

// WebSocket 管理器
class WebSocketManager {
  constructor() {
    this.wsUrl = WS_URL
    this.socketTask = null
    this.status = WS_STATUS.CLOSED
    this.reconnectTimer = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000
    this.messageQueue = []
    this.listeners = {}
    this.heartbeatTimer = null
    this.heartbeatInterval = 30000
  }

  // 连接 WebSocket
  connect() {
    if (this.status === WS_STATUS.OPEN || this.status === WS_STATUS.CONNECTING) {
      console.log('WebSocket 已连接或正在连接')
      return
    }

    this.status = WS_STATUS.CONNECTING
    console.log('WebSocket 开始连接:', this.wsUrl)

    this.socketTask = wx.connectSocket({
      url: this.wsUrl,
      success: () => {
        console.log('WebSocket 连接成功')
      },
      fail: (err) => {
        console.error('WebSocket 连接失败:', err)
        this.status = WS_STATUS.CLOSED
        this.onReconnect()
      }
    })

    // 监听连接打开
    wx.onSocketOpen(() => {
      console.log('WebSocket 连接已打开')
      this.status = WS_STATUS.OPEN
      this.reconnectAttempts = 0
      
      // 发送队列中的消息
      this.flushMessageQueue()
      
      // 开始心跳
      this.startHeartbeat()
      
      // 触发连接成功事件
      this.emit('open')
    })

    // 监听消息
    wx.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data)
        console.log('WebSocket 收到消息:', data)
        this.emit('message', data)
      } catch (e) {
        console.log('WebSocket 收到非JSON消息:', res.data)
      }
    })

    // 监听连接关闭
    wx.onSocketClose(() => {
      console.log('WebSocket 连接已关闭')
      this.status = WS_STATUS.CLOSED
      this.stopHeartbeat()
      this.emit('close')
      this.onReconnect()
    })

    // 监听错误
    wx.onSocketError((err) => {
      console.error('WebSocket 错误:', err)
      this.status = WS_STATUS.CLOSED
      this.emit('error', err)
      this.onReconnect()
    })
  }

  // 断开连接
  disconnect() {
    if (this.status === WS_STATUS.CLOSED) {
      return
    }

    console.log('WebSocket 断开连接')
    this.stopHeartbeat()
    this.clearReconnectTimer()
    
    if (this.socketTask) {
      wx.closeSocket()
    }
    
    this.status = WS_STATUS.CLOSED
  }

  // 发送消息
  send(data) {
    if (this.status !== WS_STATUS.OPEN) {
      console.log('WebSocket 未连接，消息加入队列')
      this.messageQueue.push(data)
      return false
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data)
    wx.sendSocketMessage({
      data: message,
      success: () => {
        console.log('WebSocket 消息发送成功')
      },
      fail: (err) => {
        console.error('WebSocket 消息发送失败:', err)
        this.messageQueue.push(data)
      }
    })
    return true
  }

  // 发送队列中的消息
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.status === WS_STATUS.OPEN) {
      const data = this.messageQueue.shift()
      this.send(data)
    }
  }

  // 开始心跳
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.status === WS_STATUS.OPEN) {
        this.send({ type: 'HEARTBEAT' })
      }
    }, this.heartbeatInterval)
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 重连逻辑
  onReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('WebSocket 重连次数已达上限')
      this.emit('reconnectFailed')
      return
    }

    this.clearReconnectTimer()
    this.reconnectAttempts++
    
    console.log(`WebSocket 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)
  }

  // 清除重连定时器
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // 添加事件监听
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  // 移除事件监听
  off(event, callback) {
    if (!this.listeners[event]) return
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    } else {
      this.listeners[event] = []
    }
  }

  // 触发事件
  emit(event, data) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(callback => {
      try {
        callback(data)
      } catch (e) {
        console.error('WebSocket 事件回调错误:', e)
      }
    })
  }

  // 获取连接状态
  getStatus() {
    return this.status
  }

  // 是否已连接
  isConnected() {
    return this.status === WS_STATUS.OPEN
  }
}

// 创建单例实例
const wsManager = new WebSocketManager()

module.exports = {
  wsManager,
  WS_STATUS
}