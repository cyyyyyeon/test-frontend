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
      [100, 200, 300, 400, 500],
      [150, 250, 350, 450, 550],
      [200, 300, 400, 500, 600]
    ],
    "user_info": [30, 1, 100000, 5, 2]
  }
  
  // 交易序列为空测试用例
  const emptyTransCase = {
    "trans_series": [],
    "user_info": [30, 1, 100000, 5, 2]
  }
  
  // 用户信息不完整测试用例
  const incompleteUserInfoCase = {
    "trans_series": [
      [100, 200, 300, 400, 500],
      [150, 250, 350, 450, 550]
    ],
    "user_info": [30, 1] // 不完整
  }
  
  // 数据类型错误测试用例
  const wrongTypeCase = {
    "trans_series": [
      [100, 200, "300", 400, 500], // 字符串类型
      [150, 250, 350, 450, 550]
    ],
    "user_info": [30, 1, 100000, 5, 2]
  }
  
  return [
    { name: '正常测试', data: normalCase },
    { name: '交易序列为空测试', data: emptyTransCase },
    { name: '用户信息不完整测试', data: incompleteUserInfoCase },
    { name: '数据类型错误测试', data: wrongTypeCase }
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
      const transLength = Math.floor(Math.random() * 5) + 1
      const transCount = Math.floor(Math.random() * 5) + 1
      const transSeries = []
      
      for (let i = 0; i < transCount; i++) {
        const series = []
        for (let j = 0; j < transLength; j++) {
          series.push(Math.floor(Math.random() * 1000))
        }
        transSeries.push(series)
      }
      
      return {
        "trans_series": transSeries,
        "user_info": [
          Math.floor(Math.random() * 100), // 年龄
          Math.floor(Math.random() * 2), // 性别
          Math.floor(Math.random() * 1000000), // 收入
          Math.floor(Math.random() * 10), // 教育水平
          Math.floor(Math.random() * 5) // 婚姻状态
        ]
      }
    
    default:
      return {}
  }
} 