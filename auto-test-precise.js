/**
 * 前端自定义测试功能自动化测试脚本 - 精确版
 * 基于实际页面结构优化
 */

class FrontendTestRunner {
  constructor() {
    this.testResults = {
      identity: { passed: 0, failed: 0, total: 0, details: [] },
      faceViz: { passed: 0, failed: 0, total: 0, details: [] },
      fusion: { passed: 0, failed: 0, total: 0, details: [] }
    };
    this.currentPage = null;
    this.testStartTime = null;
  }

  // 测试结果记录
  recordResult(page, testName, passed, details = {}) {
    const result = {
      testName,
      passed,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.testResults[page].details.push(result);
    this.testResults[page].total++;
    if (passed) {
      this.testResults[page].passed++;
    } else {
      this.testResults[page].failed++;
    }
    
    console.log(`[${page.toUpperCase()}] ${testName}: ${passed ? '✅ 通过' : '❌ 失败'}`);
  }

  // 查找包含特定文本的元素
  findElementByText(selector, text) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).find(el => el.textContent.includes(text));
  }

  // 等待元素出现
  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await this.sleep(100);
    }
    throw new Error(`元素 ${selector} 未在 ${timeout}ms 内出现`);
  }

  // 等待页面加载
  async waitForPageLoad() {
    await this.sleep(2000);
  }

  // 睡眠函数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 导航到指定页面
  async navigateToPage(pageName) {
    console.log(`\n🚀 开始测试 ${pageName} 页面...`);
    
    const pageMap = {
      'identity': '/identity-test',
      'faceViz': '/face-viz-test', 
      'fusion': '/fusion-test'
    };
    
    if (pageMap[pageName]) {
      window.location.hash = pageMap[pageName];
      await this.waitForPageLoad();
      this.currentPage = pageName;
    }
  }

  // ==================== IdentityTest 测试用例 ====================
  
  async testIdentityCustomFeatures() {
    console.log('\n📋 测试 IdentityTest 自定义测试功能...');
    
    // 切换到自定义测试标签
    try {
      const customTab = this.findElementByText('.el-tabs__item', '自定义测试');
      if (customTab) {
        customTab.click();
        await this.sleep(500);
      }
    } catch (error) {
      console.log('未找到自定义测试标签，可能已在当前页面');
    }

    // 测试快速填入功能
    try {
      await this.testIdentityQuickFill();
    } catch (error) {
      this.recordResult('identity', '快速填入功能', false, { error: error.message });
    }

    // 测试表格编辑功能
    try {
      await this.testIdentityTableEditing();
    } catch (error) {
      this.recordResult('identity', '表格编辑功能', false, { error: error.message });
    }

    // 测试用户信息编辑
    try {
      await this.testIdentityUserInfoEditing();
    } catch (error) {
      this.recordResult('identity', '用户信息编辑', false, { error: error.message });
    }

    // 测试JSON预览
    try {
      await this.testIdentityJsonPreview();
    } catch (error) {
      this.recordResult('identity', 'JSON预览功能', false, { error: error.message });
    }

    // 测试预期结果选择
    try {
      await this.testIdentityExpectedResult();
    } catch (error) {
      this.recordResult('identity', '预期结果选择', false, { error: error.message });
    }

    // 测试运行测试功能
    try {
      await this.testIdentityRunTest();
    } catch (error) {
      this.recordResult('identity', '运行测试功能', false, { error: error.message });
    }

    // 测试重置功能
    try {
      await this.testIdentityReset();
    } catch (error) {
      this.recordResult('identity', '重置功能', false, { error: error.message });
    }
  }

  async testIdentityQuickFill() {
    // 测试正常示例按钮 - 使用精确的选择器
    const normalBtn = this.findElementByText('button', '正常示例');
    if (normalBtn) {
      normalBtn.click();
      await this.sleep(500);
      
      // 检查表格是否有数据
      const table = document.querySelector('.el-table');
      if (table) {
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 3) {
          this.recordResult('identity', '正常示例快速填入', true);
        } else {
          this.recordResult('identity', '正常示例快速填入', false, { expected: 3, actual: rows.length });
        }
      } else {
        this.recordResult('identity', '正常示例快速填入', false, { error: '未找到表格' });
      }
    } else {
      this.recordResult('identity', '正常示例快速填入', false, { error: '未找到正常示例按钮' });
    }

    // 测试随机生成按钮
    const randomBtn = this.findElementByText('button', '随机生成');
    if (randomBtn) {
      randomBtn.click();
      await this.sleep(500);
      
      const table = document.querySelector('.el-table');
      if (table) {
        const newRows = table.querySelectorAll('tbody tr');
        if (newRows.length >= 2 && newRows.length <= 6) {
          this.recordResult('identity', '随机生成快速填入', true);
        } else {
          this.recordResult('identity', '随机生成快速填入', false, { expected: '2-6', actual: newRows.length });
        }
      }
    }

    // 测试清空按钮
    const clearBtn = this.findElementByText('button', '清空');
    if (clearBtn) {
      clearBtn.click();
      await this.sleep(500);
      
      const table = document.querySelector('.el-table');
      if (table) {
        const emptyRows = table.querySelectorAll('tbody tr');
        if (emptyRows.length === 0) {
          this.recordResult('identity', '清空功能', true);
        } else {
          this.recordResult('identity', '清空功能', false, { expected: 0, actual: emptyRows.length });
        }
      }
    }
  }

  async testIdentityTableEditing() {
    // 先添加一些数据
    const addBtn = this.findElementByText('button', '添加行');
    if (addBtn) {
      addBtn.click();
      await this.sleep(300);
      addBtn.click();
      await this.sleep(300);

      // 测试编辑表格数据
      const table = document.querySelector('.el-table');
      if (table) {
        const firstInput = table.querySelector('tbody tr:first-child td:nth-child(2) input');
        if (firstInput) {
          firstInput.value = '100.5';
          firstInput.dispatchEvent(new Event('input'));
          await this.sleep(200);

          // 验证JSON预览是否更新
          const jsonPreview = document.querySelector('.json-display');
          if (jsonPreview) {
            const jsonContent = jsonPreview.textContent;
            if (jsonContent.includes('100.5')) {
              this.recordResult('identity', '表格数据编辑', true);
            } else {
              this.recordResult('identity', '表格数据编辑', false, { content: jsonContent });
            }
          }
        }

        // 测试删除行功能
        const deleteBtn = table.querySelector('tbody tr:last-child .el-button');
        if (deleteBtn) {
          deleteBtn.click();
          await this.sleep(200);

          const remainingRows = table.querySelectorAll('tbody tr');
          if (remainingRows.length === 1) {
            this.recordResult('identity', '删除行功能', true);
          } else {
            this.recordResult('identity', '删除行功能', false, { expected: 1, actual: remainingRows.length });
          }
        }
      }
    }
  }

  async testIdentityUserInfoEditing() {
    // 测试特征数量控制
    const featureCountInput = document.querySelector('input[type="number"]');
    if (featureCountInput) {
      featureCountInput.value = 5;
      featureCountInput.dispatchEvent(new Event('change'));
      await this.sleep(300);

      // 验证特征数量是否更新
      const featureInputs = document.querySelectorAll('.feature-item input');
      if (featureInputs.length === 5) {
        this.recordResult('identity', '用户信息特征数量控制', true);
      } else {
        this.recordResult('identity', '用户信息特征数量控制', false, { expected: 5, actual: featureInputs.length });
      }

      // 测试特征值编辑
      if (featureInputs.length > 0) {
        const firstFeatureInput = featureInputs[0];
        firstFeatureInput.value = '25';
        firstFeatureInput.dispatchEvent(new Event('input'));
        await this.sleep(200);

        // 验证JSON预览是否更新
        const jsonPreview = document.querySelector('.json-display');
        if (jsonPreview) {
          const jsonContent = jsonPreview.textContent;
          if (jsonContent.includes('25')) {
            this.recordResult('identity', '用户信息特征编辑', true);
          } else {
            this.recordResult('identity', '用户信息特征编辑', false, { content: jsonContent });
          }
        }
      }
    } else {
      this.recordResult('identity', '用户信息特征数量控制', false, { error: '未找到特征数量输入框' });
    }
  }

  async testIdentityJsonPreview() {
    // 验证JSON预览格式
    const jsonPreview = document.querySelector('.json-display');
    if (jsonPreview) {
      const jsonContent = jsonPreview.textContent;
      
      try {
        const parsed = JSON.parse(jsonContent);
        if (parsed.trans_series && parsed.user_info) {
          this.recordResult('identity', 'JSON预览格式', true);
        } else {
          this.recordResult('identity', 'JSON预览格式', false, { parsed });
        }
      } catch (error) {
        this.recordResult('identity', 'JSON预览格式', false, { error: error.message, content: jsonContent });
      }
    } else {
      this.recordResult('identity', 'JSON预览格式', false, { error: '未找到JSON预览元素' });
    }
  }

  async testIdentityExpectedResult() {
    // 测试预期结果选择
    const errorRadio = document.querySelector('input[type="radio"][value="error"]');
    if (errorRadio) {
      errorRadio.click();
      await this.sleep(200);

      if (errorRadio.checked) {
        this.recordResult('identity', '预期结果选择', true);
      } else {
        this.recordResult('identity', '预期结果选择', false);
      }
    } else {
      this.recordResult('identity', '预期结果选择', false, { error: '未找到错误选项单选框' });
    }
  }

  async testIdentityRunTest() {
    // 测试运行测试按钮
    const runBtn = this.findElementByText('button', '运行测试');
    if (runBtn && !runBtn.disabled) {
      this.recordResult('identity', '运行测试按钮状态', true);
    } else {
      this.recordResult('identity', '运行测试按钮状态', false, { disabled: runBtn?.disabled });
    }
  }

  async testIdentityReset() {
    // 测试重置功能
    const resetBtn = this.findElementByText('button', '重置');
    if (resetBtn) {
      resetBtn.click();
      await this.sleep(300);
      this.recordResult('identity', '重置功能', true);
    } else {
      this.recordResult('identity', '重置功能', false, { error: '未找到重置按钮' });
    }
  }

  // ==================== FaceVizTest 测试用例 ====================
  
  async testFaceVizCustomFeatures() {
    console.log('\n📋 测试 FaceVizTest 自定义测试功能...');
    
    // 切换到自定义测试标签
    try {
      const customTab = this.findElementByText('.el-tabs__item', '自定义测试');
      if (customTab) {
        customTab.click();
        await this.sleep(500);
      }
    } catch (error) {
      console.log('未找到自定义测试标签，可能已在当前页面');
    }

    // 测试图像输入功能
    try {
      await this.testFaceVizImageInput();
    } catch (error) {
      this.recordResult('faceViz', '图像输入功能', false, { error: error.message });
    }

    // 测试预期结果选择
    try {
      await this.testFaceVizExpectedResult();
    } catch (error) {
      this.recordResult('faceViz', '预期结果选择', false, { error: error.message });
    }

    // 测试运行测试功能
    try {
      await this.testFaceVizRunTest();
    } catch (error) {
      this.recordResult('faceViz', '运行测试功能', false, { error: error.message });
    }

    // 测试重置功能
    try {
      await this.testFaceVizReset();
    } catch (error) {
      this.recordResult('faceViz', '重置功能', false, { error: error.message });
    }
  }

  async testFaceVizImageInput() {
    // 测试图像输入 - 使用精确的选择器
    const inputs = document.querySelectorAll('input[type="text"]');
    const imageInputs = Array.from(inputs).filter(input => 
      input.placeholder && input.placeholder.includes('文件名')
    );
    
    if (imageInputs.length >= 2) {
      imageInputs[0].value = 'test1.png';
      imageInputs[0].dispatchEvent(new Event('input'));
      await this.sleep(200);

      imageInputs[1].value = 'test2.png';
      imageInputs[1].dispatchEvent(new Event('input'));
      await this.sleep(200);

      if (imageInputs[0].value === 'test1.png' && imageInputs[1].value === 'test2.png') {
        this.recordResult('faceViz', '图像输入功能', true);
      } else {
        this.recordResult('faceViz', '图像输入功能', false, { 
          image1: imageInputs[0].value, 
          image2: imageInputs[1].value 
        });
      }
    } else {
      this.recordResult('faceViz', '图像输入功能', false, { error: '未找到图像输入框', found: inputs.length });
    }
  }

  async testFaceVizExpectedResult() {
    // 测试预期结果选择
    const differentPersonRadio = document.querySelector('input[type="radio"][value="different_person"]');
    if (differentPersonRadio) {
      differentPersonRadio.click();
      await this.sleep(200);

      if (differentPersonRadio.checked) {
        this.recordResult('faceViz', '预期结果选择', true);
      } else {
        this.recordResult('faceViz', '预期结果选择', false);
      }
    } else {
      this.recordResult('faceViz', '预期结果选择', false, { error: '未找到不同人选项' });
    }
  }

  async testFaceVizRunTest() {
    // 测试运行测试按钮
    const runBtn = this.findElementByText('button', '运行测试');
    if (runBtn && !runBtn.disabled) {
      this.recordResult('faceViz', '运行测试按钮状态', true);
    } else {
      this.recordResult('faceViz', '运行测试按钮状态', false, { disabled: runBtn?.disabled });
    }
  }

  async testFaceVizReset() {
    // 测试重置功能
    const resetBtn = this.findElementByText('button', '重置');
    if (resetBtn) {
      resetBtn.click();
      await this.sleep(300);
      this.recordResult('faceViz', '重置功能', true);
    } else {
      this.recordResult('faceViz', '重置功能', false, { error: '未找到重置按钮' });
    }
  }

  // ==================== FusionTest 测试用例 ====================
  
  async testFusionCustomFeatures() {
    console.log('\n📋 测试 FusionTest 自定义测试功能...');
    
    // 切换到自定义测试标签
    try {
      const customTab = this.findElementByText('.el-tabs__item', '自定义测试');
      if (customTab) {
        customTab.click();
        await this.sleep(500);
      }
    } catch (error) {
      console.log('未找到自定义测试标签，可能已在当前页面');
    }

    // 测试模态数据输入
    try {
      await this.testFusionModalInput();
    } catch (error) {
      this.recordResult('fusion', '模态数据输入', false, { error: error.message });
    }

    // 测试预期结果选择
    try {
      await this.testFusionExpectedResult();
    } catch (error) {
      this.recordResult('fusion', '预期结果选择', false, { error: error.message });
    }

    // 测试运行测试功能
    try {
      await this.testFusionRunTest();
    } catch (error) {
      this.recordResult('fusion', '运行测试功能', false, { error: error.message });
    }

    // 测试重置功能
    try {
      await this.testFusionReset();
    } catch (error) {
      this.recordResult('fusion', '重置功能', false, { error: error.message });
    }
  }

  async testFusionModalInput() {
    // 测试模态数据输入
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    if (inputs.length > 0) {
      inputs[0].value = 'test_data';
      inputs[0].dispatchEvent(new Event('input'));
      await this.sleep(200);
      
      this.recordResult('fusion', '模态数据输入', true);
    } else {
      this.recordResult('fusion', '模态数据输入', false, { reason: '未找到输入框' });
    }
  }

  async testFusionExpectedResult() {
    // 测试预期结果选择
    const errorRadio = document.querySelector('input[type="radio"][value="error"]');
    if (errorRadio) {
      errorRadio.click();
      await this.sleep(200);
      
      if (errorRadio.checked) {
        this.recordResult('fusion', '预期结果选择', true);
      } else {
        this.recordResult('fusion', '预期结果选择', false);
      }
    } else {
      this.recordResult('fusion', '预期结果选择', false, { reason: '未找到预期结果选择器' });
    }
  }

  async testFusionRunTest() {
    // 测试运行测试按钮
    const runBtn = this.findElementByText('button', '运行测试');
    if (runBtn && !runBtn.disabled) {
      this.recordResult('fusion', '运行测试按钮状态', true);
    } else {
      this.recordResult('fusion', '运行测试按钮状态', false, { disabled: runBtn?.disabled });
    }
  }

  async testFusionReset() {
    // 测试重置功能
    const resetBtn = this.findElementByText('button', '重置');
    if (resetBtn) {
      resetBtn.click();
      await this.sleep(300);
      this.recordResult('fusion', '重置功能', true);
    } else {
      this.recordResult('fusion', '重置功能', false, { reason: '未找到重置按钮' });
    }
  }

  // ==================== 测试执行主函数 ====================
  
  async runAllTests() {
    console.log('🚀 开始执行前端自定义测试功能自动化测试...');
    this.testStartTime = Date.now();
    
    try {
      // 测试 IdentityTest 页面
      await this.navigateToPage('identity');
      await this.testIdentityCustomFeatures();
      
      // 测试 FaceVizTest 页面
      await this.navigateToPage('faceViz');
      await this.testFaceVizCustomFeatures();
      
      // 测试 FusionTest 页面
      await this.navigateToPage('fusion');
      await this.testFusionCustomFeatures();
      
    } catch (error) {
      console.error('测试执行过程中发生错误:', error);
    }
    
    // 生成测试报告
    this.generateTestReport();
  }

  // 生成测试报告
  generateTestReport() {
    const testEndTime = Date.now();
    const totalDuration = ((testEndTime - this.testStartTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 前端自定义测试功能测试报告');
    console.log('='.repeat(60));
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;
    
    Object.keys(this.testResults).forEach(page => {
      const result = this.testResults[page];
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTests += result.total;
      
      console.log(`\n📄 ${page.toUpperCase()} 页面测试结果:`);
      console.log(`   总测试数: ${result.total}`);
      console.log(`   通过: ${result.passed} ✅`);
      console.log(`   失败: ${result.failed} ❌`);
      console.log(`   通过率: ${result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : 0}%`);
      
      if (result.failed > 0) {
        console.log('\n   失败详情:');
        result.details.filter(d => !d.passed).forEach(detail => {
          console.log(`   - ${detail.testName}: ${detail.details.error || '未知错误'}`);
        });
      }
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log('📈 总体测试结果:');
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   总通过: ${totalPassed} ✅`);
    console.log(`   总失败: ${totalFailed} ❌`);
    console.log(`   总体通过率: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);
    console.log(`   测试耗时: ${totalDuration} 秒`);
    console.log('='.repeat(60));
    
    // 保存测试结果到全局变量
    window.testResults = this.testResults;
    window.testReport = {
      totalTests,
      totalPassed,
      totalFailed,
      passRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0,
      duration: totalDuration,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n💡 测试结果已保存到 window.testResults 和 window.testReport');
  }
}

// 创建测试运行器实例
const testRunner = new FrontendTestRunner();

// 导出测试函数
window.runFrontendTests = () => testRunner.runAllTests();

// 导出单个页面测试函数
window.testIdentityPage = () => {
  testRunner.navigateToPage('identity').then(() => testRunner.testIdentityCustomFeatures());
};

window.testFaceVizPage = () => {
  testRunner.navigateToPage('faceViz').then(() => testRunner.testFaceVizCustomFeatures());
};

window.testFusionPage = () => {
  testRunner.navigateToPage('fusion').then(() => testRunner.testFusionCustomFeatures());
};

// 导出测试结果获取函数
window.getTestResults = () => testRunner.testResults;

console.log(`
🎯 前端自定义测试功能自动化测试脚本已加载！

使用方法：
1. 运行所有测试: runFrontendTests()
2. 测试单个页面:
   - testIdentityPage()    // 测试身份风险评估页面
   - testFaceVizPage()     // 测试人脸可视化页面  
   - testFusionPage()      // 测试多模态融合页面
3. 获取测试结果: getTestResults()

开始测试: runFrontendTests()
`); 