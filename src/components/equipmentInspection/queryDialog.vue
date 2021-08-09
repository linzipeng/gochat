<template>
  <div class="wrapper">
    <div class="query-dialog">
      <div class="title">是否放弃检测</div>
      <div class="desc">设备检测未完成，将可能影响直播效果</div>
      <div class="btn-box">
        <button class="cancel" @click="clickBtn('cancel')">放弃检测</button>
        <button class="confirm zg-button" @click="clickBtn('confirm')">
          继续检测
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup(props, rtx) {
    const clickBtn = function (type: string) {
      rtx.emit("handle", type);
    };
    return {
      clickBtn,
    };
  },
});
</script>

<style lang="less" scoped>
.wrapper {
  z-index: 102; /* 比播放遮罩层级高 */
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  .query-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 0;
    box-sizing: border-box;
    width: 320px;
    min-height: 161px;
    background-color: #2c253c;
    border-radius: 4px;
    font-size: 14px;
    color: #e0dde3;
    .title {
      font-size: 16px;
      font-weight: bold;
    }
    .desc {
      margin: 12px 0 20px;
      text-align: center;
      width: 240px;
      word-break: break-word;
      line-height: 21px;
    }
    .btn-box {
      button {
        width: 92px;
        height: 30px;
        border-radius: 4px;
        cursor: pointer;
        border: none;
        color: #e0dde3;
        &:focus {
          outline: none;
        }
      }
      .cancel {
        margin-right: 20px;
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
