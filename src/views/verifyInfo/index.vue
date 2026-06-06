<template>
  <div class="verify-info-page">
    <interview-panel></interview-panel>
  </div>
</template>

<script>
import InterviewPanel from './components/InterviewPanel.vue';

export default {
  name: 'VerifyInfo',
  components: {
    InterviewPanel
  }
};
</script>

<style>
.verify-info-page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
