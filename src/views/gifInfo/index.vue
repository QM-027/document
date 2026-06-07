<script>
import SlidingWindowDemo from './components/SlidingWindowDemo.vue'

export default {
  name: "GifInfoIndex",
  components: {
    SlidingWindowDemo
  }
}
</script>

<template>
  <div class="gif-info-page">
    <SlidingWindowDemo />
  </div>
</template>

<style scoped>
.gif-info-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
}
</style>
