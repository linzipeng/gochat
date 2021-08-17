<template>
  <div class="camera-box settings-box-item">
    <div class="box-item">
      <div class="label">摄像头</div>
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
    </div>
    <div class="box-item">
      <div class="label">预览</div>
      <div class="item-content">
        <div class="video">
          <video ref="preCamera" autoplay playinline></video>
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
            <p>1.在浏览器“允许”使用摄像头</p>
            <p>2.在系统“允许”使用摄像头</p>
            <p>3.请确认摄像头已正确连接并开启</p>
            <p>4.请确认摄像头没有被其他软件占用</p>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { zg } from "@/service/SDKServer";
import {
  ZegoCamera,
  ZegoDeviceInfo,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { useStore } from "vuex";
import { MainStore } from "@/store/store";
import icon from "../icon.vue";

export default defineComponent({
  components: { icon },
  setup(props, rtx) {
    const store = useStore<MainStore>();
    const deviceList = ref<ZegoDeviceInfo[]>([]);
    const errMsg = ref("系统未授权使用摄像头"); // 错误信息登记
    const preCamera = ref<HTMLVideoElement | null>(null);
    const previewCamera = ref<MediaStream | null>(null);
    const currentDevice = ref<ZegoDeviceInfo>({
      deviceName: "",
      deviceID: "",
    });

    // element-plus bug
    let deviceListTemp: ZegoDeviceInfo[] = [];

    // 关闭预览摄像头
    const closeCamera = function () {
      if (preCamera.value) {
        preCamera.value.srcObject = null;
      }
      if (previewCamera.value) {
        zg.destroyStream(previewCamera.value);
        previewCamera.value = null;
      }
    };

    // 开启预览摄像头
    const openCamera = async function () {
      closeCamera();
      try {
        const camera: ZegoCamera = {
          audio: false,
          video: true,
        };
        if (currentDevice.value?.deviceID)
          camera.videoInput = currentDevice.value?.deviceID;
        previewCamera.value = await zg.createStream({
          camera: camera,
        });
        if (preCamera.value) {
          preCamera.value.srcObject = previewCamera.value;
        }
      } catch (e) {
        // 获取权限失败
        rtx.emit("isDeviceCanUse", false);
      }
    };

    const check = async function () {
      try {
        // 先触发摄像头调用，调起授权，但先不预览
        const authStream = await zg.createStream({
          camera: { video: true, audio: false },
        });
        zg.destroyStream(authStream);
        // 拿到设备列表后再进行预览
        const { cameras } = await zg.enumDevices();
        deviceList.value = cameras;
        deviceListTemp = JSON.parse(JSON.stringify(cameras));
        // 无可用设备
        if (deviceList.value.length === 0 || !deviceList.value[0].deviceID) {
          rtx.emit("isDeviceCanUse", false);
          closeCamera();
          errMsg.value = "未检测到摄像头设备";
        } else {
          // 设置中就采用目前推流的设备
          deviceList.value.forEach((val: ZegoDeviceInfo) => {
            if (val.deviceID === store.state.cameraConfig.videoInput) {
              currentDevice.value = val;
            }
          });
          if (!currentDevice.value?.deviceID) {
            // 设备检测||推流中的设备被移除了  就采用第一个设备
            currentDevice.value = deviceList.value[0];
          }

          rtx.emit("currentDevice", {
            cameraDevice: currentDevice.value.deviceID,
          });
          await openCamera();
          rtx.emit("isDeviceCanUse", true);
        }
      } catch (error) {
        // console.log(error);
        if (error.message === "Permission denied") {
          errMsg.value = "权限不足";
        }
        if (
          error.message === "Permission denied by system" ||
          error.message === "Could not start video source"
        ) {
          errMsg.value = "系统未授权使用摄像头";
        }
        rtx.emit("isDeviceCanUse", false);
        throw error;
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

    const selectDevice = function (deviceID: string) {
      rtx.emit("currentDevice", { cameraDevice: deviceID });
      if (currentDevice.value) {
        for (const item of deviceList.value) {
          if (item.deviceID === deviceID) {
            currentDevice.value.deviceName = item.deviceName;
            break;
          }
        }
      }
      deviceList.value = deviceListTemp;
      openCamera();
    };

    onMounted(() => {
      check();
      navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
    });

    onBeforeUnmount(() => {
      closeCamera();
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        onDeviceChange
      );
    });

    return {
      preCamera,
      deviceList,
      currentDevice,
      errMsg,
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
.camera-box {
  display: flex;
  flex-direction: column;
  margin-top: 22px;
  .box-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    width: 100%;
    font-size: 14px;
    color: #b3b6ba;
    text-align: right;
    .el-select {
      width: 268px;
    }
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
      .video {
        width: 268px;
        height: 158px;
        border-radius: 4px;
        background-color: #16151a;
        overflow: hidden;
        video {
          width: 100%;
          height: auto;
        }
        .icon {
          display: none;
        }
      }
      .trouble-shoot {
        align-self: flex-end;
      }
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
        .video {
          position: relative;
          margin-bottom: 8px;
          height: 158px;
        }
      }
    }
  }
}
</style>
