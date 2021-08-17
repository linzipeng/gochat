<template>
  <div class="equipment-inspection">
    <div class="dialog">
      <div class="top">
        <div class="title">设备检测</div>
        <div class="close-btn" @click="close">
          <icon name="icon_close" :isButton="true"></icon>
        </div>
      </div>
      <div class="steps">
        <div class="steps-item" v-for="(item, index) of stepsData" :key="index">
          <div class="item-content">
            <div class="img-box">
              <div>
                <icon
                  :name="item.img[item.isActive ? 1 : 0]"
                  class="font-size-28"
                ></icon>
              </div>
              <!-- 检测成功与失败提示icon -->
              <icon
                class="img-icon"
                :name="
                  item.iconType === 'success'
                    ? 'icon_yes'
                    : item.iconType === 'error'
                    ? 'icon_no'
                    : ''
                "
              ></icon>
              <div
                :class="{
                  ['img-icon-success']: item.iconType === 'success',
                  ['img-icon-error']: item.iconType === 'error',
                }"
              ></div>
            </div>
            <div class="title">{{ item.title }}</div>
          </div>
          <div
            class="line"
            :class="item.isLineActive ? 'is-active' : ''"
            v-if="index !== 3"
          ></div>
        </div>
      </div>
      <div class="content">
        <!-- 摄像头检测 -->
        <template v-if="isCamera">
          <camera
            @isDeviceCanUse="isDeviceCanUse"
            @currentDevice="getCurrentDevice"
          ></camera>
        </template>
        <!-- 麦克风检测 -->
        <template v-if="isMicrophone">
          <microphone
            @isDeviceCanUse="isDeviceCanUse"
            @currentVolume="getCurrentVolume"
            @currentDevice="getCurrentDevice"
          ></microphone>
        </template>
        <!-- 扬声器检测 -->
        <template v-if="isSpeaker">
          <speaker
            @isDeviceCanUse="isDeviceCanUse"
            @currentVolume="getCurrentVolume"
            @currentDevice="getCurrentDevice"
          ></speaker>
        </template>
        <!-- 检测结果 -->
        <template v-if="isResult">
          <result :stepsData="stepsData"></result>
        </template>

        <div class="content-bottom">
          <div class="desc" v-show="isCamera">您是否可以看到摄像头的画面？</div>
          <div class="desc" v-show="isMicrophone">
            从1数到5，您是否可以看到音量条的波动？
          </div>
          <div class="desc" v-show="isSpeaker">您是否可以听到声音？</div>
          <div class="btn-wrap">
            <!-- 摄像头检测和麦克风检测 -->
            <template v-if="isCamera || isMicrophone">
              <button class="btn cancel" @click="next('error')">
                无法看到
              </button>
              <button
                class="btn zg-button"
                :class="{ 'disabled-zg-button': nextBtnDisabled }"
                @click="next('success')"
                :disabled="nextBtnDisabled"
              >
                可以看到
              </button>
            </template>
            <!-- 扬声器检测 -->
            <template v-if="isSpeaker">
              <button class="btn cancel" @click="next('error')">
                无法听到
              </button>
              <button
                class="btn zg-button"
                :class="{ 'disabled-zg-button': nextBtnDisabled }"
                @click="next('success')"
                :disabled="nextBtnDisabled"
              >
                可以听到
              </button>
            </template>
            <!-- 检测结果 -->
            <template v-if="isResult">
              <button class="btn cancel" @click="reset">重新检测</button>
              <button
                class="btn zg-button"
                @click="attend"
                :class="{ 'disabled-zg-button': nextBtnDisabled }"
                :disabled="nextBtnDisabled"
              >
                加入直播间
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- 二次确认dialog -->
    <query-dialog
      v-if="isCloseDialogShow"
      @handle="getClickResult"
    ></query-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import camera from "@/components/equipmentInspection/camera.vue";
import microphone from "@/components/equipmentInspection/microphone.vue";
import speaker from "@/components/equipmentInspection/speaker.vue";
import result from "@/components/equipmentInspection/result.vue";
import queryDialog from "@/components/equipmentInspection/queryDialog.vue";
import { ZegoCamera } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { useStore } from "vuex";
import { MainStore } from "@/store/store";

// 用于重置数据
const stepsDataTemp = [
  {
    id: "camera",
    img: ["icon_camera_normal", "icon_camera_pick"],
    title: "摄像头检测",
    iconType: "none",
    isActive: true,
    deviceId: "",
    isLineActive: false,
  },
  {
    id: "microphone",
    img: ["icon_miac_normal", "icon_miac_pick"],
    title: "麦克风检测", // 多语言的key
    iconType: "none",
    isActive: false,
    deviceId: "",
    volume: 50,
    isLineActive: false,
  },
  {
    id: "speaker",
    img: ["icon_loudspeaker_normal", "icon_loudspeaker_pick"],
    title: "扬声器检测", // 多语言的key
    iconType: "none",
    deviceId: "",
    volume: 50,
    isActive: false,
    isLineActive: false,
  },
  {
    img: ["icon_result_normal", "icon_result_pick"],
    title: "检测结果", // 多语言的key
    iconType: "none",
    isActive: false,
  },
];

export default defineComponent({
  components: {
    camera,
    microphone,
    speaker,
    result,
    queryDialog,
  },
  setup(props, rtx) {
    const store = useStore<MainStore>();
    const stepsData = ref(JSON.parse(JSON.stringify(stepsDataTemp)));
    const nextBtnDisabled = ref(false);
    const activeIndex = ref(0);
    const isCamera = ref(true);
    const isMicrophone = ref(false);
    const isSpeaker = ref(false);
    const isResult = ref(false);
    const isCloseDialogShow = ref(false);

    // 子组件传值（设备是否可用）控制【可以看到】按钮是否置灰
    const isDeviceCanUse = function (data: boolean) {
      nextBtnDisabled.value = !data;
    };

    // 监听子组件传过来的deviceID
    const getCurrentDevice = function (device: { [k: string]: string }) {
      if (device.cameraDevice) {
        stepsData.value[0].deviceId = device.cameraDevice;
        return;
      }
      if (device.micDevice) {
        stepsData.value[1].deviceId = device.micDevice;
        return;
      }
      if (device.speakerDevice) {
        stepsData.value[2].deviceId = device.speakerDevice;
        return;
      }
    };

    // 监听activeIndex 控制弹窗内容的展示
    const getActiveIndex = function (activeIndex: number) {
      switch (activeIndex) {
        case 0:
          isCamera.value = true;
          isMicrophone.value = false;
          isSpeaker.value = false;
          isResult.value = false;
          break;
        case 1:
          isCamera.value = false;
          isMicrophone.value = true;
          isSpeaker.value = false;
          isResult.value = false;
          break;
        case 2:
          isCamera.value = false;
          isMicrophone.value = false;
          isSpeaker.value = true;
          isResult.value = false;
          break;
        case 3:
          isCamera.value = false;
          isMicrophone.value = false;
          isSpeaker.value = false;
          isResult.value = true;
          break;
      }
    };

    const next = function (type: string) {
      // 改变步骤数据
      if (activeIndex.value < 3) {
        switch (type) {
          case "success": {
            stepsData.value[activeIndex.value].iconType = "success";
            stepsData.value[activeIndex.value + 1].isActive = true;
            stepsData.value[activeIndex.value].isLineActive = true;
            break;
          }
          case "error": {
            stepsData.value[activeIndex.value].iconType = "error";
            stepsData.value[activeIndex.value + 1].isActive = true;
            stepsData.value[activeIndex.value].isLineActive = true;
            break;
          }
        }
        activeIndex.value++;
        getActiveIndex(activeIndex.value);
        nextBtnDisabled.value = true;
      } else {
        // 检测结果
        stepsData.value[activeIndex.value].isActive = true;
      }
      if (activeIndex.value === 3) nextBtnDisabled.value = false;
    };

    // 监听子组件传过来的扬声器音量
    const getCurrentVolume = function (device: { [k: string]: number }) {
      if (device.microphone) {
        stepsData.value[1].volume = device.microphone;
      } else if (device.speaker) {
        stepsData.value[2].volume = device.speaker;
      }
    };

    const close = function () {
      if (activeIndex.value < 3) {
        // 添加二次确认弹窗 在getClickResult中执行this.$emit('close')
        isCloseDialogShow.value = true;
      } else {
        // 在结果页，关闭直接加入直播间
        attend();
      }
    };

    // 重新检测
    const reset = function () {
      activeIndex.value = 0;
      isCamera.value = true;
      isMicrophone.value = false;
      isSpeaker.value = false;
      isResult.value = false;
      stepsData.value = JSON.parse(JSON.stringify(stepsDataTemp));
      getActiveIndex(activeIndex.value);
      nextBtnDisabled.value = true;
    };

    // 加入直播间
    const attend = function () {
      const cameraConfig: ZegoCamera = {
        video: stepsData.value[0].iconType !== "error",
        audio: stepsData.value[1].iconType !== "error",
        videoInput: stepsData.value[0].deviceId,
        audioInput: stepsData.value[1].deviceId,
        videoQuality: 2,
      };
      const speakerConfig = {
        deviceID: stepsData.value[2].deviceId,
        volume: stepsData.value[2].volume,
      };

      store.commit("setter", { key: "speakerDevice", value: speakerConfig });
      store.commit("setter", {
        key: "cameraConfig",
        value: {
          ...cameraConfig,
          volume: stepsData.value[1].volume,
          actualAudioMuted: false,
          actualVideoMuted: false,
        },
      });
      sessionStorage.setItem(
        "checkFinish",
        JSON.stringify({
          cameraConfig: {
            ...cameraConfig,
            volume: stepsData.value[1].volume,
            actualAudioMuted: false,
            actualVideoMuted: false,
          },
          speakerDevice: speakerConfig,
        })
      );
      rtx.emit("checkFinish");
    };

    const getClickResult = function (type: string) {
      isCloseDialogShow.value = false;
      if (type === "cancel") {
        attend();
      }
    };

    return {
      isCloseDialogShow,
      isCamera,
      isMicrophone,
      isSpeaker,
      isResult,
      stepsData,
      nextBtnDisabled,
      activeIndex,
      isDeviceCanUse,
      getCurrentDevice,
      next,
      getCurrentVolume,
      reset,
      attend,
      close,
      getClickResult,
    };
  },
});
</script>

<style lang="less">
.font-size-28 {
  font-size: 28px;
}
.equipment-inspection {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  .dialog {
    width: 610px;
    height: 544px;
    background-color: #2c253c;
    border-radius: 4px;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.3);
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 48px;
      .title {
        margin-left: 30px;
        font-size: 14px;
      }
      .close-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 8px;
        width: 30px;
        height: 30px;
        cursor: pointer;
      }
    }
    .steps {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 610px;
      height: 122px;
      background-color: rgba(0, 0, 0, 0.08);
      .steps-item {
        display: flex;
        .item-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          .img-box {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 8px;
            width: 60px;
            height: 56px;
            .img-icon {
              position: absolute;
              bottom: 0;
              right: 0;
              background-size: cover;
              width: 22px;
              height: 22px;
            }
          }
          .title {
            font-size: 12px;
            color: #b3b6ba;
          }
        }
        .line {
          margin-top: 27px;
          width: 64px;
          height: 2px;
          background-image: url("../../assets/bg/img_line_press.png");
          background-size: cover;
          &.is-active {
            background-image: url("../../assets/bg/img_line_nomal.png");
          }
        }
      }
    }
    .content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 374px;
      .content-bottom {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 38px;
        font-size: 12px;
        line-height: 14px;
        .btn-wrap {
          display: flex;
          margin-top: 20px;
          text-align: center;
          line-height: 30px;
          .btn {
            padding: 0;
            border: 0;
            width: 126px;
            height: 30px;
            border-radius: 4px;
            font-size: 12px;
            line-height: 24px;
            color: #edf1fa;
            cursor: pointer;
            &:focus {
              outline: none;
            }
          }
          .cancel {
            margin-right: 16px;
            background-color: rgba(255, 255, 255, 0.1);
            &:hover {
              background-color: #464a4d;
              color: #f5faff;
            }
            &:active {
              background-color: #4f5357;
              color: #f5faff;
            }
          }
        }
      }
    }
  }
  .mask {
    z-index: 4;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(#000000, 0.6);
  }
  .transition-box {
    z-index: 5;
    position: fixed;
    top: 0;
    right: 0;
    width: 460px;
    height: 100%;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: transform 0.5s;
  }
  .fade-enter,
  .fade-leave-active {
    transform: translateX(460px);
  }
}
</style>
