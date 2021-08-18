<template>
  <div class="micro-box settings-box-item">
    <div class="box-item microphone-box">
      <div class="label">麦克风</div>
      <div class="item-content">
        <el-select
          v-if="deviceList.length || !initCheck"
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
            class="voice-item"
            v-for="item in volumeLength"
            :key="item"
            :style="`background-color:${
              item <= micRealVolume ? '#9F76FF' : ''
            }`"
          ></div>
        </div>
        <audio playinline autoplay ref="previewAudio"></audio>

        <!-- 暂时无法实现控制麦克风音量 -->
        <div class="volume">
          <div>音量</div>
          <div class="volume-input">
            <input type="range" min="0" max="100" step="1" v-model="volume" />
            <div class="blue-bg" :style="`width:${volume}%`"></div>
          </div>
          <span>{{ volume }}</span>
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
            <p>1.在浏览器“允许”使用麦克风</p>
            <p>2.在系统允许“允许”使用麦克风</p>
            <p>3.请确认麦克风已正确连接并开启（红色孔）</p>
            <p>4.请确认麦克风没有被其他软件占用</p>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { zg } from "@/service/SDKServer";
import { ZegoDeviceInfo } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { useStore } from "vuex";
import { MainStore } from "@/store/store";

export default defineComponent({
  setup(props, rtx) {
    const store = useStore<MainStore>();
    const deviceList = ref<ZegoDeviceInfo[]>([]);
    const errMsg = ref("系统未授权使用麦克风"); // 错误信息登记
    const previewAudio = ref<HTMLAudioElement | null>(null);
    const previewMic = ref<MediaStream | null>(null);
    const currentDevice = ref<ZegoDeviceInfo>({
      deviceName: "",
      deviceID: "",
    });
    let context: AudioContext;
    const micRealVolume = ref(0); // 麦克风音量
    const volumeLength = 27;
    const volume = ref(50);
    let timerOut = 0; // 用于防抖
    // element-plus bug
    let deviceListTemp: ZegoDeviceInfo[] = [];
    const initCheck = ref(false);

    watch(
      () => volume.value,
      (value) => {
        if (previewMic.value) {
          zg.setCaptureVolume(previewMic.value, value).then(() => {
            rtx.emit("currentVolume", { microphone: value });
          });
        }
      }
    );

    // 关闭麦克风
    const closeMic = function () {
      if (previewAudio.value) {
        previewAudio.value.srcObject = null;
      }
      micRealVolume.value = 0;
      if (previewMic.value) {
        zg.destroyStream(previewMic.value);
      }
      if (context?.state === "running") {
        context.close();
      }
      // 关闭音浪回调
      zg.off("capturedSoundLevelUpdate");
    };

    // 开启麦克风
    const openMic = async function () {
      closeMic();
      let cameraOption: {
        audio: boolean;
        audioInput?: string;
        video: boolean;
        channelCount?: 1 | 2 | undefined;
        AEC?: boolean;
        ANS?: boolean;
        AGC?: boolean;
      } = {
        audio: true,
        video: false,
        channelCount: 1,
        AEC: true,
        ANS: true,
        AGC: true,
      };
      if (currentDevice.value.deviceID)
        cameraOption.audioInput = currentDevice.value.deviceID;
      try {
        previewMic.value = await zg.createStream({
          camera: cameraOption,
        });
        if (previewAudio.value) {
          previewAudio.value.srcObject = previewMic.value;
        }

        // 开启音浪回调
        zg.setSoundLevelDelegate(true, 100);
        zg.on("capturedSoundLevelUpdate", (num) => {
          micRealVolume.value = Math.round((num / 100) * volumeLength);
        });
      } catch (err) {
        // 获取权限失败
        rtx.emit("isDeviceCanUse", false);
        throw err;
      }
    };

    const check = async function () {
      try {
        // 先触发麦克风调用，调起授权，但先不预览
        const authStream = await zg.createStream({
          camera: { video: false, audio: true },
        });
        zg.destroyStream(authStream);
        // 拿到设备列表后再进行预览
        await zg
          .enumDevices()
          .then(({ microphones }) => {
            deviceList.value = microphones;
          })
          .finally(() => {
            initCheck.value = true;
          });

        // 无可用设备
        if (deviceList.value.length === 0 || !deviceList.value[0].deviceID) {
          rtx.emit("isDeviceCanUse", false);
          closeMic();
          errMsg.value = "未检测到麦克风设备";
        } else {
          // 去除默认设备
          deviceList.value = deviceList.value.filter(
            (val) =>
              val.deviceID !== "default" && val.deviceID !== "communications"
          );
          // 设置中就采用目前推流的设备
          deviceList.value.forEach((val: ZegoDeviceInfo) => {
            if (val.deviceID === store.state.cameraConfig.audioInput) {
              currentDevice.value = val;
            }
          });
          if (!currentDevice.value?.deviceID) {
            // 设备检测||推流中的设备被移除了  就采用第一个设备
            currentDevice.value = deviceList.value[0];
          }
          rtx.emit("currentDevice", {
            micDevice: currentDevice.value.deviceID,
          });
          await openMic();
          deviceListTemp = JSON.parse(JSON.stringify(deviceList.value));
          rtx.emit("isDeviceCanUse", true);
        }
      } catch (error) {
        console.log(error);
        if (error.message === "Permission denied") {
          errMsg.value = "浏览器未授权使用麦克风";
        }
        if (
          error.message === "Permission denied by system" ||
          error.message === "Could not start audio source"
        ) {
          errMsg.value = "系统未授权使用麦克风";
        }
        rtx.emit("isDeviceCanUse", false);
        throw error;
      } finally {
        initCheck.value = true;
      }
    };

    const onDeviceChange = function (e: any) {
      if (timerOut) {
        clearTimeout(timerOut);
        timerOut = 0;
      }
      timerOut = window.setTimeout(() => {
        // 清除当前的设备
        currentDevice.value = {
          deviceName: "",
          deviceID: "",
        };
        check();
      }, 500);
    };

    // 选择设备
    const selectDevice = function (deviceID: string) {
      rtx.emit("currentDevice", { micDevice: deviceID });
      if (currentDevice.value) {
        for (const item of deviceList.value) {
          if (item.deviceID === deviceID) {
            currentDevice.value.deviceName = item.deviceName;
            break;
          }
        }
      }
      deviceList.value = deviceListTemp;
      openMic();
    };

    onMounted(() => {
      check();
      navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
    });

    onBeforeUnmount(() => {
      if (timerOut) {
        clearTimeout(timerOut);
      }
      closeMic();
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        onDeviceChange
      );
    });

    return {
      deviceList,
      currentDevice,
      errMsg,
      volumeLength,
      micRealVolume,
      volume,
      initCheck,
      selectDevice,
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
.micro-box {
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
        width: 268px;
        .voice-img {
          margin-right: 24px;
          // background-image: url("../../assets/images/play.png");
          background-size: cover;
          width: 34px;
          height: 34px;
        }
        .voice-item {
          flex-shrink: 0;
          margin-right: 6px;
          width: 4px;
          height: 22px;
          background-color: rgba(33, 30, 36, 0.7);
          border-radius: 4px;
        }
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
    &.microphone-box {
      margin-bottom: 90px;
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
      }
    }
  }
}
</style>
