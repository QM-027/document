<template>
  <div class="page-header" :class="{ 'header-shadow': headerShadow }">
    <div class="welcome-message">
      <img src="@/assets/svg/qm1.svg" alt="icon" @click="$router.push('/')" class="header-icon"/>
      <p class="greeting" @click="$router.push('/')">千梦大总管</p>
    </div>

    <div class="header-right">
      <el-dropdown @command="handleCommand" v-if="nickname">
        <div class="user-info">
          <i class="el-icon-user user-avatar"><el-icon><UserFilled /></el-icon></i>
          <span class="user-name">{{ nickname }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="save">新增</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="user-info" v-else>
        <el-button @click="$router.push('/login')">登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { UserFilled } from '@element-plus/icons-vue'
import { logout } from '@/api/auth'
import { removeToken, removeUser, getUser } from '@/utils/auth'

export default {
  name: 'AppHeader',
  components: {
    UserFilled
  },
  props: {
    headerShadow: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    nickname() {
      const user = getUser();
      return user ? (user.nickname || user.email) : '';
    }
  },
  methods: {
    async handleCommand(command) {
      if (command === 'logout') {
        try {
          await this.$confirm('确定要退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
        } catch (e) {
          return; // 用户取消
        }
        try {
          await logout();
        } catch (e) {
          // 即使接口失败也继续清除本地数据
        }
        removeToken();
        removeUser();
        this.$router.push('/login');
        this.$message.success('退出成功');
      } else {
        this.$router.push({ path: `/${command}` });
      }
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
  cursor: pointer;
}

.header-icon {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.greeting {
  font-size: 1.7rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-link {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  margin-left: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none !important;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
