<template>
  <div class="answer-input">
    <div class="input-header">
      <span class="input-label">你的答案</span>
      <span class="char-count">
        <span :class="{ 'count-warning': charCount > maxChars * 0.9 }">{{ charCount }}</span>
        / {{ maxChars }} 字
      </span>
    </div>

    <el-input
      type="textarea"
      v-model="answer"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxChars"
      show-word-limit
      resize="vertical"
      @input="handleInput"
      :disabled="disabled"
    ></el-input>

    <div class="input-footer">
      <div class="input-tips">
        <i class="el-icon-edit"></i>
        <span>请尽可能详细地回答，包含关键知识点和实际项目经验</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnswerInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入你的答案...'
    },
    rows: {
      type: Number,
      default: 8
    },
    maxChars: {
      type: Number,
      default: 2000
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      answer: this.modelValue
    };
  },
  computed: {
    charCount() {
      return this.answer ? this.answer.length : 0;
    }
  },
  watch: {
    modelValue(newVal) {
      this.answer = newVal;
    }
  },
  methods: {
    handleInput(val) {
      this.$emit('update:modelValue', val);
    },
    clear() {
      this.answer = '';
      this.$emit('update:modelValue', '');
    },
    focus() {
      this.$el.querySelector('textarea').focus();
    }
  }
};
</script>

<style scoped>
.answer-input {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.input-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.char-count {
  font-size: 13px;
  color: #909399;
}

.count-warning {
  color: #e6a23c;
}

.answer-input :deep(.el-textarea__inner) {
  font-size: 15px;
  line-height: 1.6;
  padding: 12px;
  border-radius: 6px;
}

.input-footer {
  margin-top: 12px;
}

.input-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

.input-tips i {
  color: #409eff;
}

@media screen and (max-width: 768px) {
  .answer-input {
    padding: 12px;
  }

  .answer-input :deep(.el-textarea__inner) {
    font-size: 14px;
  }

  .input-tips {
    font-size: 11px;
  }
}

@media screen and (max-width: 480px) {
  .answer-input {
    padding: 10px;
  }

  .input-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .answer-input :deep(.el-textarea__inner) {
    font-size: 13px;
  }
}
</style>
