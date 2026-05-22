<template>
  <div class="json-node">
    <!-- 对象 / 数组 -->
    <div v-if="isObject">
      <span class="toggle" @click="toggle">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span class="type">
        {{ toValue }}
      </span>

      <div v-show="expanded" class="children">
        <div v-for="key in keys" :key="key" class="row">
          <span class="key">{{ key }}</span>
          <span class="colon">:</span>
          <json-node :data="value[key]" :level="level + 1"/>
        </div>
      </div>
    </div>

    <!-- 基础类型 -->
    <span v-else :class="valueType">
      {{ formatValue(value) }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'JsonNode',
  props: {
    data: {},
    level: Number
  },
  data() {
    return {
      expanded: this.level < 2 // 默认只展开第一层
    }
  },
  computed: {
    toValue() {
      let arr = 'Array(' + this.value.length + ')';
      let obj = 'Object {' + this.keys.length + '}';
      if (this.expanded) {
        if (!this.value || this.value.length === 0) arr = '[]'
        if (!this.keys || this.keys.length === 0) obj = '{}'
      }

      return this.isArray ? arr : obj
    },
    value() {
      return this.data
    },
    isArray() {
      return Array.isArray(this.value)
    },
    isObject() {
      return this.value !== null && typeof this.value === 'object'
    },
    keys() {
      return this.isArray ? Object.keys(this.value) : Object.keys(this.value || {})
    },
    valueType() {
      return typeof this.value
    }
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded
    },
    formatValue(val) {
      if (typeof val === 'string') return `"${val}"`
      if (val === null) return 'null'
      return val
    }
  }
}
</script>

<style scoped>
.json-node {
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  font-weight: bold;
  line-height: 1.6;
  color: #e5e7eb;
}

.children {
  padding-left: 18px;
}

.row {
  display: flex;
}

.toggle {
  cursor: pointer;
  margin-right: 4px;
  color: #60a5fa;
}

.key {
  color: #93c5fd;
}

.colon {
  margin: 0 4px;
}

.string {
  color: #34d399;
}

.number {
  color: #fbbf24;
}

.boolean {
  color: #f472b6;
}

.object {
  color: #e5e7eb;
}

/* 折叠类型 */
.type {
  color: #9ca3af;
  font-style: italic;
}
</style>
