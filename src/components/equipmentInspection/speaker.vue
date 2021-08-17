<template>
  <div class="speak-box settings-box-item">
    <div class="box-item speaker-box">
      <div class="label">扬声器</div>
      <div class="item-content">
        <el-select
          v-if="deviceList.length"
          v-model="currentDevice.deviceID"
          @change="selectDevice"
        >
          <el-option
            v-for="item in deviceList"
            :key="item.deviceID"
            :value="item.deviceID"
            :label="item.deviceName"
          ></el-option>
        </el-select>
        <div v-else class="disable-select" style="width: 268px">
          <icon name="icon_fail"></icon>
          {{ errMsg }}
        </div>
        <div class="voice">
          <div
            class="voice-img"
            :class="{ 'voice-img-open': isSpeakerPlaying }"
            @click="toggle"
          ></div>
          <div
            class="voice-item"
            v-for="item in volumeLength"
            :key="item"
            :style="`background-color:${
              item <= speakerRealVolume ? '#9F76FF' : ''
            }`"
          ></div>
        </div>
        <div class="volume">
          <div>音量</div>
          <div class="volume-input">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              :value="volume"
              @input="volumeChange"
            />
            <div class="blue-bg" :style="`width:${volume}%`"></div>
          </div>
          <span>{{ parseInt(volume) }}</span>
        </div>
        <div class="trouble-shoot">
          <el-popover
            placement="top-start"
            trigger="hover"
            width="211px"
            popper-class="popper-class"
          >
            <template #reference>
              <div>
                <icon name="icon_problem" style="font-size: 9px"></icon>
                问题排查
              </div>
            </template>
            <p>1. 请确认扬声器已正确连接并开启（绿色孔）</p>
            <p>2. 请确认扬声器没有被其他软件占用</p>
            <p>3. 请调节扬声器的声音，确保可以听清楚</p>
          </el-popover>
        </div>
      </div>
    </div>
    <audio loop crossOrigin="anonymous" id="speakerAudio" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { zg } from "@/service/SDKServer";
import { MainStore } from "@/store/store";
import { useStore } from "vuex";
import { ZegoDeviceInfo } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";

export default defineComponent({
  setup(props, rtx) {
    const volume = ref(50); // 音浪大小
    const speakerRealVolume = ref(0);
    const store = useStore<MainStore>();
    const deviceList = ref<ZegoDeviceInfo[]>([]);
    const errMsg = ref("未检测到扬声器设备"); // 错误信息登记
    let speakerAudio: any;
    const currentDevice = ref<ZegoDeviceInfo>({
      deviceName: "",
      deviceID: "",
    });
    const isSpeakerPlaying = ref(false);
    // 扬声器检测的音量声浪控制
    const volumeLength = 21;
    // element-plus bug
    let deviceListTemp: ZegoDeviceInfo[] = [];

    // 停止播放扬声器试听音频，清除定时器
    const closeSpeaker = function () {
      isSpeakerPlaying.value = false;
      speakerRealVolume.value = 0;
      if (speakerAudio) {
        speakerAudio.pause();
      }
      zg.off("capturedSoundLevelUpdate");
    };

    // 打开试听扬声器
    const openSpeaker = async function () {
      try {
        closeSpeaker();

        isSpeakerPlaying.value = true;
        // 创建一个静音播放的audio 标签用于获取音浪
        speakerAudio = new Audio();
        speakerAudio.src = require("@/assets/music/Happy.mp3");
        speakerAudio.crossOrigin = "anonymous";
        speakerAudio.loop = true;
        (document.getElementById("speakerAudio") as HTMLAudioElement).volume =
          volume.value / 100;
        if (currentDevice.value.deviceID) {
          // 切换扬声器设备
          await speakerAudio.setSinkId(currentDevice.value.deviceID);
        }
        speakerAudio.play();

        // 开启音浪回调
        zg.setSoundLevelDelegate(true, 100);
        zg.on("capturedSoundLevelUpdate", (num) => {
          speakerRealVolume.value = Math.round((num / 100) * volumeLength);
        });
      } catch (e) {
        // this.$emit('isDeviceCanUse', false);
        console.error("Your browser does not support AudioContext", e);
      }
    };

    const check = async function () {
      zg.enumDevices()
        .then((res: any) => {
          deviceList.value = res.speakers;
          // 无可用设备
          if (deviceList.value.length === 0 || !deviceList.value[0].deviceID) {
            rtx.emit("isDeviceCanUse", false);
            errMsg.value = "未检测到扬声器设备";
            closeSpeaker();
          } else {
            // 去除默认设备
            deviceList.value = deviceList.value.filter(
              (val) =>
                val.deviceID !== "default" && val.deviceID !== "communications"
            );
            // 设置中就采用目前推流的设备
            deviceList.value.forEach((val: ZegoDeviceInfo) => {
              if (val.deviceID === store.state.speakerDevice.deviceID) {
                currentDevice.value = val;
              }
            });
            if (!currentDevice.value?.deviceID) {
              // 设备检测||推流中的设备被移除了  就采用第一个设备
              currentDevice.value = deviceList.value[0];
            }
            deviceListTemp = JSON.parse(JSON.stringify(deviceList.value));
            rtx.emit("currentDevice", {
              speakerDevice: currentDevice.value.deviceID,
            });
            rtx.emit("isDeviceCanUse", true);
          }
        })
        .catch((err: any) => {
          rtx.emit("isDeviceCanUse", false);
          throw err;
        });
    };

    // 暂停/播放
    const toggle = function () {
      if (currentDevice.value.deviceID) {
        if (isSpeakerPlaying.value) {
          closeSpeaker();
        } else {
          openSpeaker();
        }
      }
    };

    // 切换设备
    const selectDevice = function (deviceID: string) {
      rtx.emit("currentDevice", { speakerDevice: deviceID });
      if (currentDevice.value) {
        for (const item of deviceList.value) {
          if (item.deviceID === deviceID) {
            currentDevice.value.deviceName = item.deviceName;
            break;
          }
        }
      }
      deviceList.value = deviceListTemp;
      openSpeaker();
    };

    const volumeChange = function (e: any) {
      const value = Number(e.target.value);
      volume.value = value;
      rtx.emit("currentVolume", { speacker: value });
      if (speakerAudio) {
        speakerAudio.volume = value / 100;
      }
    };

    const onDeviceChange = function () {
      // 清除当前的设备
      currentDevice.value = {
        deviceName: "",
        deviceID: "",
      };
      check();
    };

    onMounted(() => {
      check();
    });

    onBeforeUnmount(() => {
      closeSpeaker();
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        onDeviceChange
      );
    });

    return {
      speakerRealVolume,
      isSpeakerPlaying,
      errMsg,
      deviceList,
      currentDevice,
      volumeLength,
      volume,
      toggle,
      selectDevice,
      volumeChange,
    };
  },
});
</script>

<style lang="less">
.popper-class {
  font-size: 12px !important;
  padding: 16px 10px 10px 10px !important;
  color: #e0dde3 !important;
  line-height: 18px !important;
}
.speak-box {
  display: flex;
  flex-direction: column;
  margin-top: 22px;
  .box-item {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    width: 100%;
    font-size: 14px;
    color: #b3b6ba;
    text-align: right;
    .label {
      align-self: flex-start;
      display: inline-block;
      margin-right: 40px;
      width: 131px;
      height: 32px;
      line-height: 32px;
    }
    .item-content {
      display: flex;
      flex-direction: column;

      .trouble-shoot {
        align-self: flex-end;
      }
      .voice {
        display: flex;
        align-items: center;
        margin-top: 26px;
        margin-bottom: 26px;
        // width: 264px;
        .voice-img {
          margin-right: 24px;
          background-image: url("../../assets/mediaicon/play-music.svg");
          background-size: cover;
          width: 34px;
          height: 34px;
          &:hover {
            cursor: pointer;
            background-image: url("../../assets/mediaicon/play-music-hover.svg");
          }
          &.voice-img-open {
            background-image: url("../../assets/mediaicon/stop-music.svg");
            &:hover {
              background-image: url("../../assets/mediaicon/stop-music-hover.svg");
            }
          }
        }
        .voice-item {
          flex-shrink: 0;
          margin-right: 6px;
          width: 4px;
          height: 22px;
          background-color: #1c1c20;
          border-radius: 2px;
        }
        // &.speaker-voice {
        //     width: 204px;
        // }
      }
      .volume {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 22px;
        font-size: 14px;
        color: #b3b6ba;
        .volume-input {
          position: relative;
          display: flex;
          flex-shrink: 0;
          flex-grow: 0;
          width: 181px;
          .blue-bg {
            z-index: 1;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 4px;
            background-color: #9f76ff;
            border-radius: 2px;
          }
          input[type="range"] {
            -webkit-appearance: none;
            width: 181px;
            height: 4px;
            border-radius: 10px; /*这个属性设置使填充进度条时的图形为圆角*/
            background-color: #1c1c20;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
          }
          // 设置轨道样式
          input[type="range"]::-webkit-slider-runnable-track {
            height: 4px;
            border-radius: 2px; /*将轨道设为圆角的*/
            border: none;
          }
          // 去掉focus时的边框
          input[type="range"]:focus {
            outline: none;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 10px;
            width: 10px;
            margin-top: -3px; /*使滑块超出轨道部分的偏移量相等*/
            background: #edf1fa;
            border-radius: 50%; /*外观设置为圆形*/
            border: solid 0.125em rgba(205, 224, 230, 0.5); /*设置边框*/
            box-shadow: 0 0.125em 0.125em #3b4547; /*添加底部阴影*/
            position: relative;
            z-index: 2;
            cursor: pointer;
          }
        }
        span {
          width: 20px;
          font-size: 12px;
        }
      }
    }
    &.speaker-box {
      margin-bottom: 78px;
    }
  }
  &.settings-box-item {
    .box-item {
      font-size: 12px;
      .label {
        margin-right: 30px;
        width: 131px;
      }
      .item-content {
        padding-top: 1px;
        .volume {
          // margin-bottom: 107px;
        }
      }
    }
  }
}
</style>
