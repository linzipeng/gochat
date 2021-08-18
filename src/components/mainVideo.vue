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
              <template
                v-if="$route.params.roomId !== '100000' && user?.mic === 2"
              >
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
      <span class="attendee-name">{{ user?.nick_name }}</span>
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
    <icon
      class="attendee-mic"
      v-if="$route.params.roomId !== '100000' && user?.mic === 1"
      name="icon_mic_off"
    ></icon>
    <video
      v-show="$route.params.roomId === '100000' || user?.camera === 2"
      ref="video"
      :id="`video-${streamId}`"
      class="main-video"
      style="object-fit: cover"
      :style="
        isAnchorVideo && { height: '100%', width: '100%', position: 'inherit' }
      "
      autoplay
      :muted="
        $store.state.user.uid.toString() === streamId ||
        $route.params.roomId === '100000'
      "
      playsinline
    ></video>
    <template v-if="user?.camera === 1">
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
  PropType,
  ref,
  toRefs,
  watch,
  watchEffect,
} from "vue";
import { useStore } from "vuex";
import { zg } from "@/service/SDKServer";
import icon from "./icon.vue";
import { ZegoPlayStats } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { MainStore } from "@/store/store";
import { useRoute } from "vue-router";
import { setRoomStream, setStatus } from "@/service/room";

export default defineComponent({
  components: { icon },
  props: {
    streamId: {
      type: String,
    },
    picIndex: {
      type: String,
    },
    user: {
      type: Object as PropType<User>,
    },
    showStatus: {
      type: Boolean,
    },
    isPlaying: {
      type: Boolean,
    },
    isAnchor: {
      type: Boolean,
    },
    createStream: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
  },
  setup(props, ctx) {
    const { streamId, isPlaying, isAnchor, createStream } = toRefs(props);
    const store = useStore<MainStore>();
    const video = ref<HTMLVideoElement | null>(null);
    const speakerAudio = ref<HTMLAudioElement | null>(null);
    const { params: routeParams } = useRoute();

    const qualityState = ref({
      frames: "0p",
      bitrate: "0kbs",
      FPS: "0fps",
      lostRate: "0%",
    });

    const isAnchorVideo = computed(() => {
      return (
        store.state.room?.stream_id === streamId.value ||
        routeParams.roomId === "100000"
      );
    });
    let localStream: MediaStream;

    const referToVideo = function () {
      if (video.value) {
        video.value.pause();
        video.value.srcObject = localStream;
        video.value.onloadeddata = function () {
          console.log("載入完畢！");
          const handler = setInterval(() => {
            if (video.value) {
              video.value.play().then(() => {
                clearInterval(handler);
              });
            }
          }, 200);
        };
      }
    };

    const stopCamera = watch(
      () => store.state.cameraConfig,
      async (current, before) => {
        if (
          (isAnchor.value && isAnchorVideo.value) ||
          store.state.user.uid.toString() === streamId.value
        ) {
          if (
            current.height !== before.height ||
            current.width !== before.width ||
            current.videoQuality !== before.videoQuality ||
            current.bitrate !== before.bitrate ||
            current.frameRate !== before.frameRate
          ) {
            // 分辨率
            if (isPlaying.value) {
              zg.setVideoConfig(localStream, {
                width: current.width,
                height: current.height,
                frameRate: current.frameRate,
                maxBitrate: current.bitrate,
              });
            } else {
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
          }
          if (current.videoInput !== before.videoInput) {
            // 摄像头
            zg.useVideoDevice(localStream, current.videoInput as string);
          }
          if (current.audioInput !== before.audioInput) {
            // 麦克风
            zg.useAudioDevice(localStream, current.audioInput as string);
          }
          if (current.volume !== before.volume) {
            // 麦克风声音
            zg.setCaptureVolume(localStream, current.volume);
          }
          if (current.actualVideoMuted !== before.actualVideoMuted) {
            // 关闭摄像头
            zg.mutePublishStreamVideo(localStream, !!current.actualVideoMuted);
          }
          if (current.actualAudioMuted !== before.actualAudioMuted) {
            // 关闭麦克风
            zg.mutePublishStreamAudio(localStream, !!current.actualAudioMuted);
          }
        } else {
          stopCamera();
        }
      },
      {
        deep: true,
      }
    );

    const stopMixingAudio = watch(
      () => store.state.mixingAudio,
      (current, before) => {
        if (isAnchor.value && isAnchorVideo.value) {
          if (current.id !== before.id) {
            if (speakerAudio.value) {
              speakerAudio.value.pause();
              if (isPlaying.value) {
                zg.stopMixingAudio(streamId.value as string);
              }
              if (current.src) {
                speakerAudio.value.src = current.src;
                speakerAudio.value.crossOrigin = "anonymous";
                speakerAudio.value.loop = true;
                speakerAudio.value.play().then(() => {
                  if (isPlaying.value) {
                    zg.startMixingAudio(streamId.value as string, [
                      speakerAudio.value as HTMLAudioElement,
                    ]);
                  }
                });
              }
            }
          } else if (current.volume !== before.volume) {
            if (speakerAudio.value) {
              speakerAudio.value.volume = current.volume / 100;
            }
          }
        } else {
          stopMixingAudio();
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

    const finishInit = watch(
      () => createStream.value,
      async (val) => {
        if (val) {
          await nextTick();
          if (
            routeParams.roomId === "100000" ||
            streamId.value === store.state.user.uid.toString()
          ) {
            // 主播未开播或者观众连麦
            localStream = await zg.createStream({
              camera: store.state.cameraConfig,
            });
            zg.setCaptureVolume(localStream, store.state.cameraConfig.volume);
            ctx.emit("localStream", localStream, streamId.value);
          } else {
            localStream = await zg.startPlayingStream(streamId.value as string);
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
                  ).toFixed(0)} kbs`;
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
          finishInit();
        }
      },
      {
        immediate: true,
      }
    );

    const startPublishingStream = function () {
      nextTick(() => {
        const isSuccess = zg.startPublishingStream(
          streamId.value as string,
          localStream as MediaStream,
          {
            videoCodec: "VP8",
          }
        );
        if (isSuccess) {
          setRoomStream(
            store.state.user.uid,
            store.state.room.room_id,
            streamId.value as string,
          );
          if (store.state.cameraConfig.actualVideoMuted) {
            setStatus({
              uid: store.state.user.uid,
              room_id: store.state.room.room_id,
              nick_name: store.state.user.nick_name,
              target_uid: store.state.user.uid,
              camera: 1,
              type: 2,
            });
          }
          if (store.state.cameraConfig.actualAudioMuted) {
            setStatus({
              uid: store.state.user.uid,
              room_id: store.state.room.room_id,
              nick_name: store.state.user.nick_name,
              target_uid: store.state.user.uid,
              mic: 1,
              type: 1,
            });
          }
        }
      });
    };

    zg.on("publisherStateUpdate", (result) => {
      if (
        result.streamID === streamId.value &&
        result.state === "PUBLISHING" &&
        store.state.mixingAudio.src
      ) {
        zg.startMixingAudio(streamId.value as string, [
          speakerAudio.value as HTMLAudioElement,
        ]);
      }
    });

    onBeforeUnmount(() => {
      if (isAnchor.value && isAnchorVideo.value) {
        if (speakerAudio.value) {
          speakerAudio.value.pause();
        }
        zg.stopMixingAudio(streamId.value as string);
      }
    });

    return {
      isAnchorVideo,
      video,
      qualityState,
      speakerAudio,
      startPublishingStream,
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
.main-video {
  object-fit: cover;
  width: 100%;
  height: 100%;
  bottom: 0;
  position: absolute;
  border-radius: 4px;
}
</style>
