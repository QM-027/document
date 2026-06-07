<template>
  <div class="function-module">
    <div
      class="function-card"
      v-for="(func, index) in functions"
      :key="index"
      @click="navigateTo(func.route)"
    >
      <div class="function-card-top"></div>
      <div class="function-card-body">
        <div class="function-icon-box">
          <span class="function-num">{{ String.fromCharCode(65 + index) }}</span>
        </div>
        <div class="function-info">
          <p class="function-name">{{ func.name }}</p>
          <p class="function-desc">{{ func.desc }}</p>
        </div>
        <i class="function-arrow el-icon-arrow-right"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FunctionModule',
  data() {
    return {
      functions: [
        { name: '问题回顾', desc: '修复问题工具', route: '/questionInfo' },
        { name: '反向齿轮', desc: '逆向分析工具', route: '/select' },
        { name: '数据处理', desc: '清洗数据工具', route: '/json' },
        { name: '动图分析', desc: '动画解析工具', route: '/gifInfo' },
      ]
    }
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route)
    }
  }
}
</script>

<style scoped>
.function-module {
  padding: 24px 32px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.function-card {
  width: 220px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.function-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
}

.function-card:hover .function-card-top {
  opacity: 1;
}

.function-card:hover .function-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #667eea;
}

.function-card-top {
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.function-card-body {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  gap: 14px;
}

.function-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.function-num {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.function-info {
  flex: 1;
  min-width: 0;
}

.function-name {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  margin: 0;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.function-desc {
  font-size: 12px;
  color: #909399;
  margin: 6px 0 0;
  line-height: 1.5;
}

.function-arrow {
  font-size: 16px;
  color: #c0c4cc;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s;
  flex-shrink: 0;
}

/* 响应式 */
@media screen and (max-width: 480px) {
  .function-module {
    padding: 16px;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .function-card {
    width: 100%;
    max-width: 300px;
  }

  .function-card-body {
    padding: 14px 16px;
    gap: 12px;
  }

  .function-icon-box {
    width: 38px;
    height: 38px;
  }

  .function-num {
    font-size: 16px;
  }

  .function-name {
    font-size: 14px;
  }

  .function-desc {
    font-size: 11px;
  }
}
</style>
