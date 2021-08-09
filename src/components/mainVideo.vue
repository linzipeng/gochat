<template>
  <div :class="{ 'audience-video-container': !isAnchorVideo }">
    <template v-if="!isAnchorVideo">
      <el-dropdown
        v-if="isAnchor"
        class="anchor-operate-audience"
        trigger="click"
        @command="(value) => $emit('handleCommand', value, streamId)"
      >
        <icon name="icon_handle" class="handle"></icon>
        <template v-slot:dropdown>
          <el-dropdown-menu class="about-menu operator-positon">
            <el-dropdown-item command="onMic">
              <template v-if="attendeeMap?.get(streamId)?.mic === 2">
                <icon name="icon_operation_mic_off"></icon>禁止发言
              </template>
              <template v-else>
                <icon name="icon_mic_on"></icon>解除禁言
              </template>
            </el-dropdown-item>
            <el-dropdown-item command="onStage"
              ><icon name="a-icon_Movethemic"></icon>移下麦</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span class="attendee-name">{{
        attendeeMap?.get(streamId)?.nick_name
      }}</span>
      <icon
        class="attendee-mic"
        v-if="attendeeMap?.get(streamId)?.mic === 1"
        name="icon_mic_off"
      ></icon>
    </template>
    <div v-else-if="showStatus" class="anthor-media-status">
      <icon
        name="icon_close"
        :isButton="true"
        @click="$emit('closeStatus')"
      ></icon>
      <p>分辨率：{{ qualityState.frames }}</p>
      <p>码率：{{ qualityState.bitrate }}</p>
      <p>帧率：{{ qualityState.FPS }}</p>
      <p>丢包率：{{ qualityState.lostRate }}</p>
    </div>
    <video
      v-if="videoStatus === 'OPEN'"
      ref="video"
      :id="`video-${streamId}`"
      class="main-video"
      style="object-fit: cover"
      :style="
        isAnchorVideo && { height: '100%', width: '100%', position: 'inherit' }
      "
      autoplay
      playsinline
    ></video>
    <template v-else>
      <img
        class="mute-bg"
        :src="require('@/assets/person/' + picIndex + '-guest@2x.png')"
      />
      <img
        v-if="!isAnchorVideo"
        class="mute-guest"
        :src="require('@/assets/person/' + picIndex + '-avatar@2x.png')"
      />
      <span class="mute-anthor-text" v-else>主播已关闭摄像头</span>
    </template>
    <audio
      ref="speakerAudio"
      v-if="isAnchor && isAnchorVideo"
      loop
      crossOrigin="anonymous"
    ></audio>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
  toRefs,
  watch,
  watchEffect,
} from "vue";
import PubSub from "pubsub-js";
import { useStore } from "vuex";
import { zg } from "@/service/SDKServer";
import icon from "./icon.vue";
import { ZegoPlayStats } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { MainStore } from "@/store/store";

export default defineComponent({
  components: { icon },
  props: {
    streamId: {
      type: String,
    },
    picIndex: {
      type: String,
    },
    attendeeMap: {
      type: Map,
    },
    showStatus: {
      type: Boolean,
    },
    isPlaying: {
      type: Boolean,
    },
  },
  setup(props, ctx) {
    const { streamId, isPlaying, attendeeMap } = toRefs(props);
    const store = useStore<MainStore>();
    const video = ref<HTMLVideoElement | null>(null);
    const speakerAudio = ref<HTMLAudioElement | null>(null);

    const qualityState = ref({
      frames: "0p",
      bitrate: "0kbs",
      FPS: "0fps",
      lostRate: "0%",
    });

    const isAnchor = computed(() => {
      // 是否为主播本人
      return (
        store.state.room?.creator_id.toString() ===
        store.state.user?.uid.toString()
      );
    });

    const isAnchorVideo = computed(() => {
      return store.state.room?.creator_id.toString() === streamId.value;
    });
    const videoStatus = ref<"OPEN" | "MUTE">("OPEN");
    let localStream: MediaStream;

    const referToVideo = function () {
      if (video.value) {
        video.value.pause();
        video.value.onloadeddata = function () {
          console.log("載入完畢！");
          const play = () => {
            if (video.value) {
              video.value.play().then(() => {
                window.removeEventListener("keydown", () => play);
                window.removeEventListener("click", () => play);
                window.removeEventListener("mousemove", () => play);
              });
            }
          };
          window.addEventListener("keydown", () => play());
          window.addEventListener("click", () => play());
          window.addEventListener("mousemove", () => play());

          // 模拟鼠标移动
          const event = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          window.dispatchEvent(event);
        };
        video.value.srcObject = localStream;
      }
    };

    watch(
      () => store.state.cameraConfig.videoQuality,
      async () => {
        // 未推流时，切换分辨率
        if (
          localStream &&
          streamId.value === store.state.user.uid.toString() &&
          isPlaying.value === false &&
          isAnchor.value
        ) {
          zg.destroyStream(localStream);
          localStream = await zg.createStream({
            camera: store.state.cameraConfig,
          });
          if (store.state.cameraConfig.actualVideoMuted) {
            zg.mutePublishStreamVideo(
              localStream,
              store.state.cameraConfig.actualVideoMuted
            );
          }
          if (store.state.cameraConfig.actualAudioMuted) {
            zg.mutePublishStreamAudio(
              localStream,
              store.state.cameraConfig.actualAudioMuted
            );
          }
          referToVideo();
          ctx.emit("localStream", localStream, streamId.value);
        }
      },
      {
        deep: true,
      }
    );

    watchEffect(() => {
      // 设置扬声器
      if (video.value) {
        (video.value as any).setSinkId(store.state.speakerDevice.deviceID);
        video.value.volume = store.state.speakerDevice.volume / 100;
      }
    });

    watch(
      () => streamId.value,
      async () => {
        if (streamId.value) {
          await nextTick();
          if (streamId.value !== store.state.user.uid.toString()) {
            localStream = await zg.startPlayingStream(streamId.value as string);
          } else {
            localStream = await zg.createStream({
              camera: store.state.cameraConfig,
            });
            zg.setCaptureVolume(localStream, store.state.cameraConfig.volume);
            ctx.emit("localStream", localStream, streamId.value);
          }
          referToVideo();

          // 绑定流质量回调

          if (isAnchorVideo.value) {
            zg.on(
              isAnchor.value ? "publishQualityUpdate" : "playQualityUpdate",
              (streamID: string, stats: ZegoPlayStats) => {
                if (streamId.value === streamID) {
                  qualityState.value.frames = `${stats.video.frameWidth} × ${stats.video.frameHeight} p`;
                  qualityState.value.bitrate = `${(
                    stats.video.videoBitrate + stats.audio.audioBitrate
                  ).toFixed(0)} ms`;
                  qualityState.value.FPS = `${stats.video.videoFPS.toFixed(
                    0
                  )} fps`;
                  qualityState.value.lostRate = `${stats.video.videoPacketsLostRate.toFixed(
                    0
                  )} %`;
                }
              }
            );
          }
        }
      },
      {
        immediate: true,
      }
    );

    watch(
      () => isPlaying.value,
      (val) => {
        if (val) {
          if (isAnchor.value && isAnchorVideo.value) {
            PubSub.subscribe(
              streamId.value as string,
              (
                msg: string,
                data: {
                  type: string;
                  playing: boolean;
                  src: string;
                  volume: number;
                }
              ) => {
                if (data.type === "music") {
                  if (speakerAudio.value) {
                    speakerAudio.value.pause();
                    zg.stopMixingAudio(streamId.value as string);
                  }
                  if (data.playing && speakerAudio.value) {
                    speakerAudio.value.src = data.src;
                    speakerAudio.value.crossOrigin = "anonymous";
                    speakerAudio.value.loop = true;
                    speakerAudio.value.play().then(() => {
                      zg.startMixingAudio(streamId.value as string, [
                        speakerAudio.value as HTMLAudioElement,
                      ]);
                      zg.setMixingAudioVolume(
                        streamId.value as string,
                        data.volume,
                        speakerAudio.value as HTMLAudioElement
                      );
                    });
                  }
                } else if (data.type === "musicVolume") {
                  if (speakerAudio.value) {
                    zg.setMixingAudioVolume(
                      streamId.value as string,
                      data.volume,
                      speakerAudio.value as HTMLAudioElement
                    );
                  }
                } else if (data.type === "microVolume" && localStream) {
                  zg.setCaptureVolume(localStream, data.volume);
                }
              }
            );
          }
        }
      }
    );

    zg.on("remoteCameraStatusUpdate", (streamID, status) => {
      if (streamID === streamId.value) {
        videoStatus.value = status;
      }
    });

    onBeforeUnmount(() => {
      if (isAnchor.value && isAnchorVideo.value) {
        if (speakerAudio.value) {
          speakerAudio.value.pause();
        }
        zg.stopMixingAudio(streamId.value as string);
        PubSub.unsubscribe(streamId.value);
      }
    });

    return {
      isAnchorVideo,
      isAnchor,
      video,
      videoStatus,
      qualityState,
      speakerAudio,
    };
  },
});
</script>

<style lang="less">
.mute-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  object-fit: cover;
  filter: blur(15px);
  padding: 1rem;
  box-sizing: border-box;
}
.mute-guest {
  width: 40%;
  object-fit: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  border-radius: 100%;
}
.mute-anthor-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.anthor-media-status {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 101;
  width: 126px;
  background: rgba(29, 20, 46, 0.7);
  border-radius: 4px;
  font-size: 12px;
  color: #ffffff;
  line-height: 24px;
  padding: 10px 16px 10px;
  display: flex;
  flex-direction: column;
  svg {
    align-self: flex-end;
  }
}
.audience-video-container {
  position: relative;
  width: 100%;
  padding-top: 75%;
  box-sizing: border-box;
  border-radius: 4px;
  &:hover {
    .anchor-operate-audience {
      display: inline-block;
      z-index: 100;
    }
  }
  .anchor-operate-audience {
    position: absolute;
    right: 8px;
    top: 8px;
    display: none;
    .handle {
      width: 22px;
      height: 16px;
      background: rgba(0, 0, 0, 0.2);
      padding: 4px;
      box-sizing: border-box;
      border-radius: 4px;
    }
    .operator-positon {
      width: 80px;
    }
  }
  .attendee-name {
    position: absolute;
    left: 8px;
    bottom: 12px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.2);
    color: #e0dde3;
    height: 12px;
    font-size: 12px;
    line-height: 12px;
    padding: 5px 6px;
    display: inline-block;
    z-index: 100;
  }
  .attendee-mic {
    position: absolute;
    right: 8px;
    bottom: 12px;
    background: rgba(0, 0, 0, 0.2);
    color: #e0dde3;
    border-radius: 4px;
    width: 22px;
    height: 22px;
    z-index: 100;
  }
}
.main-video {
  object-fit: cover;
  width: 100%;
  height: 100%;
  bottom: 0;
  position: absolute;
  border-radius: 4px;
}
</style>
