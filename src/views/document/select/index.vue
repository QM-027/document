<template>
  <div class="wheel-viewport">
    <div class="wheel-container">
      <div
          class="wheel-wrapper"
          ref="wrapper"
          :style="{ width: baseSize + 'px', height: baseSize + 'px' }"
      >
        <canvas ref="canvas"></canvas>

        <!-- 中心按钮和指针 -->
        <div class="center-btn" @click="handleCenterClick">
          <div class="pointer"></div>
          <div class="label">开始</div>
        </div>
      </div>
    </div>

    <!-- 当前选中结果 -->
    <p class="current-select">{{ currentSelect }}</p>
  </div>
</template>

<script>
export default {
  name: "Select",
  data() {
    return {
      baseSize: 520,
      dpr: window.devicePixelRatio || 1,
      prizes: [],
      prizeTexts: ["接受", "同意", "承诺", "拒绝", "抵制", "否认"],
      colorSet: ["#aed0fa", "#608ddc", "#72a9f7"],
      ctx: null,
      radius: 0,
      rotation: 0,
      isSpinning: false,
      duration: 3000, // 动画持续时间（毫秒）
      minTurns: 6, // 最少转几圈
      currentSelect: "",
      resizeObserver: null,
      currentScale: 1,
    };
  },

  mounted() {
    // 初始化奖项及颜色循环
    this.prizes = this.prizeTexts.map((t, i) => ({
      text: t,
      color: this.colorSet[i % this.colorSet.length],
    }));

    this.setupCanvas();
    this.drawWheel();
    this.updateScale(); // 初始缩放

    // 使用 ResizeObserver 监听窗口变化
    this.resizeObserver = new ResizeObserver(this.updateScale);
    this.resizeObserver.observe(document.body);
  },

  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },

  methods: {
    setupCanvas() {
      const canvas = this.$refs.canvas;
      const size = this.baseSize;
      this.dpr = window.devicePixelRatio || 1;

      canvas.width = size * this.dpr;
      canvas.height = size * this.dpr;
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";

      const ctx = canvas.getContext("2d");
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.ctx = ctx;
      this.radius = size / 2;
    },

    updateScale() {
      const wrapper = this.$refs.wrapper;
      if (!wrapper) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 计算缩放比例，为转盘和间距预留空间
      const availableHeight = viewportHeight - 60; // 减去顶部20px + 结果文本20px + 额外边距20px
      const scale = Math.min(
          1,
          Math.min(viewportWidth, availableHeight) * 0.85 / this.baseSize
      );

      this.currentScale = scale;
      wrapper.style.transform = `scale(${scale})`;
    },

    drawWheel() {
      const ctx = this.ctx;
      const size = this.baseSize;
      const radius = this.radius;
      const count = this.prizes.length;
      const anglePer = (Math.PI * 2) / count;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(this.rotation);

      for (let i = 0; i < count; i++) {
        const start = i * anglePer;
        const end = (i + 1) * anglePer;

        // 扇形
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius - 4, start, end);
        ctx.fillStyle = this.prizes[i].color;
        ctx.fill();

        // 文字
        const mid = start + anglePer / 2;
        ctx.save();
        ctx.rotate(mid);
        ctx.translate(radius * 0.62, 0);
        ctx.rotate(Math.PI / 2);

        ctx.fillStyle = "#06305f";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const text = this.prizes[i].text;
        if (text.length > 8) {
          ctx.fillText(text.slice(0, 4), 0, -10);
          ctx.fillText(text.slice(4), 0, 10);
        } else {
          ctx.fillText(text, 0, 0);
        }

        ctx.restore();
      }

      ctx.restore();
    },

    handleCenterClick() {
      if (this.isSpinning) return;
      const index = Math.floor(Math.random() * this.prizes.length);
      this.spinToIndex(index);
    },

    spinToIndex(index) {
      if (this.isSpinning) return;
      const count = this.prizes.length;
      const anglePer = (Math.PI * 2) / count;

      let current = this.rotation % (Math.PI * 2);
      if (current < 0) current += Math.PI * 2;

      const targetMid = index * anglePer + anglePer / 2;
      const baseTarget = -Math.PI / 2 - targetMid;
      let final = baseTarget + this.minTurns * Math.PI * 2;

      if (final < current) final += Math.PI * 2;

      const start = current;
      const end = final;
      const startTime = performance.now();

      this.isSpinning = true;

      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / this.duration);
        const ease = 1 - Math.pow(1 - t, 3);
        this.rotation = start + (end - start) * ease;
        this.drawWheel();

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          this.isSpinning = false;
          this.rotation =
              (this.rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          this.drawWheel();
          this.currentSelect = this.prizes[index].text;
        }
      };

      requestAnimationFrame(tick);
    },
  },
};
</script>

<style scoped>
.wheel-viewport {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 使用固定像素值确保精确间距 */
  padding-top: 20px; /* 转盘距离顶部20px */
}

.wheel-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  /* 确保容器高度正确计算 */
  min-height: 0;
}

.wheel-wrapper {
  position: relative;
  transform-origin: center top; /* 从顶部开始缩放 */
  margin: 0;
  padding: 0;
  /* 确保没有额外的边距影响 */
}

.current-select {
  /* 使用固定像素值，不受缩放影响 */
  margin-top: 20px; /* 结果文本距离转盘20px */
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 0;
  /* 确保文本在缩放时位置准确 */
  position: relative;
  z-index: 10;
}

.center-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80px;
  height: 80px;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15), inset 0 -4px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
}

.pointer {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 20px solid #ff5b5b;
}

.label {
  font-size: 14px;
  color: #12305f;
  font-weight: bold;
}

/* 确保在小屏幕上也能正确显示 */
@media (max-width: 768px) {
  .wheel-viewport {
    padding-top: 20px; /* 保持固定20px */
  }

  .current-select {
    margin-top: 20px; /* 保持固定20px */
    font-size: 20px; /* 适当调整字体大小 */
  }
}

@media (max-width: 480px) {
  .current-select {
    font-size: 18px; /* 在小屏幕上进一步调整字体大小 */
  }
}
</style>
