<template>
  <div class="result-box">
    <div
      class="result-item"
      v-for="(item, index) of stepsData"
      :key="index"
      v-show="index < 3"
    >
      <div class="item">
        <div class="label">{{ item.title }}</div>
        <div class="status">
          <template v-if="item.iconType === 'success'">
            <span>正常</span>
            <icon name="icon_get" class="result-icon"></icon>
          </template>
          <template v-if="item.iconType === 'error'">
            <span>异常</span>
            <icon name="a-icon_nopass" class="result-icon"></icon>
          </template>
        </div>
      </div>
      <div class="problems">
        <template v-if="item.iconType === 'error'">
          <el-popover
            placement="top-start"
            trigger="hover"
            popper-class="popper-class"
          >
            <template #reference>
              <div>
                <icon name="icon_problem"></icon>
                问题排查
              </div>
            </template>
            <template v-if="item.id === 'camera'">
              <p>1.在浏览器“允许”使用摄像头</p>
              <p>2.在系统“允许”使用摄像头</p>
              <p>3.请确认摄像头已正确连接并开启</p>
              <p>4.请确认摄像头没有被其他软件占用</p>
            </template>
            <template v-if="item.id === 'microphone'">
              <p>1.在浏览器“允许”使用麦克风</p>
              <p>2.在系统“允许”使用麦克风</p>
              <p>3.请确认麦克风已正确连接并开启（红色孔）</p>
              <p>4.请确认麦克风没有被其他软件占用</p>
            </template>
            <template v-if="item.id === 'speaker'">
              <p>1. 请确认扬声器已正确连接并开启（绿色孔）</p>
              <p>2. 请确认扬声器没有被其他软件占用</p>
              <p>3. 请调节扬声器的声音，确保可以听清楚</p>
            </template>
          </el-popover>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["stepsData"],
});
</script>

<style lang="less">
.result-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 22px;
  padding-bottom: 16px;
  .result-item {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .result-icon {
      font-size: 9px;
      margin-left: 8px;
      margin-right: 10px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      width: 308px;
      height: 42px;
      background-color: rgba(224, 221, 227, 0.05);
      border-radius: 4px;
      color: #edf1fa;
      .label {
        margin-left: 20px;
        font-size: 12px;
        line-height: 12px;
      }
      .status {
        display: flex;
        align-items: center;
        font-size: 12px;
        img {
          margin: 0 18px 0 7px;
          width: 16px;
          height: 16px;
        }
      }
    }
  }
  .problems {
    display: flex;
    align-items: center;
    margin-left: 10px;
    margin-right: 75px;
    width: 70px;
    margin-bottom: 10px;
    font-size: 9px;
  }
}
</style>
