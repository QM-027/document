<template>
  <div class="question-info-page">
    <interview-panel></interview-panel>
  </div>
</template>

<script>
import InterviewPanel from './components/InterviewPanel.vue';

export default {
  name: 'QuestionInfo',
  components: {
    InterviewPanel
  }
};
</script>

<style>
.question-info-page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
