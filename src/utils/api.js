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

/**
 * 系统资源监控接口
 * 
 * 在实际生产环境中，后端应该实现以下功能：
 * 1. CPU使用率监控：
 *    - Linux: 可以使用 psutil 库获取 CPU 使用情况
 *    - 计算方法：后端每次API调用时记录处理前后的CPU使用率差值
 *    - 示例代码：
 *      ```python
 *      import psutil
 *      
 *      def get_cpu_usage():
 *          return psutil.cpu_percent(interval=0.5)
 *      ```
 * 
 * 2. GPU使用率监控：
 *    - 需要使用 nvidia-smi 命令或 pynvml 库获取 NVIDIA GPU 使用情况
 *    - 对于深度学习模型，可以记录模型推理时的 GPU 使用峰值
 *    - 示例代码：
 *      ```python
 *      import pynvml
 *      
 *      def get_gpu_usage():
 *          pynvml.nvmlInit()
 *          handle = pynvml.nvmlDeviceGetHandleByIndex(0)  # 第一个GPU
 *          info = pynvml.nvmlDeviceGetUtilizationRates(handle)
 *          return info.gpu  # GPU使用率百分比
 *      ```
 * 
 * 3. 内存使用监控：
 *    - 可以使用 psutil 库获取内存使用情况
 *    - 计算方法：记录API处理过程中的内存使用峰值
 *    - 示例代码：
 *      ```python
 *      import psutil
 *      
 *      def get_memory_usage():
 *          return psutil.virtual_memory().percent
 *      ```
 * 
 * 后端API实现示例：
 * ```python
 * @app.route('/system/metrics', methods=['GET'])
 * def system_metrics():
 *     return {
 *         'cpu': get_cpu_usage(),
 *         'gpu': get_gpu_usage(),
 *         'memory': get_memory_usage()
 *     }
 * ```
 */
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