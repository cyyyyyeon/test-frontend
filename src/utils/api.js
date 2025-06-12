import axios from 'axios'

// 创建axios实例
const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://10.60.38.173:59090',
  timeout: 30000 // 请求超时时间
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 在发送请求前可以做一些处理
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

// 融合身份验证接口
export const fusionTest = (data) => {
  return api.post('/fusion/', data)
}

// 人脸相似度可视化接口
export const faceVizTest = (data) => {
  return api.post('/faceviz/', data)
}

// 身份风险评估接口
export const identityTest = (data) => {
  return api.post('/identity/predict', data)
}

// 获取测试数据接口
export const getTestData = (params) => {
  return api.get('/identity/test-data', { params })
}

// 获取测试数据集信息接口
export const getTestDataInfo = () => {
  return api.get('/identity/test-data/info')
}

// 系统资源监控接口（模拟）
export const getSystemMetrics = () => {
  // 这里模拟获取系统资源使用情况
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        cpu: Math.random() * 100,
        gpu: Math.random() * 100,
        memory: Math.random() * 100
      })
    }, 500)
  })
}

export default api 