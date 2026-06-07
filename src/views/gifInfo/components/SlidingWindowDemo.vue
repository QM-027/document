<template>
  <div class="rate-limiter-demo">
    <div class="demo-header">
      <h1>滑动窗口计数器限流算法演示</h1>
      <p class="subtitle">通过交互式动画理解接口限流的工作原理</p>
    </div>

    <div class="demo-content">
      <!-- 算法说明区域 -->
      <div class="section algorithm-explanation">
        <h2>算法原理</h2>
        <div class="explanation-grid">
          <div class="explanation-card">
            <div class="card-icon">🪟</div>
            <h3>核心思想</h3>
            <p>将时间窗口划分为多个小的子窗口，每个子窗口独立计数，通过滑动窗口来平滑限流效果</p>
          </div>
          <div class="explanation-card">
            <div class="card-icon">⚖️</div>
            <h3>加权计算</h3>
            <p>使用加权公式计算当前请求速率，考虑前一个窗口的重叠部分</p>
          </div>
          <div class="explanation-card">
            <div class="card-icon">🎯</div>
            <h3>精确限流</h3>
            <p>避免固定窗口的临界问题，提供更平滑的限流体验</p>
          </div>
        </div>
      </div>

      <!-- 交互式配置区域 -->
      <div class="section config-section">
        <h2>参数配置</h2>
        <div class="config-grid">
          <div class="config-item">
            <label>时间窗口大小</label>
            <div class="config-control">
              <input
                v-model.number="config.windowSize"
                type="range"
                min="1"
                max="10"
                step="1"
                :disabled="isRunning"
              />
              <span class="config-value">{{ config.windowSize }} 秒</span>
            </div>
          </div>
          <div class="config-item">
            <label>最大请求数</label>
            <div class="config-control">
              <input
                v-model.number="config.maxRequests"
                type="range"
                min="1"
                max="20"
                step="1"
                :disabled="isRunning"
              />
              <span class="config-value">{{ config.maxRequests }} 次/窗口</span>
            </div>
          </div>
          <div class="config-item">
            <label>子窗口数量</label>
            <div class="config-control">
              <input
                v-model.number="config.subWindows"
                type="range"
                min="2"
                max="10"
                step="1"
                :disabled="isRunning"
              />
              <span class="config-value">{{ config.subWindows }} 个</span>
            </div>
          </div>
          <div class="config-item">
            <label>请求频率</label>
            <div class="config-control">
              <input
                v-model.number="config.requestRate"
                type="range"
                min="100"
                max="2000"
                step="100"
                :disabled="isRunning"
              />
              <span class="config-value">{{ config.requestRate }}ms/次</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 可视化窗口区域 -->
      <div class="section visualization-section">
        <h2>滑动窗口可视化</h2>
        <div class="window-container">
          <!-- 时间轴 -->
          <div class="timeline">
            <div class="timeline-label">时间轴</div>
            <div class="timeline-bar">
              <div
                v-for="(subWindow, index) in subWindows"
                :key="index"
                class="sub-window"
                :class="{
                  'active': subWindow.active,
                  'current': subWindow.isCurrent,
                  'expired': subWindow.expired
                }"
                :style="{ width: `${100 / config.subWindows}%` }"
              >
                <div class="sub-window-content">
                  <div class="sub-window-label">{{ index + 1 }}</div>
                  <div class="sub-window-count">{{ subWindow.count }}</div>
                  <div
                    class="sub-window-bar"
                    :style="{ height: `${(subWindow.count / config.maxRequests) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 滑动窗口指示器 -->
          <div class="sliding-indicator">
            <div
              class="sliding-window"
              :style="{
                left: `${slidingWindowPosition}%`,
                width: `${100 / config.subWindows * slidingWindowSize}%`
              }"
            >
              <div class="sliding-window-label">当前窗口</div>
            </div>
          </div>

          <!-- 请求计数器 -->
          <div class="counter-display">
            <div class="counter-item">
              <div class="counter-label">当前窗口请求数</div>
              <div class="counter-value" :class="{ 'warning': isNearLimit, 'danger': isOverLimit }">
                {{ currentWindowRequests }}
              </div>
            </div>
            <div class="counter-item">
              <div class="counter-label">限制阈值</div>
              <div class="counter-value limit">{{ config.maxRequests }}</div>
            </div>
            <div class="counter-item">
              <div class="counter-label">剩余配额</div>
              <div class="counter-value" :class="{ 'warning': isNearLimit, 'danger': isOverLimit }">
                {{ remainingRequests }}
              </div>
            </div>
            <div class="counter-item">
              <div class="counter-label">状态</div>
              <div class="counter-status" :class="limiterStatusClass">
                {{ limiterStatusText }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制按钮区域 -->
      <div class="section control-section">
        <h2>交互控制</h2>
        <div class="control-buttons">
          <button
            class="btn btn-primary"
            @click="sendSingleRequest"
            :disabled="isRunning"
          >
            发送单次请求
          </button>
          <button
            class="btn btn-success"
            @click="startAutoRequests"
            :disabled="isRunning"
          >
            {{ isRunning ? '运行中...' : '启动自动请求' }}
          </button>
          <button
            class="btn btn-danger"
            @click="stopAutoRequests"
            :disabled="!isRunning"
          >
            停止自动请求
          </button>
          <button
            class="btn btn-secondary"
            @click="resetDemo"
          >
            重置演示
          </button>
        </div>
      </div>

      <!-- 请求日志区域 -->
      <div class="section log-section">
        <h2>请求日志</h2>
        <div class="log-container">
          <div class="log-header">
            <div class="log-time">时间</div>
            <div class="log-status">状态</div>
            <div class="log-count">请求数</div>
            <div class="log-result">结果</div>
          </div>
          <div class="log-body">
            <div
              v-for="(log, index) in requestLogs"
              :key="index"
              class="log-entry"
              :class="{ 'log-denied': log.denied }"
            >
              <div class="log-time">{{ log.time }}</div>
              <div class="log-status">
                <span class="status-dot" :class="log.denied ? 'denied' : 'allowed'"></span>
                {{ log.denied ? '拒绝' : '允许' }}
              </div>
              <div class="log-count">{{ log.count }}/{{ config.maxRequests }}</div>
              <div class="log-result">
                <span class="result-badge" :class="log.denied ? 'badge-danger' : 'badge-success'">
                  {{ log.denied ? '429' : '200' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 算法对比区域 -->
      <div class="section comparison-section">
        <h2>算法对比</h2>
        <div class="comparison-grid">
          <div class="comparison-card">
            <h3>固定窗口</h3>
            <div class="comparison-visual">
              <div class="window-demo fixed">
                <div class="window-block"></div>
                <div class="window-block active"></div>
              </div>
            </div>
            <ul class="comparison-list">
              <li class="pro">实现简单</li>
              <li class="pro">内存占用少</li>
              <li class="con">临界问题严重</li>
              <li class="con">突发流量处理差</li>
            </ul>
          </div>

          <div class="comparison-card featured">
            <h3>滑动窗口计数器</h3>
            <div class="comparison-visual">
              <div class="window-demo sliding">
                <div class="window-block"></div>
                <div class="window-block"></div>
                <div class="window-block active"></div>
                <div class="window-block active"></div>
              </div>
            </div>
            <ul class="comparison-list">
              <li class="pro">平滑限流</li>
              <li class="pro">解决临界问题</li>
              <li class="pro">内存占用适中</li>
              <li class="neutral">实现较复杂</li>
            </ul>
          </div>

          <div class="comparison-card">
            <h3>滑动窗口日志</h3>
            <div class="comparison-visual">
              <div class="window-demo log">
                <div class="log-dots">
                  <span v-for="i in 8" :key="i" class="dot"></span>
                </div>
              </div>
            </div>
            <ul class="comparison-list">
              <li class="pro">最精确</li>
              <li class="pro">完美平滑</li>
              <li class="con">内存占用大</li>
              <li class="con">性能开销高</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 加权计算公式 -->
      <div class="section formula-section">
        <h2>加权计算公式</h2>
        <div class="formula-container">
          <div class="formula-box">
            <div class="formula-title">滑动窗口请求数计算</div>
            <div class="formula-content">
              <span class="formula-text">
                请求数 = 前一窗口请求数 × 重叠比例 + 当前窗口请求数
              </span>
              <div class="formula-example">
                例如：窗口大小 1s，子窗口 4 个，前一窗口 8 次，当前窗口 3 次，重叠 75%
                <br/>
                <strong>计算：</strong>8 × 0.75 + 3 = 9 次
              </div>
            </div>
          </div>
          <div class="formula-box">
            <div class="formula-title">限流判断</div>
            <div class="formula-content">
              <span class="formula-text">
                if (请求数 > 最大请求数) → 拒绝请求 (429)
              </span>
              <span class="formula-text">
                else → 允许请求 (200)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 实际应用场景 -->
      <div class="section scenarios-section">
        <h2>实际应用场景</h2>
        <div class="scenarios-grid">
          <div class="scenario-card">
            <div class="scenario-icon">🌐</div>
            <h3>API 网关</h3>
            <p>保护后端服务免受突发流量冲击，确保服务稳定性</p>
          </div>
          <div class="scenario-card">
            <div class="scenario-icon">🔐</div>
            <h3>登录保护</h3>
            <p>防止暴力破解攻击，限制登录尝试次数</p>
          </div>
          <div class="scenario-card">
            <div class="scenario-icon">📧</div>
            <h3>邮件发送</h3>
            <p>控制邮件发送频率，避免被标记为垃圾邮件</p>
          </div>
          <div class="scenario-card">
            <div class="scenario-icon">💬</div>
            <h3>消息推送</h3>
            <p>限制推送频率，提升用户体验</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SlidingWindowDemo',
  data() {
    return {
      config: {
        windowSize: 5,      // 时间窗口大小（秒）
        maxRequests: 10,     // 最大请求数
        subWindows: 5,       // 子窗口数量
        requestRate: 500     // 请求频率（ms）
      },
      subWindows: [],
      slidingWindowPosition: 0,
      slidingWindowSize: 3,
      currentWindowRequests: 0,
      previousWindowRequests: 0,
      requestLogs: [],
      isRunning: false,
      autoRequestTimer: null,
      windowSlideTimer: null,
      requestCounter: 0
    }
  },
  computed: {
    isNearLimit() {
      return this.currentWindowRequests >= this.config.maxRequests * 0.8
    },
    isOverLimit() {
      return this.currentWindowRequests >= this.config.maxRequests
    },
    remainingRequests() {
      return Math.max(0, this.config.maxRequests - this.currentWindowRequests)
    },
    limiterStatusClass() {
      if (this.isOverLimit) return 'status-danger'
      if (this.isNearLimit) return 'status-warning'
      return 'status-normal'
    },
    limiterStatusText() {
      if (this.isOverLimit) return '已限流'
      if (this.isNearLimit) return '接近限制'
      return '正常'
    }
  },
  mounted() {
    this.initSubWindows()
    this.startWindowSlide()
  },
  beforeUnmount() {
    this.stopAutoRequests()
    this.stopWindowSlide()
  },
  methods: {
    initSubWindows() {
      this.subWindows = Array.from({ length: this.config.subWindows }, (_, i) => ({
        count: 0,
        active: i === 0,
        isCurrent: i === 0,
        expired: false
      }))
    },

    startWindowSlide() {
      const slideInterval = (this.config.windowSize * 1000) / this.config.subWindows
      this.windowSlideTimer = setInterval(() => {
        this.slideWindow()
      }, slideInterval)
    },

    stopWindowSlide() {
      if (this.windowSlideTimer) {
        clearInterval(this.windowSlideTimer)
        this.windowSlideTimer = null
      }
    },

    slideWindow() {
      // 保存前一个窗口的计数
      const currentIndex = this.subWindows.findIndex(w => w.isCurrent)
      if (currentIndex !== -1) {
        this.previousWindowRequests = this.subWindows[currentIndex].count
      }

      // 移动所有窗口状态
      this.subWindows.forEach((window, index) => {
        if (window.isCurrent) {
          window.isCurrent = false
          window.active = true
        } else if (index === currentIndex + 1) {
          window.isCurrent = true
          window.active = true
          window.count = 0
        } else if (index > currentIndex + 1) {
          window.expired = true
        }
      })

      // 更新滑动窗口位置
      this.slidingWindowPosition = Math.min(
        100 - (100 / this.config.subWindows * this.slidingWindowSize),
        this.slidingWindowPosition + (100 / this.config.subWindows)
      )

      // 重置过期窗口的计数
      this.subWindows.forEach((window, index) => {
        if (index < currentIndex - 1) {
          window.count = 0
        }
      })

      // 更新当前窗口请求数
      this.updateCurrentWindowRequests()
    },

    updateCurrentWindowRequests() {
      const currentIndex = this.subWindows.findIndex(w => w.isCurrent)
      if (currentIndex === -1) return

      // 计算滑动窗口内的总请求数（加权）
      let totalRequests = 0
      const windowCount = Math.min(this.slidingWindowSize, this.subWindows.length)

      for (let i = 0; i < windowCount; i++) {
        const windowIndex = (currentIndex - i + this.subWindows.length) % this.subWindows.length
        const window = this.subWindows[windowIndex]

        if (i === 0) {
          // 当前窗口完整计入
          totalRequests += window.count
        } else {
          // 前面的窗口按比例计入
          const weight = 1 - (i / windowCount)
          totalRequests += Math.floor(window.count * weight)
        }
      }

      this.currentWindowRequests = totalRequests
    },

    sendSingleRequest() {
      this.requestCounter++
      const now = new Date()
      const timeStr = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      // 判断是否应该限流
      const isDenied = this.currentWindowRequests >= this.config.maxRequests

      if (!isDenied) {
        // 增加当前子窗口的计数
        const currentIndex = this.subWindows.findIndex(w => w.isCurrent)
        if (currentIndex !== -1) {
          this.subWindows[currentIndex].count++
        }
        this.updateCurrentWindowRequests()
      }

      // 添加日志
      this.requestLogs.unshift({
        time: timeStr,
        count: this.currentWindowRequests,
        denied: isDenied,
        requestId: this.requestCounter
      })

      // 限制日志数量
      if (this.requestLogs.length > 20) {
        this.requestLogs.pop()
      }
    },

    startAutoRequests() {
      if (this.isRunning) return

      this.isRunning = true
      this.autoRequestTimer = setInterval(() => {
        this.sendSingleRequest()
      }, this.config.requestRate)
    },

    stopAutoRequests() {
      this.isRunning = false
      if (this.autoRequestTimer) {
        clearInterval(this.autoRequestTimer)
        this.autoRequestTimer = null
      }
    },

    resetDemo() {
      this.stopAutoRequests()
      this.stopWindowSlide()

      this.currentWindowRequests = 0
      this.previousWindowRequests = 0
      this.requestLogs = []
      this.requestCounter = 0
      this.slidingWindowPosition = 0

      this.initSubWindows()
      this.startWindowSlide()
    }
  },

  watch: {
    'config.subWindows': {
      handler() {
        this.resetDemo()
      },
      deep: true
    },
    'config.windowSize': {
      handler() {
        this.resetDemo()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.rate-limiter-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h1 {
  font-size: 28px;
  color: #1a1a1a;
  margin-bottom: 10px;
  font-weight: 700;
}

.demo-header .subtitle {
  font-size: 16px;
  color: #666;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f2f5;
}

/* 算法说明区域 */
.explanation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.explanation-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.explanation-card .card-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.explanation-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.explanation-card p {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.6;
}

/* 配置区域 */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.config-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.config-item label {
  display: block;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.config-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-control input[type="range"] {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: linear-gradient(to right, #667eea, #764ba2);
  border-radius: 3px;
  outline: none;
}

.config-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: white;
  border: 3px solid #667eea;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
}

.config-value {
  min-width: 80px;
  font-weight: 600;
  color: #667eea;
  font-family: 'JetBrains Mono', monospace;
}

/* 可视化区域 */
.window-container {
  position: relative;
  margin-top: 20px;
}

.timeline {
  margin-bottom: 30px;
}

.timeline-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.timeline-bar {
  display: flex;
  height: 120px;
  background: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
}

.sub-window {
  position: relative;
  border-right: 2px solid #fff;
  background: #e8ecf1;
  transition: all 0.3s ease;
}

.sub-window:last-child {
  border-right: none;
}

.sub-window.active {
  background: #d4dce6;
}

.sub-window.current {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.sub-window.expired {
  background: #c0c4cc;
  opacity: 0.6;
}

.sub-window-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.sub-window-label {
  font-size: 10px;
  color: #606266;
  margin-bottom: 4px;
}

.sub-window.current .sub-window-label {
  color: white;
}

.sub-window-count {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  font-family: 'JetBrains Mono', monospace;
}

.sub-window.current .sub-window-count {
  color: white;
}

.sub-window-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(102, 126, 234, 0.3);
  transition: height 0.3s ease;
}

.sub-window.current .sub-window-bar {
  background: rgba(255, 255, 255, 0.3);
}

/* 滑动窗口指示器 */
.sliding-indicator {
  position: relative;
  height: 40px;
  margin-bottom: 20px;
}

.sliding-window {
  position: absolute;
  height: 100%;
  background: rgba(102, 126, 234, 0.2);
  border: 2px solid #667eea;
  border-radius: 6px;
  transition: all 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sliding-window-label {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
}

/* 计数器显示 */
.counter-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.counter-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.counter-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.counter-value {
  font-size: 32px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #303133;
  transition: color 0.3s ease;
}

.counter-value.warning {
  color: #e6a23c;
}

.counter-value.danger {
  color: #f56c6c;
}

.counter-value.limit {
  color: #667eea;
}

.counter-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
}

.status-normal {
  background: #f0f9eb;
  color: #67c23a;
}

.status-warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-danger {
  background: #fef0f0;
  color: #f56c6c;
}

/* 控制按钮 */
.control-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e64545 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
}

.btn-secondary {
  background: #f0f2f5;
  color: #606266;
}

.btn-secondary:hover:not(:disabled) {
  background: #e8ecf1;
}

/* 日志区域 */
.log-container {
  border: 1px solid #e8ecf1;
  border-radius: 8px;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
}

.log-header {
  display: grid;
  grid-template-columns: 150px 100px 100px 100px;
  background: #f8f9fa;
  padding: 12px 16px;
  font-weight: 600;
  color: #606266;
  font-size: 13px;
  border-bottom: 1px solid #e8ecf1;
  position: sticky;
  top: 0;
}

.log-entry {
  display: grid;
  grid-template-columns: 150px 100px 100px 100px;
  padding: 10px 16px;
  font-size: 13px;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.2s ease;
}

.log-entry:hover {
  background: #f8f9fa;
}

.log-entry.log-denied {
  background: #fef0f0;
}

.log-time {
  color: #909399;
  font-family: 'JetBrains Mono', monospace;
}

.log-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.allowed {
  background: #67c23a;
}

.status-dot.denied {
  background: #f56c6c;
}

.log-count {
  font-family: 'JetBrains Mono', monospace;
  color: #606266;
}

.result-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #f0f9eb;
  color: #67c23a;
}

.badge-danger {
  background: #fef0f0;
  color: #f56c6c;
}

/* 算法对比 */
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.comparison-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.comparison-card.featured {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.comparison-card h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 16px;
  text-align: center;
}

.comparison-visual {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.window-demo {
  display: flex;
  gap: 4px;
}

.window-block {
  width: 40px;
  height: 50px;
  background: #dcdfe6;
  border-radius: 4px;
}

.window-block.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.log-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.dot {
  width: 12px;
  height: 12px;
  background: #dcdfe6;
  border-radius: 50%;
}

.comparison-list {
  list-style: none;
  padding: 0;
}

.comparison-list li {
  padding: 6px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comparison-list li::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.comparison-list li.pro {
  color: #67c23a;
}

.comparison-list li.pro::before {
  background: #67c23a;
}

.comparison-list li.con {
  color: #f56c6c;
}

.comparison-list li.con::before {
  background: #f56c6c;
}

.comparison-list li.neutral {
  color: #909399;
}

.comparison-list li.neutral::before {
  background: #909399;
}

/* 公式区域 */
.formula-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.formula-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
}

.formula-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.9;
}

.formula-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
}

.formula-text {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.6;
}

.formula-example {
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.6;
}

/* 场景区域 */
.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.scenario-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
}

.scenario-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.scenario-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.scenario-card h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.scenario-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 768px) {
  .rate-limiter-demo {
    padding: 10px;
  }

  .demo-header h1 {
    font-size: 22px;
  }

  .section {
    padding: 16px;
  }

  .counter-display {
    grid-template-columns: repeat(2, 1fr);
  }

  .control-buttons {
    flex-direction: column;
  }

  .log-header,
  .log-entry {
    grid-template-columns: 100px 80px 80px 80px;
    font-size: 12px;
  }
}
</style>
