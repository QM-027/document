<template>
  <div class="wheel-viewport">
    <div class="wheel-container">
      <div
          class="wheel-wrapper"
          ref="wrapper"
          :style="wrapperStyle"
      >
        <canvas ref="canvas"></canvas>

        <!-- 中心按钮和指针 - 使用动态样式 -->
        <div class="center-btn" @click="handleCenterClick" :style="centerBtnStyle">
          <div class="pointer" :style="pointerStyle"></div>
          <div class="label" :style="labelStyle">开始</div>
        </div>
      </div>
    </div>

    <!-- 当前选中结果 -->
    <div class="result-container">
      <p class="current-select" v-if="currentSelect">{{ currentSelect }}</p>
    </div>
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
      duration: 3000,
      minTurns: 6,
      currentSelect: "",
      resizeObserver: null,
      currentWheelSize: 520,
    };
  },

  computed: {
    wrapperStyle() {
      return {
        width: this.currentWheelSize + 'px',
        height: this.currentWheelSize + 'px',
      };
    },

    // 动态计算中心按钮尺寸（转盘尺寸的 15.4%，原始 80/520）
    centerBtnStyle() {
      const size = Math.max(50, Math.min(80, this.currentWheelSize * 0.154));
      return {
        width: size + 'px',
        height: size + 'px',
      };
    },

    // 动态计算指针样式
    pointerStyle() {
      const scale = this.currentWheelSize / 520;
      const borderWidth = Math.max(8, Math.min(12, 12 * scale));
      const borderHeight = Math.max(14, Math.min(20, 20 * scale));
      const top = Math.max(-16, Math.min(-22, -22 * scale));

      return {
        top: top + 'px',
        borderLeft: `${borderWidth}px solid transparent`,
        borderRight: `${borderWidth}px solid transparent`,
        borderBottom: `${borderHeight}px solid #ff5b5b`,
      };
    },

    // 动态计算标签字体大小
    labelStyle() {
      const fontSize = Math.max(12, Math.min(16, this.currentWheelSize * 0.031));
      return {
        fontSize: fontSize + 'px',
      };
    },
  },

  mounted() {
    // 初始化奖项及颜色循环
    this.prizes = this.prizeTexts.map((t, i) => ({
      text: t,
      color: this.colorSet[i % this.colorSet.length],
    }));

    this.setupCanvas();
    this.updateSize();
    this.drawWheel();

    // 使用 ResizeObserver 监听窗口变化
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSize();
    });
    this.resizeObserver.observe(document.body);

    // 兼容性：同时监听 resize 事件
    window.addEventListener('resize', this.updateSize);
  },

  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('resize', this.updateSize);
  },

  methods: {
    setupCanvas() {
      const canvas = this.$refs.canvas;
      this.dpr = window.devicePixelRatio || 1;
      this.ctx = canvas.getContext("2d");
    },

    updateSize() {
      // 计算转盘尺寸：屏幕宽度的 1/3
      const viewportWidth = window.innerWidth;
      const targetSize = Math.floor(viewportWidth / 3);

      // 设置最小和最大尺寸限制
      const minSize = 200; // 最小尺寸
      const maxSize = 600; // 最大尺寸
      this.currentWheelSize = Math.max(minSize, Math.min(maxSize, targetSize));

      // 更新 canvas
      const canvas = this.$refs.canvas;
      const size = this.currentWheelSize;

      canvas.width = size * this.dpr;
      canvas.height = size * this.dpr;
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";

      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.radius = size / 2;
      this.baseSize = size;

      // 重新绘制转盘
      this.drawWheel();
    },

    drawWheel() {
      const ctx = this.ctx;
      const size = this.currentWheelSize;
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

        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius - 4, start, end);
        ctx.fillStyle = this.prizes[i].color;
        ctx.fill();

        // 绘制边框（可选，让扇形更清晰）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制文字 - 动态调整字体和位置
        const mid = start + anglePer / 2;
        ctx.save();
        ctx.rotate(mid);

        // 文字位置随转盘大小调整
        const textRadius = radius * 0.62;
        ctx.translate(textRadius, 0);
        ctx.rotate(Math.PI / 2);

        ctx.fillStyle = "#06305f";
        // 根据转盘大小动态调整字体
        const fontSize = Math.max(12, Math.min(20, size / 26));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const text = this.prizes[i].text;
        // 根据字体大小调整行距
        const lineSpacing = fontSize * 0.7;

        if (text.length > 8) {
          ctx.fillText(text.slice(0, 4), 0, -lineSpacing);
          ctx.fillText(text.slice(4), 0, lineSpacing);
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
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.wheel-viewport {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 40px 0;
  overflow-x: hidden;
}

.wheel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
}

.wheel-wrapper {
  position: relative;
  flex-shrink: 0;
}

canvas {
  display: block;
}

.result-container {
  width: 100%;
  margin-top: 20px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.current-select {
  font-size: clamp(18px, 4vw, 28px);
  font-weight: bold;
  text-align: center;
  color: #06305f;
  word-wrap: break-word;
  max-width: 100%;
  line-height: 1.4;
  min-height: 1.4em;
}

.center-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15), inset 0 -4px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s;
}

.center-btn:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2), inset 0 -4px 8px rgba(0, 0, 0, 0.08);
}

.center-btn:active {
  transform: translate(-50%, -50%) scale(0.95);
}

.pointer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
}

.label {
  color: #06305f;
  font-weight: bold;
  user-select: none;
}

/* 针对小屏幕优化 */
@media (max-width: 768px) {
  .wheel-viewport {
    padding: 15px 0 30px 0;
  }

  .result-container {
    margin-top: 20px;
    padding: 0 15px;
  }
}

/* 针对超小屏幕优化 */
@media (max-width: 480px) {
  .wheel-viewport {
    padding: 15px 0 25px 0;
  }

  .result-container {
    margin-top: 20px;
  }
}

/* 针对平板横屏优化 */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .wheel-viewport {
    padding: 20px 0;
  }
}

/* 针对大屏幕优化 */
@media (min-width: 1200px) {
  .wheel-viewport {
    padding: 30px 0 50px 0;
  }

  .result-container {
    margin-top: 20px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .center-btn {
    /* 增大触摸区域 */
    min-width: 60px;
    min-height: 60px;
  }
}
</style>
