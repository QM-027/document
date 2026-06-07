<template>
  <div class="mind-map" ref="mindMap">
    <!-- SVG 连接线 -->
    <svg class="mind-map-svg" :width="svgWidth" :height="svgHeight">
      <path
        v-for="(line, index) in lines"
        :key="index"
        :d="line.path"
        :stroke="line.color"
        :stroke-width="line.width"
        :stroke-dasharray="line.dashed ? '6,4' : 'none'"
        :opacity="line.opacity"
        fill="none"
      />
    </svg>

    <!-- 节点容器 -->
    <div class="mind-map-content">
      <!-- 总览节点 -->
      <div class="map-node root" ref="rootNode">
        <span class="node-label">总览</span>
      </div>

      <!-- 分支列表 -->
      <div class="branches">
        <div
          class="branch"
          v-for="(branch, bIndex) in treeData"
          :key="bIndex"
          ref="branchNodes"
        >
          <!-- 一级节点 -->
          <div
            class="map-node level1"
            :style="getLevel1Style(bIndex)"
            ref="level1Nodes"
          >
            <span class="node-label">{{ branch.name }}</span>
          </div>

          <!-- 叶子节点列表 -->
          <div class="leaves" v-if="branch.children">
            <div
              class="map-node leaf"
              v-for="(child, cIndex) in branch.children"
              :key="cIndex"
              :style="getLeafStyle(bIndex)"
              @click="$emit('node-click', child)"
              :ref="'leaf-' + bIndex + '-' + cIndex"
            >
              <span class="node-label">{{ child.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MindMap',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      colors: [
        '#4C6EF5',
        '#40C057',
        '#FD7E14',
        '#7950F2',
        '#F06595',
        '#20C997',
        '#FA5252',
        '#339AF0',
      ],
      lines: [],
      svgWidth: 100,
      svgHeight: 100
    }
  },
  computed: {
    treeData() {
      return this.data || []
    }
  },
  watch: {
    data: {
      handler() {
        this.$nextTick(() => {
          this.calcLines()
        })
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.calcLines()
    })
    window.addEventListener('resize', this.calcLines)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calcLines)
  },
  methods: {
    getNodeRect(el) {
      if (!el) return null
      const mapRect = this.$refs.mindMap.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      return {
        x: rect.left - mapRect.left + rect.width / 2,
        y: rect.top - mapRect.top + rect.height / 2,
        top: rect.top - mapRect.top,
        bottom: rect.top - mapRect.top + rect.height,
        width: rect.width,
        height: rect.height
      }
    },
    calcLines() {
      const lines = []
      const mapEl = this.$refs.mindMap
      if (!mapEl) return

      this.svgWidth = mapEl.offsetWidth
      this.svgHeight = mapEl.offsetHeight

      const rootNode = this.$refs.rootNode
      const rootRect = this.getNodeRect(rootNode)
      if (!rootRect) return

      const level1Nodes = this.$refs.level1Nodes || []

      this.treeData.forEach((branch, bIndex) => {
        const color = this.colors[bIndex % this.colors.length]
        const level1Node = level1Nodes[bIndex]
        const level1Rect = this.getNodeRect(level1Node)
        if (!level1Rect) return

        // 根节点到一级节点（实线）
        lines.push({
          path: `M ${rootRect.x} ${rootRect.bottom} C ${rootRect.x} ${(rootRect.bottom + level1Rect.top) / 2}, ${level1Rect.x} ${(rootRect.bottom + level1Rect.top) / 2}, ${level1Rect.x} ${level1Rect.top}`,
          color: color,
          width: 3,
          opacity: 0.6,
          dashed: false
        })

        if (branch.children) {
          let prevBottom = level1Rect.bottom

          branch.children.forEach((child, cIndex) => {
            const leafRef = this.$refs['leaf-' + bIndex + '-' + cIndex]
            const leafNode = leafRef ? leafRef[0] : null
            if (!leafNode) return

            const leafRect = this.getNodeRect(leafNode)
            if (!leafRect) return

            // 一级到叶子（虚线）
            lines.push({
              path: `M ${level1Rect.x} ${prevBottom + 4} L ${leafRect.x} ${leafRect.top - 3}`,
              color: color,
              width: 1.5,
              opacity: 0.25,
              dashed: true
            })

            prevBottom = leafRect.bottom
          })
        }
      })

      this.lines = lines
    },
    getLevel1Style(bIndex) {
      const color = this.colors[bIndex % this.colors.length]
      return { background: color }
    },
    getLeafStyle(bIndex) {
      const color = this.colors[bIndex % this.colors.length]
      return {
        background: color + '15',
        color: '#333'
      }
    }
  }
}
</script>

<style scoped>
.mind-map {
  position: relative;
  padding: 20px 40px 40px;
}

.mind-map-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
}

.mind-map-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 节点通用样式 */
.map-node {
  padding: 10px 20px;
  border-radius: 20px;
  white-space: nowrap;
  cursor: default;
  transition: all 0.25s;
}

.node-label {
  font-size: 14px;
  font-weight: 600;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 总览节点 */
.map-node.root {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #fff;
  padding: 14px 28px;
  box-shadow: 0 6px 20px rgba(44, 62, 80, 0.35);
  margin-bottom: 30px;
}

.map-node.root .node-label {
  font-size: 16px;
}

/* 一级节点 */
.map-node.level1 {
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.map-node.level1:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* 分支容器 */
.branches {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.branch {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 叶子节点容器 */
.leaves {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

/* 叶子节点 */
.map-node.leaf {
  padding: 8px 18px;
  border-radius: 16px;
  cursor: pointer;
}

.map-node.leaf .node-label {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.map-node.leaf:hover {
  transform: translateX(4px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  filter: brightness(0.95);
}
</style>
