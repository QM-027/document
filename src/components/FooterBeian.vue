<template>
  <div class="footer-beian">
    <p class="beian-text">
      版权所有：QianMeng
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
  flex: 0 0 auto;
  text-align: center;
  padding: 10px 0;
  background-color: rgba(255, 255, 255, 0.94);
  border-top: 1px solid #eee;
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
  width: 20px;
  height: 20px;
  vertical-align: text-bottom;
  margin-right: 2px;
}

.beian-link {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
  margin-left: 2px;
}

.beian-link:hover {
  color: #409EFF;
}
</style>
