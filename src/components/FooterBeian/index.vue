<template>
  <div class="footer-beian">
    <p class="beian-text">
      版权所有：©2025-2026 QianMeng
      <span class="separator">|</span>
      <img src="@/assets/beian.png" alt="备案" class="beian-icon" />
      <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" class="beian-link">
        湘ICP备2026016513号
      </a>
    </p>
  </div>
</template>

<script>
export default {
  name: 'FooterBeian'
}
</script>

<style scoped>
.footer-beian {
  text-align: center;
  padding: 20px 0;
}

.beian-text {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.separator {
  margin: 0 10px;
  color: #999;
}

.beian-icon {
  width: 14px;
  height: 14px;
  vertical-align: text-bottom;
  margin-right: 2px;
}

.beian-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
  margin-left: 2px;
}

.beian-link:hover {
  color: #764ba2;
}
</style>
