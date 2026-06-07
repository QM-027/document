<template>
  <div
    v-if="showBack"
    ref="floatBtn"
    class="floating-back-btn"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="startDrag"
    @touchstart.prevent="startDrag"
    @click="handleClick"
  >
    <div class="back-icon">
      <el-icon :size="20"><ArrowLeft /></el-icon>
    </div>
  </div>
</template>

<script>
import { ArrowLeft } from '@element-plus/icons-vue'

export default {
  name: 'FloatingBackButton',
  components: {
    ArrowLeft
  },
  data() {
    return {
      position: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      hasMoved: false
    }
  },
  computed: {
    showBack() {
      return this.$route.path !== '/' && this.$route.path !== '/login'
    }
  },
  mounted() {
    // 初始化位置：右下角
    this.position = {
      x: window.innerWidth - 50,
      y: window.innerHeight - 150
    }

    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this.removeDragListeners()
  },
  methods: {
    handleResize() {
      // 确保按钮不超出屏幕
      const btnSize = 50
      this.position.x = Math.min(this.position.x, window.innerWidth - btnSize - 10)
      this.position.y = Math.min(this.position.y, window.innerHeight - btnSize - 10)
      this.position.x = Math.max(10, this.position.x)
      this.position.y = Math.max(10, this.position.y)
    },
    startDrag(e) {
      this.isDragging = true
      this.hasMoved = false

      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      this.dragStart = {
        x: clientX - this.position.x,
        y: clientY - this.position.y
      }

      this.addDragListeners()
    },
    onDrag(e) {
      if (!this.isDragging) return

      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      const newX = clientX - this.dragStart.x
      const newY = clientY - this.dragStart.y

      // 检查是否移动超过阈值
      const moveThreshold = 5
      if (Math.abs(newX - this.position.x) > moveThreshold || Math.abs(newY - this.position.y) > moveThreshold) {
        this.hasMoved = true
      }

      // 限制在屏幕范围内
      const btnSize = 50
      this.position.x = Math.max(10, Math.min(newX, window.innerWidth - btnSize - 10))
      this.position.y = Math.max(10, Math.min(newY, window.innerHeight - btnSize - 10))
    },
    endDrag() {
      this.isDragging = false
      this.removeDragListeners()

      // 吸附到最近的边缘
      this.snapToEdge()
    },
    snapToEdge() {
      const btnSize = 50
      const centerX = this.position.x + btnSize / 2
      const screenWidth = window.innerWidth

      // 如果在左半边，吸附到左边；否则吸附到右边
      if (centerX < screenWidth / 2) {
        this.position.x = 10
      } else {
        this.position.x = screenWidth - btnSize - 10
      }
    },
    handleClick() {
      // 只有在没有拖动的情况下才触发点击
      if (!this.hasMoved) {
        this.goBack()
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    addDragListeners() {
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.endDrag)
      document.addEventListener('touchmove', this.onDrag)
      document.addEventListener('touchend', this.endDrag)
    },
    removeDragListeners() {
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.endDrag)
      document.removeEventListener('touchmove', this.onDrag)
      document.removeEventListener('touchend', this.endDrag)
    }
  }
}
</script>

<style scoped>
.floating-back-btn {
  position: fixed;
  z-index: 9999;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.floating-back-btn:active {
  cursor: grabbing;
}

.back-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.2s;
}

.back-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.6);
}

.back-icon:active {
  transform: scale(0.95);
}
</style>
