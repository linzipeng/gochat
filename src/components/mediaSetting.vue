<template>
  <div class="media-setting" v-if="show">
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
            <el-select v-model="cameras.value" @change="updateCameras">
              <el-option
                v-for="item in cameras.options"
                :value="item.deviceID"
                :label="item.deviceName"
                :key="item.deviceID"
              ></el-option>
            </el-select>
          </div>
          <div>
            <div class="media-select-box">麦克风</div>
            <el-select v-model="microphones.value" @change="updateMicrophones">
              <el-option
                v-for="item in microphones.options"
                :value="item.deviceID"
                :label="item.deviceName"
                :key="item.deviceID"
              ></el-option>
            </el-select>
          </div>
          <div>
            <div class="media-select-box">扬声器</div>
            <el-select v-model="speakers.value" @change="updateSpeakers">
              <el-option
                v-for="item in speakers.options"
                :key="item.deviceID"
                :value="item.deviceID"
                :label="item.deviceName"
              ></el-option>
            </el-select>
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
import { computed, defineComponent, ref, toRefs, watch } from "vue";
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
  props: {
    show: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    localStream: {
      type: MediaStream,
    },
    isPlaying: {
      type: Boolean,
    },
  },
  setup(props) {
    const { show, localStream, isPlaying } = toRefs(props);
    const store = useStore<MainStore>();
    const tabActive = ref<"setting" | "resolution">("setting");
    const cameras = ref({ value: "", options: [] as ZegoDeviceInfo[] });
    const microphones = ref({ value: "", options: [] as ZegoDeviceInfo[] });
    const speakers = ref({ value: "", options: [] as ZegoDeviceInfo[] });

    const isAnchor = computed(() => {
      // 是否为主播本人
      return (
        store.state.room?.creator_id.toString() ===
        store.state.user?.uid.toString()
      );
    });

    watch(
      () => show.value,
      (value) => {
        if (value) {
          zg.enumDevices().then((devices) => {
            cameras.value.options = [];
            devices.cameras.forEach((dev, i, arr) => {
              if (dev.deviceID === "default") {
                for (const item of arr) {
                  const matchIndex = dev.deviceName.indexOf(item.deviceName);
                  if (matchIndex !== -1 && matchIndex !== 0) {
                    cameras.value.value = item.deviceID;
                    break;
                  }
                }
              } else {
                cameras.value.options.push(dev);
              }
            });
            if (cameras.value.options.length && !cameras.value.value) {
              cameras.value.value = cameras.value.options[0].deviceID;
            }
            microphones.value.options = [];
            devices.microphones.forEach((dev, i, arr) => {
              if (dev.deviceID === "default") {
                for (const item of arr) {
                  const matchIndex = dev.deviceName.indexOf(item.deviceName);
                  if (matchIndex !== -1 && matchIndex !== 0) {
                    microphones.value.value = item.deviceID;
                    break;
                  }
                }
              } else {
                microphones.value.options.push(dev);
              }
            });
            if (microphones.value.options.length && !microphones.value.value) {
              microphones.value.value = microphones.value.options[0].deviceID;
            }
            speakers.value.options = [];
            devices.speakers.forEach((dev, i, arr) => {
              if (dev.deviceID === "default") {
                for (const item of arr) {
                  const matchIndex = dev.deviceName.indexOf(item.deviceName);
                  if (matchIndex !== -1 && matchIndex !== 0) {
                    speakers.value.value = item.deviceID;
                    break;
                  }
                }
              } else {
                speakers.value.options.push(dev);
              }
            });
            if (speakers.value.options.length && !speakers.value.value) {
              speakers.value.value = speakers.value.options[0].deviceID;
            }
          });
        }
      },
      {
        immediate: true,
      }
    );

    const tabClick = function () {
      const anchor = document.getElementById(tabActive.value);
      const parent = anchor?.parentElement;
      if (parent) {
        parent.scrollTop = (anchor?.offsetTop as number) - 65;
      }
    };

    const updateCameras = function (value: string) {
      if (localStream.value) {
        zg.useVideoDevice(localStream.value, value).then(() => {
          const cameraConfig = store.state.cameraConfig;
          cameraConfig.videoInput = value;
          store.commit("setter", { key: "cameraConfig", value: cameraConfig });
        });
      }
    };
    const updateMicrophones = function (value: string) {
      if (localStream.value) {
        zg.useAudioDevice(localStream.value, value).then(() => {
          const cameraConfig = store.state.cameraConfig;
          cameraConfig.audioInput = value;
          store.commit("setter", { key: "cameraConfig", value: cameraConfig });
        });
      }
    };
    const updateSpeakers = function (value: string) {
      const speakerDevice = store.state.speakerDevice;
      speakerDevice.deviceID = value;
      store.commit("setter", { key: "speakerDevice", value: speakerDevice });
    };

    const changeVideoQuality = function (type: 1 | 2 | 3) {
      if (localStream.value) {
        const cameraConfig = store.state.cameraConfig;
        cameraConfig.videoQuality = type;
        store.commit("setter", {
          key: "cameraConfig",
          value: cameraConfig,
        });
        if (!isAnchor.value || isPlaying.value) {
          zg.setVideoConfig(localStream.value, videoQualityType[type]);
        }
      }
    };

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
        width: 253px;
      }
    }
  }
}
</style>
