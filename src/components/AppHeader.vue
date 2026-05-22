<template>
  <div class="page-header" :class="{ 'header-shadow': headerShadow }">
    <div class="welcome-message">
      <img src="@/assets/svg/qm1.svg" alt="icon" class="header-icon"/>
      <p class="greeting">千梦大总管</p>
    </div>

    <div class="dropdown-group">
      <el-button v-if="showBack" type="text" class="back-btn" @click="goBack">
        返回
      </el-button>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">设置</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="waiting">新增</el-dropdown-item>
            <el-dropdown-item command="waiting">开发</el-dropdown-item>
            <el-dropdown-item divided command="select">反向齿轮</el-dropdown-item>
            <el-dropdown-item command="json">JSON格式化</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { ArrowLeft } from '@element-plus/icons-vue'

export default {
  name: 'AppHeader',
  components: {
    ArrowLeft
  },
  props: {
    headerShadow: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    showBack() {
      return this.$route.path !== '/'
    }
  },
  methods: {
    handleCommand(command) {
      this.$router.push({ path: `/${command}` });
    },
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.page-header {
  flex: 0 0 60px;
  height: 60px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: none;
  border-bottom: 1px solid transparent;
  transition: border-bottom-color 0.3s;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid #eee;
}

.page-header.header-shadow {
  box-shadow: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.welcome-message {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-radius: 10px;
}

.header-icon {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.greeting {
  font-size: 1.7rem;
  color: #2f5cf6;
  font-weight: bold;
  margin: 0;
}

.dropdown-group {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.back-btn {
  margin-right: 16px;
  font-weight: 500;
  font-size: 1rem;
  color: #606165;
}

.el-dropdown-link {
  outline: none !important;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.el-dropdown-link:focus, .el-dropdown-link:active {
  outline: none !important;
  box-shadow: none !important;
}

@media screen and (max-width: 768px) {
  .page-header {
    flex: 0 0 60px;
    height: 60px;
    padding: 0 16px;
  }

  .header-icon {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }

  .greeting {
    font-size: 1.4rem;
  }

  .el-dropdown-link {
    font-size: 0.9rem;
  }
}

@media screen and (min-width: 769px) and (max-width: 1200px) {
  .page-header {
    padding: 0 24px;
  }
}
</style>
