<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="bullshit">
        <div class="bullshit__oops">
          waiting!
        </div>
        <div class="bullshit__headline">
          建设中，敬请期待...
        </div>
        <ul class="list-unstyled">
          <li class="link-type">
            <router-link to="/">
              回首页
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'waiting'
}
</script>

<style lang="scss" scoped>
.wscn-http404-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 40px 20px;
}

.wscn-http404 {
  position: relative;
  padding: 0 50px;
  overflow: hidden;

  .bullshit {
    position: relative;
    overflow: hidden;

    &__oops {
      font-size: 32px;
      font-weight: bold;
      line-height: 40px;
      color: #1482f0;
      opacity: 0;
      margin-bottom: 20px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }

    &__headline {
      font-size: 20px;
      line-height: 24px;
      color: #222;
      font-weight: bold;
      opacity: 0;
      margin-bottom: 10px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.1s;
      animation-fill-mode: forwards;
    }

    @keyframes slideUp {
      0% {
        transform: translateY(60px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }

  .list-unstyled {
    font-size: 14px;
    opacity: 0;
    animation-name: slideUp;
    animation-duration: 0.5s;
    animation-delay: 0.2s;
    animation-fill-mode: forwards;

    li {
      padding-bottom: 5px;
    }

    a {
      color: #008489;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
