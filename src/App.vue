<template>
  <div id="app-container">
    <AppHeader v-if="showLayout" :header-shadow="headerShadow" />
    <router-view :class="{ 'main-content': showLayout }" />
    <FooterBeian v-if="showLayout" />
    <FloatingBackButton />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import FloatingBackButton from '@/components/FloatingBackButton.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    FloatingBackButton
  },
  data() {
    return {
      headerShadow: false
    }
  },
  computed: {
    showLayout() {
      const path = this.$route.path
      return path !== '/404' && path !== '/401' && path !== '/waiting' && path !== '/verify' && path !== '/login'
    }
  }
}
</script>


<style>
/* 全局样式 */

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1 1 0%;
  overflow-y: auto;
}

.el-loading-mask {
  background-color: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px); /* 毛玻璃效果 */
}
</style>
