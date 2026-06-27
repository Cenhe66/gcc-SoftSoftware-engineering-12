const { BASE_URL, TIMEOUT } = require('./constants')
const { showToast } = require('./util')

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 2,        // 最大重试次数
  retryDelay: 1000,    // 重试间隔（毫秒）
  retryOnNetworkError: true  // 网络错误时是否重试
}

// 请求拦截器
const requestInterceptor = (options) => {
  // 添加token
  const token = wx.getStorageSync('token')
  if (token) {
    options.header = options.header || {}
    options.header['Authorization'] = `Bearer ${token}`
  }
  
  // 默认Content-Type
  if (!options.header['Content-Type']) {
    options.header['Content-Type'] = 'application/json'
  }
  
  return options
}

// 响应拦截器
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  // HTTP错误处理
  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`HTTP ${statusCode}: 请求失败`)
  }
  
  // 业务逻辑错误处理
  if (data && data.code !== 200) {
    // token过期
    if (data.code === 401) {
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      showToast('登录已过期，请重新登录')
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/login/login' })
      }, 1500)
    }
    throw new Error(data.message || '请求失败')
  }
  
  return data
}

// 基础请求方法（带重试机制）
const baseRequest = (url, method = 'GET', data = {}, options = {}) => {
  const retryCount = options.retryCount || 0
  const maxRetries = options.maxRetries !== undefined ? options.maxRetries : RETRY_CONFIG.maxRetries
  
  return new Promise((resolve, reject) => {
    // 合并配置
    let config = {
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      method,
      data,
      timeout: TIMEOUT,
      header: {},
      ...options
    }
    
    // 请求拦截
    config = requestInterceptor(config)
    
    // 显示加载（重试时不重复显示）
    if (!options.hideLoading && retryCount === 0) {
      wx.showLoading({ title: options.loadingText || '加载中...', mask: true })
    }
    
    // 发起请求
    wx.request({
      ...config,
      success: (response) => {
        try {
          const result = responseInterceptor(response)
          resolve(result)
        } catch (error) {
          // 业务错误不重试
          reject(error)
        }
      },
      fail: (error) => {
        console.error('请求失败:', error)
        
        // 网络错误时尝试重试
        if (RETRY_CONFIG.retryOnNetworkError && retryCount < maxRetries) {
          console.log(`第 ${retryCount + 1} 次重试...`)
          setTimeout(() => {
            baseRequest(url, method, data, { 
              ...options, 
              retryCount: retryCount + 1,
              hideLoading: true  // 重试时不显示loading
            })
              .then(resolve)
              .catch(reject)
          }, RETRY_CONFIG.retryDelay)
        } else {
          reject(new Error('网络请求失败，请检查网络连接'))
        }
      },
      complete: () => {
        if (!options.hideLoading && retryCount === 0) {
          wx.hideLoading()
        }
      }
    })
  })
}

// GET请求
const get = (url, params = {}, options = {}) => {
  // 构建查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  return baseRequest(fullUrl, 'GET', {}, options)
}

// POST请求
const post = (url, data = {}, options = {}) => {
  return baseRequest(url, 'POST', data, options)
}

// PUT请求
const put = (url, data = {}, options = {}) => {
  return baseRequest(url, 'PUT', data, options)
}

// DELETE请求
const del = (url, data = {}, options = {}) => {
  return baseRequest(url, 'DELETE', data, options)
}

// 上传文件
const upload = (url, filePath, name = 'file', formData = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    
    wx.uploadFile({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (response) => {
        try {
          const data = JSON.parse(response.data)
          if (data.code !== 200) {
            throw new Error(data.message || '上传失败')
          }
          resolve(data)
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        console.error('上传失败:', error)
        reject(new Error('文件上传失败'))
      }
    })
  })
}

// 下载文件
const download = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      ...options,
      success: (response) => {
        if (response.statusCode === 200) {
          resolve(response.tempFilePath)
        } else {
          reject(new Error('下载失败'))
        }
      },
      fail: (error) => {
        console.error('下载失败:', error)
        reject(new Error('文件下载失败'))
      }
    })
  })
}

module.exports = {
  request: baseRequest,
  get,
  post,
  put,
  delete: del,
  upload,
  download
}
