<template>
  <div id="app-container">
    <router-view />

  </div>
</template>

<script>
// 可以在这里引入组件等
export default {
  name: 'App',
  // ...
}
</script>


<style>
/* 全局样式 */

.el-loading-mask {
  background-color: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px); /* 毛玻璃效果 */
}
</style>
