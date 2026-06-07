<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/svg/qm1.svg" alt="logo" class="login-logo" />
        <h2 class="login-title">千梦大总管</h2>
      </div>

      <div class="login-body">
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <el-autocomplete
            v-model="form.email"
            :fetch-suggestions="queryEmail"
            placeholder="请输入邮箱"
            size="large"
            clearable
            @keyup.enter="handleLogin"
            class="email-input"
          >
            <template #prefix>
              <i class="el-icon-message"><el-icon><Message /></el-icon></i>
            </template>
          </el-autocomplete>
        </div>

        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="code-row">
            <el-input
              v-model="form.code"
              placeholder="请输入验证码"
              size="large"
              class="code-input"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <i class="el-icon-key"><el-icon><Key /></el-icon></i>
              </template>
            </el-input>
            <el-button
              size="large"
              class="code-btn"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </div>

        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </div>
    </div>

    <!-- 备案信息 -->
    <footer-beian />
  </div>
</template>

<script>
import { Message, Key } from '@element-plus/icons-vue';
import { sendEmailCode, emailLogin } from '@/api/auth';
import { setToken, setUser } from '@/utils/auth';
import FooterBeian from "../components/FooterBeian/index.vue";

export default {
  name: 'Login',
  components: {
    FooterBeian,
    Message,
    Key
  },
  data() {
    return {
      form: {
        email: '',
        code: ''
      },
      loading: false,
      countdown: 0,
      timer: null
    };
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    queryEmail(queryString, cb) {
      const suffixes = ['@qq.com', '@gmail.com', '@163.com', '@126.com', '@outlook.com', '@foxmail.com', '@hotmail.com', '@sina.com'];
      const atIdx = queryString.indexOf('@');
      let results = [];
      if (atIdx === -1) {
        // 未输入@，展示所有后缀建议
        results = suffixes.map(s => ({ value: queryString + s }));
      } else {
        const prefix = queryString.substring(0, atIdx);
        const inputSuffix = queryString.substring(atIdx).toLowerCase();
        results = suffixes
          .filter(s => s.startsWith(inputSuffix))
          .map(s => ({ value: prefix + s }));
      }
      cb(results);
    },
    async handleSendCode() {
      if (!this.form.email) {
        this.$message.warning('请输入邮箱');
        return;
      }
      const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
      if (!emailRegex.test(this.form.email)) {
        this.$message.warning('请输入正确的邮箱格式');
        return;
      }
      try {
        await sendEmailCode(this.form.email);
        this.$message.success('验证码已发送');
        this.countdown = 60;
        this.timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(this.timer);
            this.timer = null;
          }
        }, 1000);
      } catch (error) {
        // 错误已由请求拦截器处理
      }
    },
    async handleLogin() {
      if (!this.form.email) {
        this.$message.warning('请输入邮箱');
        return;
      }
      if (!this.form.code) {
        this.$message.warning('请输入验证码');
        return;
      }
      this.loading = true;
      try {
        const res = await emailLogin({
          email: this.form.email,
          code: this.form.code
        });
        // 保存 Token
        setToken(res.data.token);
        // 保存用户信息
        setUser({
          userId: res.data.userId,
          username: res.data.username,
          email: res.data.email,
          nickname: res.data.nickname,
          avatar: res.data.avatar
        });
        this.$message.success('登录成功');
        // 跳转到首页（支持 redirect 参数）
        const redirect = this.$route.query.redirect || '/';
        this.$router.push(redirect);
      } catch (error) {
        // 错误已由请求拦截器处理
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(118, 75, 162, 0.08) 0%, transparent 50%);
  position: relative;
}

.login-card {
  width: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 25vh;
}

.login-header {
  text-align: center;
  padding: 40px 30px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.login-logo {
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.login-body {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.code-row {
  display: flex;
  gap: 12px;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 120px;
  flex-shrink: 0;
  border-radius: 8px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  margin-top: 4px;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding: 12px 0;
  background: #f0f2f5;
}

.beian-text {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.separator {
  margin: 0 10px;
  color: #999;
}

.beian-icon {
  width: 20px;
  height: 20px;
  vertical-align: text-bottom;
  margin-right: 2px;
}

.beian-link {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
  margin-left: 2px;
}

.beian-link:hover {
  color: #409EFF;
}

@media screen and (max-width: 480px) {
  .login-card {
    width: 90%;
    margin: 0 16px;
  }

  .login-header {
    padding: 30px 20px 20px;
  }

  .login-logo {
    width: 48px;
    height: 48px;
  }

  .login-title {
    font-size: 20px;
  }

  .login-body {
    padding: 24px 20px;
  }

  .code-btn {
    width: 100px;
  }
}
</style>
