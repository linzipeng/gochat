<template>
  <div class="media-setting">
    <div class="media-setting-header">
      <span> 设置 </span>
      <icon
        name="icon_close"
        style="float: right"
        :isButton="true"
        @click="$emit('show')"
      ></icon>
    </div>
    <div class="media-setting-body">
      <el-tabs tab-position="left" v-model="tabActive" @tab-click="tabClick">
        <el-tab-pane name="setting">
          <template #label>
            <icon name="icon_setting_normal"></icon>
            媒体设置
          </template>
        </el-tab-pane>
        <el-tab-pane name="resolution">
          <template #label>
            <icon name="icon_HD"></icon>
            分辨率
          </template>
        </el-tab-pane>
      </el-tabs>
      <div class="media-content">
        <div id="setting">
          <div class="media-label">媒体设置</div>
          <div>
            <div class="media-select-box">摄像头</div>
            <el-select
              v-if="cameras.options.length"
              v-model="cameras.value"
              @change="updateCameras"
            >
              <el-option
                v-for="item in cameras.options"
                :value="item.deviceID"
                :label="item.deviceName"
                :key="item.deviceID"
              ></el-option>
            </el-select>
            <div v-else class="disable-select" style="width: 256px">
              <icon name="icon_fail"></icon>
              {{ cameras.errMsg }}
            </div>
          </div>
          <div>
            <div class="media-select-box">麦克风</div>
            <el-select
              v-if="microphones.options.length"
              v-model="microphones.value"
              @change="updateMicrophones"
            >
              <el-option
                v-for="item in microphones.options"
                :value="item.deviceID"
                :label="item.deviceName"
                :key="item.deviceID"
              ></el-option>
            </el-select>
            <div v-else class="disable-select" style="width: 256px">
              <icon name="icon_fail"></icon>
              {{ microphones.errMsg }}
            </div>
          </div>
          <div>
            <div class="media-select-box">扬声器</div>
            <el-select
              v-if="speakers.options.length"
              v-model="speakers.value"
              @change="updateSpeakers"
            >
              <el-option
                v-for="item in speakers.options"
                :key="item.deviceID"
                :value="item.deviceID"
                :label="item.deviceName"
              ></el-option>
            </el-select>
            <div v-else class="disable-select" style="width: 256px">
              <icon name="icon_fail"></icon>
              {{ speakers.errMsg }}
            </div>
          </div>
        </div>
        <div id="resolution">
          <div class="media-label">分辨率</div>
          <div class="resolution-select">
            <div
              class="resolution-label"
              :class="{
                'is-active':
                  $store.state.cameraConfig.videoQuality === 3 ||
                  ($store.state.cameraConfig.width === 1280 &&
                    $store.state.cameraConfig.height === 720),
              }"
              @click="changeVideoQuality(3)"
            >
              1080p<br />
              <div>极清</div>
            </div>
            <div
              class="resolution-label"
              :class="{
                'is-active':
                  $store.state.cameraConfig.videoQuality === 2 ||
                  ($store.state.cameraConfig.width === 640 &&
                    $store.state.cameraConfig.height === 480),
              }"
              @click="changeVideoQuality(2)"
            >
              720p<br />
              <div>超清</div>
            </div>
            <div
              class="resolution-label"
              :class="{
                'is-active':
                  $store.state.cameraConfig.videoQuality === 1 ||
                  ($store.state.cameraConfig.width === 320 &&
                    $store.state.cameraConfig.height === 240),
              }"
              @click="changeVideoQuality(1)"
            >
              360p<br />
              <div>标准</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { zg } from "@/service/SDKServer";
import { ZegoDeviceInfo } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { useStore } from "vuex";
import { MainStore } from "@/store/store";

const videoQualityType = {
  "1": {
    width: 320,
    height: 240,
    frameRate: 15,
    maxBitrate: 300,
  },
  "2": {
    width: 640,
    height: 480,
    frameRate: 15,
    maxBitrate: 800,
  },
  "3": {
    width: 1280,
    height: 720,
    frameRate: 20,
    maxBitrate: 1500,
  },
};

export default defineComponent({
  setup() {
    const store = useStore<MainStore>();
    const tabActive = ref<"setting" | "resolution">("setting");
    const cameras = ref({
      value: "",
      options: [] as ZegoDeviceInfo[],
      errMsg: "系统未授权使用摄像头",
    });
    const microphones = ref({
      value: "",
      options: [] as ZegoDeviceInfo[],
      errMsg: "系统未授权使用麦克风",
    });
    const speakers = ref({
      value: "",
      options: [] as ZegoDeviceInfo[],
      errMsg: "系统未授权使用扬声器",
    });

    const check = async function () {
      // 先触发麦克风调用，调起授权
      const authStream = await zg.createStream({
        camera: { video: true, audio: true },
      });
      zg.destroyStream(authStream);
      zg.enumDevices().then((devices) => {
        try {
          // 处理摄像头
          cameras.value.options = devices.cameras;
          // 无可用设备
          if (
            cameras.value.options.length === 0 ||
            !cameras.value.options[0].deviceID
          ) {
            cameras.value.errMsg = "未检测到摄像头设备";
          } else {
            // 设置中就采用目前推流的设备
            cameras.value.options.forEach((val: ZegoDeviceInfo) => {
              if (val.deviceID === store.state.cameraConfig.videoInput) {
                cameras.value.value = val.deviceID;
              }
            });
            if (!cameras.value.value) {
              // 设备检测||推流中的设备被移除了  就采用第一个设备
              cameras.value.value = cameras.value.options[0].deviceID;
            }
          }
        } catch (error) {
          cameras.value.errMsg = "系统未授权使用摄像头";
        }

        try {
          // 处理麦克风
          microphones.value.options = devices.microphones.filter(
            (val) =>
              // 去除默认设备
              val.deviceID !== "default" && val.deviceID !== "communications"
          );
          // 无可用设备
          if (
            microphones.value.options.length === 0 ||
            !microphones.value.options[0].deviceID
          ) {
            microphones.value.errMsg = "未检测到麦克风设备";
          } else {
            // 设置中就采用目前推流的设备
            microphones.value.options.forEach((val: ZegoDeviceInfo) => {
              if (val.deviceID === store.state.cameraConfig.audioInput) {
                microphones.value.value = val.deviceID;
              }
            });
            if (!microphones.value?.value) {
              // 设备检测||推流中的设备被移除了  就采用第一个设备
              microphones.value.value = microphones.value.options[0].deviceID;
            }
          }
        } catch (error) {
          microphones.value.errMsg = "系统未授权使用麦克风";
        }

        try {
          // 处理扬声器
          speakers.value.options = devices.speakers.filter(
            (val) =>
              // 去除默认设备
              val.deviceID !== "default" && val.deviceID !== "communications"
          );
          // 无可用设备
          if (
            speakers.value.options.length === 0 ||
            !speakers.value.options[0].deviceID
          ) {
            speakers.value.errMsg = "未检测到扬声器设备";
          } else {
            // 设置中就采用目前推流的设备
            speakers.value.options.forEach((val: ZegoDeviceInfo) => {
              if (val.deviceID === store.state.speakerDevice.deviceID) {
                speakers.value.value = val.deviceID;
              }
            });
            if (!speakers.value?.value) {
              // 设备检测||推流中的设备被移除了  就采用第一个设备
              speakers.value.value = speakers.value.options[0].deviceID;
            }
          }
        } catch (error) {
          microphones.value.errMsg = "系统未授权使用麦克风";
        }
      });
    };

    const tabClick = function () {
      const anchor = document.getElementById(tabActive.value);
      const parent = anchor?.parentElement;
      if (parent) {
        parent.scrollTop = (anchor?.offsetTop as number) - 65;
      }
    };

    const updateCameras = function (value: string) {
      const cameraConfig = JSON.parse(JSON.stringify(store.state.cameraConfig));
      cameraConfig.videoInput = value;
      store.commit("setter", { key: "cameraConfig", value: cameraConfig });
    };
    const updateMicrophones = function (value: string) {
      const cameraConfig = JSON.parse(JSON.stringify(store.state.cameraConfig));
      cameraConfig.audioInput = value;
      store.commit("setter", { key: "cameraConfig", value: cameraConfig });
    };
    const updateSpeakers = function (value: string) {
      const speakerDevice = JSON.parse(
        JSON.stringify(store.state.speakerDevice)
      );
      speakerDevice.deviceID = value;
      store.commit("setter", { key: "speakerDevice", value: speakerDevice });
    };

    const changeVideoQuality = function (type: 1 | 2 | 3) {
      const cameraConfig = JSON.parse(JSON.stringify(store.state.cameraConfig));
      cameraConfig.videoQuality = type;
      cameraConfig.width = videoQualityType[type].width;
      cameraConfig.height = videoQualityType[type].height;
      cameraConfig.frameRate = videoQualityType[type].frameRate;
      cameraConfig.bitrate = videoQualityType[type].maxBitrate;
      store.commit("setter", {
        key: "cameraConfig",
        value: cameraConfig,
      });
    };

    onMounted(() => {
      check();
      navigator.mediaDevices.addEventListener("devicechange", check);
    });

    onBeforeUnmount(() => {
      navigator.mediaDevices.removeEventListener("devicechange", check);
    });

    return {
      tabActive,
      cameras,
      microphones,
      speakers,
      tabClick,
      updateCameras,
      updateMicrophones,
      updateSpeakers,
      changeVideoQuality,
    };
  },
});
</script>

<style lang="less">
.media-setting {
  width: 486px;
  height: 346px;
  border-radius: 8px;
  background: #2c253c;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  font-size: 12px;
  color: #e0dde3;
  overflow: hidden;
  .media-setting-header {
    padding: 13px 16px;
    box-sizing: border-box;
    font-size: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: #aca5b4;
    height: 44px;
    width: 100%;
  }
  .media-setting-body {
    display: flex;
    height: calc(100% - 44px);
    .el-tabs__header {
      margin-right: 33px;
    }
    .el-tabs {
      .el-tabs__nav-wrap {
        padding-top: 21px;
        box-sizing: border-box;
        &::after {
          width: 1px;
          background-color: rgba(255, 255, 255, 0.1);
        }
        .el-tabs__item {
          text-align: left;
          color: #aca5b4;
          user-select: none;
          height: 32px;
          line-height: 32px;
          margin-bottom: 8px;
          &.is-active {
            color: #e0dde3;
          }
          &:hover {
            color: #a653ff;
          }
        }
        .el-tabs__active-bar {
          background-color: #a653ff;
        }
        a {
          color: unset;
          text-decoration: none;
        }
      }
    }
    .media-content {
      width: calc(100% - 117px);
      margin-right: -15px;
      overflow-y: scroll;
      .media-label {
        font-weight: bold;
        color: #e0dde3;
        height: 32px;
        line-height: 32px;
        margin-top: 21px;
        margin-bottom: 5px;
      }
      .media-select-box {
        font-size: 15px;
        color: #82798f;
        transform: scale(0.66666);
        margin-left: -67px;
      }
      .resolution-select {
        display: flex;
        margin-bottom: 32px;
        cursor: pointer;
        .resolution-label {
          text-align: center;
          width: 74px;
          height: 36px;
          background: rgba(224, 221, 227, 0.1);
          border-radius: 4px;
          margin-right: 16px;
          &.is-active {
            color: #a653ff;
          }
          div {
            transform: scale(0.666666);
          }
        }
      }
      .el-select {
        width: 256px;
        .el-input__inner {
          color: #e0dde3;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
