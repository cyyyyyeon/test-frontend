// 测试用例生成工具

// 融合身份测试用例
export const generateFusionTestCases = () => {
  // 等价类测试用例 - 正常情况
  const getTwoDifferentFileIds = () => {
    const ids = [1, 2, 3, 4, 5];
    const first = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
    const second = ids[Math.floor(Math.random() * ids.length)];
    return [first, second];
  };
  // 1. 同一个人的多模态数据（应该匹配成功）
  const user1Id = Math.floor(Math.random() * 10) + 1
  const [faceId1, faceId2] = getTwoDifferentFileIds();
  const [voiceId1, voiceId2] = getTwoDifferentFileIds();
  const [fingerId1, fingerId2] = getTwoDifferentFileIds();

  const samePersonCase = {
    "user1": {
      "face": `${user1Id}_${faceId1}.png`,
      "voice": `${user1Id}_${voiceId1}.wav`,
      "finger": `${user1Id}_${fingerId1}.jpg`
    },
    "user2": {
      "face": `${user1Id}_${faceId2}.png`,
      "voice": `${user1Id}_${voiceId2}.wav`,
      "finger": `${user1Id}_${fingerId2}.jpg`
    }
  }

  // 2. 不同人的多模态数据（应该匹配失败）
  const getTwoDifferentUserIds = () => {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const first = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
    const second = ids[Math.floor(Math.random() * ids.length)];
    return [first, second];
  };
  const [user2Id, user3Id] = getTwoDifferentUserIds();

  const differentPersonCase = {
    "user1": {
      "face": `${user2Id}_${Math.floor(Math.random() * 5) + 1}.png`,
      "voice": `${user2Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      "finger": `${user2Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
    },
    "user2": {
      "face": `${user3Id}_${Math.floor(Math.random() * 5) + 1}.png`,
      "voice": `${user3Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      "finger": `${user3Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
    }
  }

  // 3. 部分模态相同，部分不同（边界情况）
  const [user4Id, user5Id] = getTwoDifferentUserIds();
  const [faceId4, faceId5] = getTwoDifferentFileIds();
  const [voiceId4, voiceId5] = getTwoDifferentFileIds();
  const [fingerId4, fingerId5] = getTwoDifferentFileIds();

  const partialMatchCase = {
    "user1": {
      "face": `${user4Id}_${faceId4}.png`,
      "voice": `${user4Id}_${voiceId4}.wav`,
      "finger": `${user4Id}_${fingerId4}.jpg`
    },
    "user2": {
      "face": `${user5Id}_${faceId5}.png`,
      "voice": `${user4Id}_${voiceId5}.wav`,
      "finger": `${user4Id}_${fingerId5}.jpg`
    }
  }

  // 异常情况测试用例

  // 4. 缺失模态测试用例
  const user6Id = Math.floor(Math.random() * 10) + 1
  const user7Id = Math.floor(Math.random() * 10) + 1
  const missingModalCase = {
    "user1": {
      "face": `${user6Id}_${Math.floor(Math.random() * 5) + 1}.png`,
      "voice": `${user6Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      // 缺少指纹
    },
    "user2": {
      "face": `${user7Id}_${Math.floor(Math.random() * 5) + 1}.png`,
      "voice": `${user7Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      "finger": `${user7Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
    }
  }

  // 5. 错误文件格式测试用例
  const user8Id = Math.floor(Math.random() * 10) + 1
  const user9Id = Math.floor(Math.random() * 10) + 1
  const wrongFormatCase = {
    "user1": {
      "face": `${user8Id}_${Math.floor(Math.random() * 5) + 1}.txt`, // 错误格式
      "voice": `${user8Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      "finger": `${user8Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
    },
    "user2": {
      "face": `${user9Id}_${Math.floor(Math.random() * 5) + 1}.png`,
      "voice": `${user9Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      "finger": `${user9Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
    }
  }

  // 6. 用户数量错误测试用例
  const user10Id = Math.floor(Math.random() * 10) + 1
  const user11Id = Math.floor(Math.random() * 10) + 1
  const user12Id = Math.floor(Math.random() * 10) + 1
  const wrongUserCountCase = {
    "user1": {
      "face": `${user10Id}_${Math.floor(Math.random() * 5) + 1}.png`,
      "voice": `${user10Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      "finger": `${user10Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
    },
    "user2": {
      "face": `${user11Id}_${Math.floor(Math.random() * 5) + 1}.png`,
      "voice": `${user11Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      "finger": `${user11Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
    },
    "user3": { // 多余用户
      "face": `${user12Id}_${Math.floor(Math.random() * 5) + 1}.png`,
      "voice": `${user12Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
      "finger": `${user12Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
    }
  }

  // 7. 空数据测试用例
  const emptyDataCase = {
    "user1": {
      "face": "",
      "voice": "",
      "finger": ""
    },
    "user2": {
      "face": "",
      "voice": "",
      "finger": ""
    }
  }
  // 8.不存在文件测试用例
  const fileNotExistCase = {
    "user1": {
      "face": `13_3.png`,
      "voice": `13_4.wav`,
      "finger": `13_5.jpg`
    },
    "user2": {
      "face": `10_0.png`,
      "voice": `10_6.wav`,
      "finger": `10_2.jpg`
    }
  }

  return [
    { name: '同一人多模态测试', data: samePersonCase, expectedResult: 'same_person' },
    { name: '不同人多模态测试', data: differentPersonCase, expectedResult: 'different_person' },
    { name: '部分模态匹配测试', data: partialMatchCase, expectedResult: 'different_person' },
    { name: '缺失模态测试', data: missingModalCase, expectedResult: 'error' },
    { name: '错误文件格式测试', data: wrongFormatCase, expectedResult: 'error' },
    { name: '用户数量错误测试', data: wrongUserCountCase, expectedResult: 'error' },
    { name: '空数据测试', data: emptyDataCase, expectedResult: 'error' },
    { name: '不存在文件测试', data: fileNotExistCase, expectedResult: 'error' },
  ]
}

// 人脸相似度可视化测试用例
export const generateFaceVizTestCases = () => {
  // 等价类测试用例 - 正常情况
  const getTwoDifferentFileIds = () => {
    const ids = [1, 2, 3, 4, 5];
    const first = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
    const second = ids[Math.floor(Math.random() * ids.length)];
    return [first, second];
  };
  // 1. 同一个人的多模态数据（应该匹配成功）
  const user1Id = Math.floor(Math.random() * 10) + 1
  const [faceId1, faceId2] = getTwoDifferentFileIds();
  const [voiceId1, voiceId2] = getTwoDifferentFileIds();
  const [fingerId1, fingerId2] = getTwoDifferentFileIds();

  const samePersonCase = {
    "user1_face": `${user1Id}_${faceId1}.png`,
    "user2_face": `${user1Id}_${faceId2}.png`
  }

  // 2. 不同人的多模态数据（应该匹配失败）
  const getTwoDifferentUserIds = () => {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const first = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
    const second = ids[Math.floor(Math.random() * ids.length)];
    return [first, second];
  };
  const [user2Id, user3Id] = getTwoDifferentUserIds();

  const differentPersonCase = {
    "user1_face": `${user2Id}_${Math.floor(Math.random() * 5) + 1}.png`,
    "user2_face": `${user3Id}_${Math.floor(Math.random() * 5) + 1}.png`
  }
  // 3.文件不存在测试用例
  const fileNotExistCase = {
    "user1_face": "13_1.png",
    "user2_face": "9_6.png"
  }

  // 4.错误文件格式测试用例
  const wrongFormatCase = {
    "user1_face": "1_2.txt", // 错误格式
    "user2_face": "3_4.jpg"
  }

  // 5.缺少参数测试用例
  const missingParamCase = {
    "user1_face": "1_2.png"
    // 缺少 user2_face
  }

  return [
    { name: '同一个人测试', data: samePersonCase, expectedResult: 'same_person' },
    { name: '不同人测试', data: differentPersonCase, expectedResult: 'different_person' },
    { name: '文件不存在测试', data: fileNotExistCase, expectedResult: 'error' },
    { name: '错误文件格式测试', data: wrongFormatCase, expectedResult: 'error' },
    { name: '缺少参数测试', data: missingParamCase, expectedResult: 'error' }
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
      const user1Id = Math.floor(Math.random() * 10) + 1
      const user2Id = Math.floor(Math.random() * 10) + 1
      return {
        "user1": {
          "face": `${user1Id}_${Math.floor(Math.random() * 5) + 1}.png`,
          "voice": `${user1Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
          "finger": `${user1Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
        },
        "user2": {
          "face": `${user2Id}_${Math.floor(Math.random() * 5) + 1}.png`,
          "voice": `${user2Id}_${Math.floor(Math.random() * 5) + 1}.wav`,
          "finger": `${user2Id}_${Math.floor(Math.random() * 5) + 1}.jpg`
        }
      }
    
    case 'faceViz':
      const user3Id = Math.floor(Math.random() * 10) + 1
      const user4Id = Math.floor(Math.random() * 10) + 1
      return {
        "user1_face": `${user3Id}_${Math.floor(Math.random() * 5) + 1}.png`,
        "user2_face": `${user4Id}_${Math.floor(Math.random() * 5) + 1}.png`
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