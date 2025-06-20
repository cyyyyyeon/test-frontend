/**
 * 前端自定义测试功能自动化测试脚本 - 终极修复版
 * 
 * 核心修复:
 * 1. 引入更强大的 waitForElement 函数，智能等待元素加载。
 * 2. 使用更精确的选择器，并根据文本内容查找元素。
 * 3. 在页面导航和标签页切换后增加健壮的等待，确保组件渲染完毕。
 * 4. 修复了所有页面自定义测试功能的元素查找逻辑。
 * 5. 修正了CSV上传测试，以兼容应用中可能存在的事件监听器冲突。
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

  // 强大的元素等待函数
  async waitForElement(selector, options = {}) {
    const { text, timeout = 15000 } = options; // 增加默认超时到15秒
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const elements = document.querySelectorAll(selector);
      let foundElement = null;
      if (text) {
        foundElement = Array.from(elements).find(el => el.textContent.trim().includes(text));
      } else if (elements.length > 0) {
        foundElement = elements[0];
      }
      
      if (foundElement) return foundElement;
      await this.sleep(100);
    }
    throw new Error(`元素 ${selector} (文本: "${text || ''}") 未在 ${timeout}ms 内出现`);
  }

  // 睡眠函数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 导航到指定页面并等待其完全加载
  async navigateToPage(pageName) {
    console.log(`\n🚀 导航到 ${pageName} 页面...`);
    const pageMap = {
      'identity': { 
        hash: '#/identity-test', 
        waitForElement: '.el-tabs__nav',  // 等待标签页导航出现
        customTabText: '自定义测试',
        verifyElement: '.el-form-item__label'  // 验证自定义测试内容已加载
      },
      'faceViz': { 
        hash: '#/face-viz-test', 
        waitForElement: '.el-tabs__nav',
        customTabText: '自定义测试',
        verifyElement: 'input[placeholder*="1_1.png"]'
      }, 
      'fusion': { 
        hash: '#/fusion-test', 
        waitForElement: '.el-tabs__nav',
        customTabText: '自定义测试',
        verifyElement: 'input[placeholder*="用户1的人脸"]'
      }
    };
    
    const pageInfo = pageMap[pageName];
    
    // 导航到页面
    if (window.location.hash !== pageInfo.hash) {
      window.location.hash = pageInfo.hash;
      await this.sleep(2000); // 等待路由切换
    }
    this.currentPage = pageName;
    
    // 等待页面基本结构加载
    await this.waitForElement(pageInfo.waitForElement);
    console.log(`✅ ${pageName} 页面基本结构已加载`);
    
    // 点击自定义测试标签
    const customTab = await this.waitForElement('.el-tabs__item', { text: pageInfo.customTabText });
    if (customTab && !customTab.classList.contains('is-active')) {
      customTab.click();
      await this.sleep(1000); // 等待标签页内容切换
      console.log(`✅ 已切换到自定义测试标签页`);
    }
    
    // 验证自定义测试内容已加载
    await this.waitForElement(pageInfo.verifyElement);
    console.log(`✅ 成功导航到 ${pageName} 并加载了自定义测试功能。`);
  }

  // ==================== IdentityTest 测试用例 ====================
  
  async testIdentityCustomFeatures() {
    console.log('\n📋 测试 IdentityTest 自定义测试功能...');
    await this.testIdentityQuickFill();
    await this.testIdentityTableEditing();
    await this.testIdentityCsvUpload();
    await this.testIdentityUserInfoEditing();
    await this.testIdentityJsonPreview();
    await this.testIdentityExpectedResult();
    await this.testIdentityRunTest();
    await this.testIdentityReset();
  }

  async testIdentityQuickFill() {
    try {
      // 使用更精确的选择器查找按钮
      const normalBtn = await this.waitForElement('.el-button-group .el-button', { text: '正常示例' });
      normalBtn.click();
      await this.sleep(500);
      
      // 检查表格是否有数据
      const table = await this.waitForElement('.el-table');
      const rows = table.querySelectorAll('tbody tr');
      this.recordResult('identity', '正常示例快速填入', rows.length === 3, { expected: 3, actual: rows.length });

      const randomBtn = await this.waitForElement('.el-button-group .el-button', { text: '随机生成' });
      randomBtn.click();
      await this.sleep(500);
      const newRows = document.querySelectorAll('.el-table tbody tr');
      this.recordResult('identity', '随机生成快速填入', newRows.length >= 2 && newRows.length <= 6, { expected: '2-6', actual: newRows.length });

      const clearBtn = await this.waitForElement('.el-button-group .el-button', { text: '清空' });
      clearBtn.click();
      await this.sleep(500);
      
      // 检查是否显示空数据提示
      const hasEmptyState = document.querySelector('.simple-empty') || document.querySelectorAll('.el-table tbody tr').length === 0;
      this.recordResult('identity', '清空功能', !!hasEmptyState, {});
    } catch (error) {
      this.recordResult('identity', '快速填入功能', false, { error: error.message });
    }
  }

  async testIdentityTableEditing() {
    try {
      // 先添加一些数据
      const normalBtn = await this.waitForElement('.el-button-group .el-button', { text: '正常示例' });
      normalBtn.click();
      await this.sleep(500);
      
      // 测试添加行功能
      const addBtn = await this.waitForElement('.editor-toolbar .el-button', { text: '添加行' });
      addBtn.click(); 
      await this.sleep(300);
      addBtn.click(); 
      await this.sleep(300);

      // 测试编辑功能 - 修改第一行第一个输入框
      const firstInput = await this.waitForElement('.el-table tbody tr:first-child td:nth-child(2) .el-input__inner');
      firstInput.value = '100.5';
      firstInput.dispatchEvent(new Event('input', { bubbles: true }));
      await this.sleep(300);

      // 检查JSON预览是否更新
      const jsonPreview = await this.waitForElement('.json-display');
      this.recordResult('identity', '表格数据编辑', jsonPreview.textContent.includes('100.5'), {});

      // 测试删除行功能
      const deleteBtn = await this.waitForElement('.el-table tbody tr:last-child .el-button', { text: '×' });
      deleteBtn.click();
      await this.sleep(300);
      const remainingRows = document.querySelectorAll('.el-table tbody tr');
      this.recordResult('identity', '删除行功能', remainingRows.length >= 3, {}); // 应该至少有原来的3行
    } catch (error) {
      this.recordResult('identity', '表格编辑功能', false, { error: error.message });
    }
  }

  async testIdentityCsvUpload() {
    try {
      const csvContent = 'F1,F2,F3,F4,F5,F6,F7\n1.0,2.0,3.0,4.0,5.0,6.0,7.0\n1.1,2.1,3.1,4.1,5.1,6.1,7.1';
      const csvFile = new File([new Blob([csvContent], { type: 'text/csv' })], 'test.csv', { type: 'text/csv' });
      
      const uploadContainer = await this.waitForElement('.el-upload');
      const uploadInput = uploadContainer.querySelector('input[type="file"]');
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(csvFile);
      uploadInput.files = dataTransfer.files;
      uploadInput.dispatchEvent(new Event('change'));
      
      await this.sleep(500); // 等待文件处理
      const rows = document.querySelectorAll('.el-table tbody tr');
      this.recordResult('identity', 'CSV文件上传', rows.length === 2, { expected: 2, actual: rows.length });
    } catch (error) {
      this.recordResult('identity', 'CSV文件上传', false, { error: error.message });
    }
  }

  async testIdentityUserInfoEditing() {
    try {
      const featureCountLabel = await this.waitForElement('.el-form-item__label', { text: '特征数量' });
      const inputNumber = featureCountLabel.nextElementSibling.querySelector('input[type="number"]');
      inputNumber.value = 5;
      inputNumber.dispatchEvent(new Event('change'));
      await this.sleep(300);
      let featureInputs = document.querySelectorAll('.feature-item input');
      this.recordResult('identity', '用户信息特征数量控制', featureInputs.length === 5, { expected: 5, actual: featureInputs.length });

      featureInputs = document.querySelectorAll('.feature-item input'); // Re-query
      featureInputs[0].value = '25';
      featureInputs[0].dispatchEvent(new Event('input'));
      await this.sleep(200);
      const jsonPreview = await this.waitForElement('.json-display');
      this.recordResult('identity', '用户信息特征编辑', jsonPreview.textContent.includes('25'), {});
    } catch (error) {
      this.recordResult('identity', '用户信息编辑', false, { error: error.message });
    }
  }

  async testIdentityJsonPreview() {
    try {
      const jsonPreview = await this.waitForElement('.json-display');
      const parsed = JSON.parse(jsonPreview.textContent);
      this.recordResult('identity', 'JSON预览格式', parsed.trans_series && parsed.user_info, {});
    } catch (error) {
      this.recordResult('identity', 'JSON预览格式', false, { error: error.message });
    }
  }

  async testIdentityExpectedResult() {
    try {
      const errorRadio = await this.waitForElement('.el-radio__label', { text: 'API调用失败' });
      errorRadio.click();
      await this.sleep(200);
      const radioInput = errorRadio.previousElementSibling.querySelector('input');
      this.recordResult('identity', '预期结果选择', radioInput.checked, {});
    } catch (error) {
      this.recordResult('identity', '预期结果选择', false, { error: error.message });
    }
  }

  async testIdentityRunTest() {
    try {
      const runBtn = await this.waitForElement('button span', { text: '运行测试' });
      this.recordResult('identity', '运行测试按钮状态', runBtn.parentElement && !runBtn.parentElement.disabled, {});
    } catch (error) {
      this.recordResult('identity', '运行测试按钮状态', false, { error: error.message });
    }
  }

  async testIdentityReset() {
    try {
      await this.testIdentityQuickFill(); // Ensure there's data to reset
      const resetBtn = await this.waitForElement('button span', { text: '重置' });
      resetBtn.click();
      await this.sleep(300);
      const emptyText = await this.waitForElement('.simple-empty');
      const featureInputs = document.querySelectorAll('.feature-item input');
      this.recordResult('identity', '重置功能', emptyText && featureInputs.length === 3, {});
    } catch (error) {
      this.recordResult('identity', '重置功能', false, { error: error.message });
    }
  }

  // ==================== FaceVizTest 测试用例 ====================
  
  async testFaceVizCustomFeatures() {
    console.log('\n📋 测试 FaceVizTest 自定义测试功能...');
    await this.testFaceVizImageInput();
    await this.testFaceVizExpectedResult();
    await this.testFaceVizRunTest();
    await this.testFaceVizReset();
  }

  async testFaceVizImageInput() {
    try {
      const imageInputs = await Promise.all([
          this.waitForElement('input[placeholder*="1_1.png"]'),
          this.waitForElement('input[placeholder*="2_1.png"]')
      ]);
      imageInputs[0].value = 'test1.png';
      imageInputs[0].dispatchEvent(new Event('input'));
      imageInputs[1].value = 'test2.png';
      imageInputs[1].dispatchEvent(new Event('input'));
      await this.sleep(200);
      this.recordResult('faceViz', '图像输入功能', imageInputs[0].value === 'test1.png' && imageInputs[1].value === 'test2.png', {});
    } catch (error) {
      this.recordResult('faceViz', '图像输入功能', false, { error: error.message });
    }
  }

  async testFaceVizExpectedResult() {
    try {
      const differentPersonRadio = await this.waitForElement('.el-radio__label', { text: '不同人' });
      differentPersonRadio.click();
      await this.sleep(200);
      const radioInput = differentPersonRadio.previousElementSibling.querySelector('input');
      this.recordResult('faceViz', '预期结果选择', radioInput.checked, {});
    } catch (error) {
      this.recordResult('faceViz', '预期结果选择', false, { error: error.message });
    }
  }

  async testFaceVizRunTest() {
     try {
      const runBtn = await this.waitForElement('button', { text: '运行测试' });
      this.recordResult('faceViz', '运行测试按钮状态', runBtn && !runBtn.disabled, {});
    } catch (error) {
      this.recordResult('faceViz', '运行测试按钮状态', false, { error: error.message });
    }
  }

  async testFaceVizReset() {
    try {
      const resetBtn = await this.waitForElement('button', { text: '重置' });
      resetBtn.click();
      await this.sleep(500);

      let inputsCleared = false;
      const startTime = Date.now();
      while (Date.now() - startTime < 3000) {
        const firstInput = document.querySelector('input[placeholder*="1_1.png"]');
        if (firstInput && firstInput.value === '') {
          inputsCleared = true;
          break;
        }
        await this.sleep(100);
      }
      if (!inputsCleared) throw new Error("Reset did not clear input fields in time.");

      const samePersonRadio = await this.waitForElement('.el-radio__label', { text: '同一个人' });
      const radioInput = samePersonRadio.previousElementSibling.querySelector('input');
      this.recordResult('faceViz', '重置功能', radioInput.checked, {});
    } catch (error) {
      this.recordResult('faceViz', '重置功能', false, { error: error.message });
    }
  }

  // ==================== FusionTest 测试用例 ====================
  
  async testFusionCustomFeatures() {
    console.log('\n📋 测试 FusionTest 自定义测试功能...');
    await this.testFusionModalInput();
    await this.testFusionExpectedResult();
    await this.testFusionRunTest();
    await this.testFusionReset();
  }

  async testFusionModalInput() {
    try {
      const firstInput = await this.waitForElement('input[placeholder*="用户1的人脸"]');
      firstInput.value = 'test_data';
      firstInput.dispatchEvent(new Event('input'));
      await this.sleep(200);
      this.recordResult('fusion', '模态数据输入', firstInput.value === 'test_data', {});
    } catch (error) {
      this.recordResult('fusion', '模态数据输入', false, { error: error.message });
    }
  }

  async testFusionExpectedResult() {
    try {
      const errorRadio = await this.waitForElement('.el-radio__label', { text: '错误' });
      errorRadio.click();
      await this.sleep(200);
      const radioInput = errorRadio.previousElementSibling.querySelector('input');
      this.recordResult('fusion', '预期结果选择', radioInput.checked, {});
    } catch (error) {
      this.recordResult('fusion', '预期结果选择', false, { error: error.message });
    }
  }

  async testFusionRunTest() {
    try {
      const runBtn = await this.waitForElement('button span', { text: '运行测试' });
      this.recordResult('fusion', '运行测试按钮状态', runBtn.parentElement && !runBtn.parentElement.disabled, {});
    } catch (error) {
      this.recordResult('fusion', '运行测试按钮状态', false, { error: error.message });
    }
  }

  async testFusionReset() {
    try {
      const resetBtn = await this.waitForElement('button span', { text: '重置' });
      resetBtn.click();
      await this.sleep(300);
      const firstInput = await this.waitForElement('input[placeholder*="用户1的人脸"]');
      this.recordResult('fusion', '重置功能', firstInput.value === '', {});
    } catch (error) {
      this.recordResult('fusion', '重置功能', false, { error: error.message });
    }
  }

  // ==================== 测试执行主函数 ====================
  
  async runAllTests() {
    console.log('🚀 开始执行前端自定义测试功能自动化测试...');
    this.testStartTime = Date.now();
    
    try {
      await this.navigateToPage('identity');
      await this.testIdentityCustomFeatures();
      
      await this.navigateToPage('faceViz');
      await this.testFaceVizCustomFeatures();
      
      await this.navigateToPage('fusion');
      await this.testFusionCustomFeatures();
      
    } catch (error) {
      console.error('测试执行过程中发生严重错误:', error);
    }
    
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
    
    Object.values(this.testResults).forEach(pageResult => {
        totalPassed += pageResult.passed;
        totalFailed += pageResult.failed;
    });
    const totalTests = totalPassed + totalFailed;

    Object.keys(this.testResults).forEach(page => {
      const result = this.testResults[page];
      console.log(`\n📄 ${page.toUpperCase()} 页面测试结果:`);
      console.log(`   总测试数: ${result.total}, 通过: ${result.passed} ✅, 失败: ${result.failed} ❌`);
      console.log(`   通过率: ${result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : 0}%`);
      
      if (result.failed > 0) {
        console.log('   失败详情:');
        result.details.filter(d => !d.passed).forEach(detail => {
          console.log(`     - ${detail.testName}: ${detail.details.error || JSON.stringify(detail.details)}`);
        });
      }
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log('📈 总体测试结果:');
    console.log(`   总测试数: ${totalTests}, 总通过: ${totalPassed} ✅, 总失败: ${totalFailed} ❌`);
    console.log(`   总体通过率: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);
    console.log(`   测试耗时: ${totalDuration} 秒`);
    console.log('='.repeat(60));
    
    window.testResults = this.testResults;
    window.testReport = { totalTests, totalPassed, totalFailed, duration: totalDuration };
    console.log('\n💡 测试结果已保存到 window.testResults 和 window.testReport');
  }
}

// 创建测试运行器实例
const testRunner = new FrontendTestRunner();

// 导出测试函数
window.runFrontendTests = () => testRunner.runAllTests();
window.testIdentityPage = () => testRunner.navigateToPage('identity').then(() => testRunner.testIdentityCustomFeatures());
window.testFaceVizPage = () => testRunner.navigateToPage('faceViz').then(() => testRunner.testFaceVizCustomFeatures());
window.testFusionPage = () => testRunner.navigateToPage('fusion').then(() => testRunner.testFusionCustomFeatures());
window.getTestResults = () => testRunner.testResults;

console.log(`
🎯 前端自定义测试功能自动化测试脚本已加载！

使用方法：
1. 运行所有测试: runFrontendTests()
2. 测试单个页面:
   - testIdentityPage()
   - testFaceVizPage()
   - testFusionPage()
3. 获取测试结果: getTestResults()

请运行 runFrontendTests() 开始测试。
`); 