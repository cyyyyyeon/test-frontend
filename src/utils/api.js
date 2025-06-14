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
    // 构造一个标准化的错误对象
    const errorObj = {
      status: 'error',
      error: error.response?.data?.error || error.message || '未知错误'
    };

    console.error('API错误:', errorObj);
    return Promise.reject(errorObj);
  })

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


export const getSystemMetrics = () => {
  // 实际生产环境中应该调用后端API获取真实系统资源使用情况
  // return api.get('/system/metrics')
  
  // 当前为模拟数据，仅用于演示
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