// 测试用例生成工具

// 融合身份测试用例
export const generateFusionTestCases = () => {
  // 正常情况测试用例
  const normalCase = {
    "user1": {
      "face": "1_1.png",
      "voice": "1_1.wav",
      "finger": "1_1.jpg"
    },
    "user2": {
      "face": "1_2.png",
      "voice": "1_2.wav",
      "finger": "1_2.jpg"
    }
  }
  
  // 缺失模态测试用例
  const missingModalCase = {
    "user1": {
      "face": "face1.jpg",
      "voice": "voice1.wav"
      // 缺少指纹
    },
    "user2": {
      "face": "face2.jpg",
      "voice": "voice2.wav",
      "finger": "finger2.jpg"
    }
  }
  
  // 错误文件格式测试用例
  const wrongFormatCase = {
    "user1": {
      "face": "face1.txt", // 错误格式
      "voice": "voice1.wav",
      "finger": "finger1.jpg"
    },
    "user2": {
      "face": "face2.jpg",
      "voice": "voice2.wav",
      "finger": "finger2.jpg"
    }
  }
  
  // 用户数量错误测试用例
  const wrongUserCountCase = {
    "user1": {
      "face": "face1.jpg",
      "voice": "voice1.wav",
      "finger": "finger1.jpg"
    },
    "user2": {
      "face": "face2.jpg",
      "voice": "voice2.wav",
      "finger": "finger2.jpg"
    },
    "user3": { // 多余用户
      "face": "face3.jpg",
      "voice": "voice3.wav",
      "finger": "finger3.jpg"
    }
  }
  
  return [
    { name: '正常测试', data: normalCase },
    { name: '缺失模态测试', data: missingModalCase },
    { name: '错误文件格式测试', data: wrongFormatCase },
    { name: '用户数量错误测试', data: wrongUserCountCase }
  ]
}

// 人脸相似度可视化测试用例
export const generateFaceVizTestCases = () => {
  // 正常情况测试用例
  const normalCase = {
    "image1_name": "face1.jpg",
    "image2_name": "face2.jpg"
  }
  
  // 文件不存在测试用例
  const fileNotExistCase = {
    "image1_name": "nonexistent.jpg",
    "image2_name": "face2.jpg"
  }
  
  // 错误文件格式测试用例
  const wrongFormatCase = {
    "image1_name": "face1.txt", // 错误格式
    "image2_name": "face2.jpg"
  }
  
  // 缺少参数测试用例
  const missingParamCase = {
    "image1_name": "face1.jpg"
    // 缺少 image2_name
  }
  
  return [
    { name: '正常测试', data: normalCase },
    { name: '文件不存在测试', data: fileNotExistCase },
    { name: '错误文件格式测试', data: wrongFormatCase },
    { name: '缺少参数测试', data: missingParamCase }
  ]
}

// 身份风险评估测试用例
export const generateIdentityTestCases = () => {
  // 正常情况测试用例
  const normalCase = {
    "trans_series": [
      [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0],
      [1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1],
      [1.2, 2.2, 3.2, 4.2, 5.2, 6.2, 7.2]
    ],
    "user_info": [30, 1, 60000]
  }
  
  // 大数值测试用例
  const largeValueCase = {
    "trans_series": [
      [100.5, 200.8, 300.2, 400.1, 500.9, 600.3, 700.7],
      [150.2, 250.6, 350.4, 450.8, 550.1, 650.5, 750.9],
      [200.0, 300.3, 400.7, 500.2, 600.6, 700.4, 800.8]
    ],
    "user_info": [25, 1, 50000]
  }
  
  // 交易序列为空测试用例
  const emptyTransCase = {
    "trans_series": [],
    "user_info": [30, 1, 60000]
  }
  
  // 用户信息不完整测试用例
  const incompleteUserInfoCase = {
    "trans_series": [
      [10.1, 20.2, 30.3, 40.4, 50.5, 60.6, 70.7],
      [15.1, 25.2, 35.3, 45.4, 55.5, 65.6, 75.7]
    ],
    "user_info": [] // 空数组，测试缺少用户信息的情况
  }
  
  // 交易序列特征不完整测试用例
  const incompleteTransCase = {
    "trans_series": [
      [10.1, 20.2, 30.3], // 只有3个特征，应该有7个
      [15.1, 25.2, 35.3, 45.4, 55.5, 65.6, 75.7]
    ],
    "user_info": [30, 1, 60000]
  }
  
  // 数据类型错误测试用例
  const wrongTypeCase = {
    "trans_series": [
      [10.1, 20.2, "abc", 40.4, 50.5, 60.6, 70.7], // 包含字符串
      [15.1, 25.2, 35.3, 45.4, 55.5, 65.6, 75.7]
    ],
    "user_info": [30, 1, 60000]
  }
  
  // 包含无效值测试用例
  const invalidValueCase = {
    "trans_series": [
      [10.1, 20.2, NaN, 40.4, 50.5, 60.6, 70.7], // 包含NaN
      [15.1, 25.2, 35.3, 45.4, Infinity, 65.6, 75.7] // 包含Infinity
    ],
    "user_info": [30, 1, 60000]
  }
  
  return [
    { 
      name: '正常预测测试', 
      data: normalCase, 
      expectedResult: 'success',
      expectedType: 'prediction',
      description: '测试正常数据的预测功能'
    },
    { 
      name: '大数值预测测试', 
      data: largeValueCase, 
      expectedResult: 'success',
      expectedType: 'prediction',
      description: '测试大数值数据的预测功能'
    },
    { 
      name: '交易序列为空测试', 
      data: emptyTransCase, 
      expectedResult: 'error',
      expectedType: 'validation',
      description: '测试空交易序列的错误处理'
    },
    { 
      name: '用户信息为空测试', 
      data: incompleteUserInfoCase, 
      expectedResult: 'error',
      expectedType: 'validation',
      description: '测试用户信息为空时的错误处理'
    },
    { 
      name: '交易序列格式错误测试', 
      data: incompleteTransCase, 
      expectedResult: 'error',
      expectedType: 'validation',
      description: '测试交易序列格式错误时的错误处理'
    },
    { 
      name: '数据类型错误测试', 
      data: wrongTypeCase, 
      expectedResult: 'error',
      expectedType: 'validation',
      description: '测试数据类型错误时的错误处理'
    },
    { 
      name: '无效数值测试', 
      data: invalidValueCase, 
      expectedResult: 'error',
      expectedType: 'validation',
      description: '测试包含NaN/Infinity时的错误处理'
    }
  ]
}

// 生成随机测试数据（用于压力测试）
export const generateRandomTestData = (type) => {
  switch (type) {
    case 'fusion':
      return {
        "user1": {
          "face": `face${Math.floor(Math.random() * 10)}.jpg`,
          "voice": `voice${Math.floor(Math.random() * 10)}.wav`,
          "finger": `finger${Math.floor(Math.random() * 10)}.jpg`
        },
        "user2": {
          "face": `face${Math.floor(Math.random() * 10)}.jpg`,
          "voice": `voice${Math.floor(Math.random() * 10)}.wav`,
          "finger": `finger${Math.floor(Math.random() * 10)}.jpg`
        }
      }
    
    case 'faceViz':
      return {
        "image1_name": `face${Math.floor(Math.random() * 10)}.jpg`,
        "image2_name": `face${Math.floor(Math.random() * 10)}.jpg`
      }
    
    case 'identity':
      const transLength = Math.floor(Math.random() * 10) + 3 // 3-12个时间步
      const transSeries = []
      
      for (let i = 0; i < transLength; i++) {
        const series = []
        for (let j = 0; j < 7; j++) { // 每个时间步7个特征
          series.push(Math.random() * 1000)
        }
        transSeries.push(series)
      }
      
      return {
        "trans_series": transSeries,
        "user_info": [
          Math.floor(Math.random() * 80 + 18), // 年龄 18-98
          Math.floor(Math.random() * 2), // 性别 0-1
          Math.floor(Math.random() * 200000 + 10000) // 收入 10000-210000
        ]
      }
    
    default:
      return {}
  }
} 