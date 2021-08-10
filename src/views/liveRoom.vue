<template>
  <el-container class="live-room">
    <el-header height="56px" class="live-room-header">
      <div>
        <i
          class="avatar"
          :style="{
            'background-image': `url(${require('../assets/person/' +
              $store.state.room.creator_name?.picIndex() +
              '-avatar@2x.png')}`,
          }"
        ></i>
        <span class="room-title">
          {{ $store.state.room?.subject }}
        </span>
      </div>
      <div>
        <icon
          name="icon_data_normal"
          :isButton="true"
          v-if="isAnchor"
          @click="showStatus = !showStatus"
        ></icon>
        <icon
          name="a-icon_settingup"
          v-if="isAnchor"
          :isButton="true"
          class="setting"
          @click="showMediaSetting = !showMediaSetting"
        ></icon>
        <span
          class="room-operation"
          :class="isPlaying ? 'close-anchor' : 'start-anchor '"
          v-if="isAnchor"
          @click="publishStream()"
        >
          {{ isPlaying ? "结束直播" : "开始直播" }}
        </span>
        <span class="room-operation close-anchor" v-else @click="quitRoom">
          退出直播间
        </span>
      </div>
    </el-header>
    <el-container style="height: calc(100% - 56px)">
      <el-main class="video-area">
        <div class="video-box">
          <main-video
            class="anchor-box"
            :streamId="anchorStreamId"
            :picIndex="$store.state.room.creator_name?.picIndex()"
            :isPlaying="isPlaying"
            @localStream="setLocalStream"
            :style="
              !audienceStreamId.length && { width: '100%', maxWidth: '100%' }
            "
            :showStatus="showStatus"
            @closeStatus="showStatus = false"
          ></main-video>
          <div class="audience-box" v-if="audienceStreamId.length > 0">
            <main-video
              v-for="streamId in audienceStreamId"
              :key="streamId"
              :streamId="streamId"
              :attendeeMap="attendeeMap"
              @localStream="setLocalStream"
              @handleCommand="
                (value, streamId) => handleCommand(value, streamId)
              "
              :picIndex="attendeeMap.get(streamId)?.nick_name?.picIndex()"
            ></main-video>
          </div>
        </div>
        <div class="interactive-box">
          <div
            class="operation"
            v-if="!!localStream"
            @click="updateMedia('webcam')"
          >
            <icon
              :name="
                $store.state.cameraConfig.actualVideoMuted
                  ? 'icon_cam_off'
                  : 'icon_cam_on'
              "
            ></icon
            ><br />
            <span>摄像头</span>
          </div>
          <div
            class="operation"
            v-if="!!localStream"
            @click="updateMedia('microphone')"
          >
            <icon
              :name="
                $store.state.cameraConfig.actualAudioMuted
                  ? 'icon_operation_mic_off'
                  : 'icon_mic_on'
              "
            ></icon
            ><br />
            <span>麦克风</span>
          </div>
          <div
            class="operation"
            v-if="isAnchor && !showEquipmentCheck"
            @click="updateMedia('music')"
          >
            <icon name="icon_setting_music"></icon><br />
            <span>背景音</span>
          </div>
          <template v-if="!isAnchor">
            <span
              v-if="audienceStreamId.includes($store.state.user.uid.toString())"
              class="room-operation cancel-micro"
              @click="destroyStream"
              >结束连麦</span
            >
            <span
              v-else-if="tryingConnected"
              class="room-operation cancel-micro"
              @click="applyForMicro(1)"
              >取消连麦</span
            >
            <span
              v-else
              class="room-operation apply-for-micro"
              @click="applyForMicro(2)"
              ><icon name="icon_wheat"></icon>申请连麦</span
            >
          </template>
        </div>
      </el-main>
      <chat-box
        :isLogin="isLogin"
        :tryingConnected="tryingConnected"
        :audienceStreamId="audienceStreamId"
        :attendeeList="attendeeList"
        @destroyStream="destroyStream"
        @updateMic="updateMic"
        @updateAttendee="updateAttendee"
        @connected="connectedAnthor"
      ></chat-box>
    </el-container>
    <media-setting
      :show="showMediaSetting"
      :localStream="localStream"
      :isPlaying="isPlaying"
      @show="showMediaSetting = false"
    ></media-setting>
    <music-setting
      v-if="isAnchor"
      v-show="music"
      @close="music = false"
      :streamId="anchorStreamId"
    ></music-setting>
    <equipmentCheck
      v-if="showEquipmentCheck"
      @checkFinish="beginAnthor"
    ></equipmentCheck>
  </el-container>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  watchEffect,
} from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import router from "@/router";
import mainVideo from "@/components/mainVideo.vue";
import {
  getStatefulList,
  loginRoom,
  logoutRoom,
  operateRaiseHand,
  setUserInfo,
} from "@/service/room";
import { zg } from "@/service/SDKServer";
import { ElMessage, ElMessageBox } from "element-plus";
import chatBox from "@/components/chatBox.vue";
import { MainStore } from "@/store/store";
import mediaSetting from "@/components/mediaSetting.vue";
import musicSetting from "@/components/musicSetting.vue";
import equipmentCheck from "@/components/equipmentInspection/equipmentCheck.vue";

export default defineComponent({
  components: {
    mainVideo,
    chatBox,
    mediaSetting,
    musicSetting,
    equipmentCheck,
  },
  setup() {
    const store = useStore<MainStore>();
    const { params: routeParams } = useRoute();
    const music = ref(false); // 设置背景音弹窗
    const anchorStreamId = ref("");
    const audienceStreamId = ref<Array<string>>([]);
    const anthor = ref({} as Attendee); // 主播基础信息
    const attendeeList = ref<Array<Attendee>>([]); // 观众基础信息
    const showStatus = ref(false); // 展示主播设备状态
    const showMediaSetting = ref(false); // 设置房间弹窗
    const isLogin = ref(false);
    const tryingConnected = ref(false);
    const showEquipmentCheck = ref(false);

    const localStream = ref<MediaStream | null>(null); // 本客户端流
    // 主播是否已开播，观众端只能为开播状态
    const isPlaying = ref(true);
    const setLocalStream = function (value: MediaStream, streamId: string) {
      localStream.value = value;
      if (audienceStreamId.value.indexOf(streamId) !== -1) {
        // 如果是观众端，则直接推流
        zg.startPublishingStream(streamId, localStream.value, {
          extraInfo: isAnchor.value ? "anchor" : "Audience",
          videoCodec: "VP8",
        });
      }
    };

    const isAnchor = computed(() => {
      // 是否为主播本人
      return (
        store.state.room?.creator_id.toString() ===
        store.state.user?.uid.toString()
      );
    });

    const attendeeMap = computed(() => {
      const map = new Map<string, Attendee>();
      for (const attendee of attendeeList.value) {
        map.set(attendee.uid.toString(), attendee);
      }
      return map;
    });

    const destroyStream = function (broadcast = true) {
      if (broadcast) {
        // 广播通知其他成员
        setUserInfo({
          uid: store.state.user.uid,
          target_uid: store.state.user.uid,
          room_id: routeParams.roomId as string,
          on_stage: 1,
          type: 2,
        });
      }
      // 结束连麦
      if (localStream.value) {
        // 停止推流
        zg.stopPublishingStream(store.state.user.uid.toString());
        // 删除流Id
        if (isAnchor.value) {
          isPlaying.value = false;
        } else {
          audienceStreamId.value.splice(
            audienceStreamId.value.indexOf(store.state.user.uid.toString()),
            1
          );
        }
        // 清空本地缓冲流
        zg.destroyStream(localStream.value);
        localStream.value = null;
      }
    };

    const applyForMicro = function (type: 1 | 2): void {
      if (type === 2 && audienceStreamId.value.length > 2) {
        ElMessage({
          customClass: "alert-box",
          message: "最多支持3名观众连麦",
        });
        return;
      }
      operateRaiseHand(store.state.user.uid, routeParams.roomId as string, type)
        .then(() => {
          if (type === 2) {
            tryingConnected.value = true;
            ElMessage({
              customClass: "alert-box",
              message: "你已申请连麦，请等待主播确认",
            });
          } else if (type === 1) {
            tryingConnected.value = false;
          }
        })
        .catch(() => {
          ElMessage({
            customClass: "alert-box",
            message: "申请失败，请重试",
          });
        });
    };

    const connectedAnthor = function (isConnected: boolean) {
      // 与主播连麦
      if (isConnected) {
        audienceStreamId.value.push(store.state.user.uid.toString());
        updateAttendee();
      } else {
        if (tryingConnected.value) {
          ElMessage({
            customClass: "alert-box",
            message: "主播已拒绝与你的连麦申请",
          });
        }
      }
      // 放下举手
      applyForMicro(1);
    };

    const updateAttendee = function () {
      getStatefulList(store.state.user.uid, routeParams.roomId as string).then(
        (data) => {
          attendeeList.value = [];
          for (const item of data) {
            if (item.role === 3) {
              anthor.value = item;
            } else {
              attendeeList.value.push(item);
            }
          }
        }
      );
    };

    const onCallBack = () => {
      zg.on("roomStreamUpdate", (roomID, updateType, streamList) => {
        if (routeParams.roomId === roomID) {
          updateAttendee();
          if (updateType === "ADD") {
            streamList.forEach((stream) => {
              if (stream.user.userID !== store.state.user.uid.toString()) {
                if (stream.extraInfo === "anchor") {
                  anchorStreamId.value = stream.streamID;
                } else {
                  audienceStreamId.value.push(stream.streamID);
                }
              }
            });
          } else {
            streamList.forEach((stream) => {
              if (stream.user.userID !== store.state.user.uid.toString()) {
                zg.stopPlayingStream(stream.streamID);
                if (stream.extraInfo === "anchor") {
                  ElMessageBox.alert("主播已结束直播", {
                    confirmButtonText: "确定",
                    center: true,
                    showClose: false,
                    customClass: "message-box",
                    confirmButtonClass: "zg-button small-button border-radius-5 ",
                  });
                  anchorStreamId.value = "";
                  router.push({ path: "/" });
                } else {
                  audienceStreamId.value.splice(
                    audienceStreamId.value.indexOf(stream.streamID),
                    1
                  );
                }
              }
            });
          }
        }
      });
    };

    const updateMedia = function (type: "microphone" | "webcam" | "music") {
      if (localStream.value) {
        if (type === "webcam") {
          store.state.cameraConfig.actualVideoMuted = !store.state.cameraConfig.actualVideoMuted;
          zg.mutePublishStreamVideo(
            localStream.value,
            store.state.cameraConfig.actualVideoMuted
          );
        } else if (type === "microphone") {
          store.state.cameraConfig.actualAudioMuted = !store.state.cameraConfig.actualAudioMuted;
          if (isAnchor.value) {
            zg.mutePublishStreamAudio(
              localStream.value,
              store.state.cameraConfig.actualAudioMuted
            );
          } else {
            const attendee = attendeeMap.value.get(
              store.state.user.uid.toString()
            );
            if (attendee?.mic === 2) {
              zg.mutePublishStreamAudio(
                localStream.value,
                store.state.cameraConfig.actualAudioMuted
              );
            }
          }
        } else if (type === "music") {
          music.value = !music.value;
        }
      }
    };

    const publishStream = function () {
      if (localStream.value) {
        if (!isPlaying.value) {
          const isSuccess = zg.startPublishingStream(
            store.state.user.uid.toString(),
            localStream.value,
            {
              extraInfo: isAnchor.value ? "anchor" : "Audience",
              videoCodec: "VP8",
            }
          );
          if (isSuccess) {
            isPlaying.value = true;
          }
        } else {
          destroyStream(false);
          router.push({ path: "/" });
        }
      }
    };

    const stopLoginRoom = watchEffect(() => {
      if (store.state.token && routeParams.roomId) {
        loginRoom(
          store.state.user,
          routeParams.roomId as string,
          store.state.token
        )
          .then(({ data }) => {
            isLogin.value = true;
            if (store.state.room.room_id !== routeParams.roomId) {
              store.commit("setter", { key: "room", value: data });
            }
            if (isAnchor.value) {
              isPlaying.value = false;
              try {
                const stringConfig = sessionStorage.getItem("checkFinish");
                if (stringConfig) {
                  const config = JSON.parse(stringConfig);
                  if (config.cameraConfig) {
                    store.commit("setter", {
                      key: "cameraConfig",
                      value: config.cameraConfig,
                    });
                  }
                  if (config.speakerDevice) {
                    store.commit("setter", {
                      key: "speakerDevice",
                      value: config.speakerDevice,
                    });
                  }
                  beginAnthor();
                } else {
                  showEquipmentCheck.value = true;
                }
              } catch (error) {
                showEquipmentCheck.value = true;
              }
            }
            sessionStorage.setItem("room", JSON.stringify(store.state.room));
          })
          .catch(({ ret }) => {
            ElMessageBox.alert(ret.message, {
              center: true,
              confirmButtonText: "确定",
              customClass: "message-box",
              confirmButtonClass: "zg-button small-button border-radius-5 ",
            });
            if (ret.code === 81001) {
              sessionStorage.clear();
              store.commit("setter", {
                key: "user",
                value: { uid: 0, nick_name: "", avatar: "" },
              });
              store.commit("setter", {
                key: "room",
                value: {
                  room_id: "",
                  subject: "",
                  create_time: "",
                  creator_name: "",
                  creator_id: 0,
                  online_count: "",
                  on_stage_count: "",
                },
              });
            } else if (ret.code === 81000) {
              router.push({ path: "/" });
            }
          })
          .finally(() => {
            stopLoginRoom();
          });
      }
    });

    const updateMic = function (mic: 1 | 2) {
      if (localStream.value) {
        if (mic === 1) {
          zg.mutePublishStreamAudio(localStream.value, true);
        } else if (mic === 2 && store.state.cameraConfig.actualAudioMuted) {
          // 解除禁言的同时，麦克风必须开启才开始推音频流
          zg.mutePublishStreamAudio(localStream.value, false);
        }
        setUserInfo({
          uid: store.state.user.uid,
          target_uid: store.state.user.uid,
          room_id: routeParams.roomId as string,
          mic,
          type: 1,
        });
      }
    };

    const handleCommand = function (command: string, streamId: string) {
      let mic = attendeeMap.value.get(streamId)?.mic as 1 | 2;
      if (command === "onMic") {
        mic = mic === 1 ? 2 : 1;
      }
      const message = {
        cmd: 10000,
        data: {
          type: command === "onStage" ? 2 : 1,
          mic: mic,
        },
      };
      zg.sendCustomCommand(
        routeParams.roomId as string,
        JSON.stringify(message),
        [streamId]
      );
    };

    // 检测完成回调
    const beginAnthor = function () {
      anchorStreamId.value = store.state.user.uid?.toString();
      showEquipmentCheck.value = false;
    };

    const quitRoom = function () {
      destroyStream();
      router.push({ path: "/" });
    };

    onCallBack();

    window.onbeforeunload = async function () {
      // await logoutRoom(store.state.user?.uid, routeParams.roomId as string);
    };

    onBeforeUnmount(() => {
      logoutRoom(store.state.user?.uid, routeParams.roomId as string);
      store.commit("setter", { key: "room", value: null });
    });

    return {
      isLogin,
      anchorStreamId,
      audienceStreamId,
      isAnchor,
      isPlaying,
      music,
      tryingConnected,
      attendeeList,
      localStream,
      attendeeMap,
      showStatus,
      showMediaSetting,
      showEquipmentCheck,
      updateMedia,
      updateAttendee,
      updateMic,
      handleCommand,
      destroyStream,
      applyForMicro,
      connectedAnthor,
      setLocalStream,
      publishStream,
      beginAnthor,
      quitRoom,
    };
  },
});
</script>

<style lang="less">
.live-room {
  background: #1d142e;
  width: 100%;
  height: 100%;
  padding: 16px;
  color: #aca5b4;

  .live-room-header {
    display: flex;
    justify-content: space-between;
    background: #302045;
    border-radius: 4px;
    padding: 0 24px;
    line-height: 56px;
    .room-title {
      padding-left: 10px;
      font-size: 18px;
      font-family: MicrosoftYaHei-Bold, MicrosoftYaHei;
      font-weight: bold;
      color: #ccc;
    }
    .setting {
      margin: 0 14px;
    }
    .start-anchor {
      color: white;
      padding: 4px 19px;
      background: linear-gradient(126deg, #a754ff 0%, #510df1 100%);
    }
    .close-anchor {
      color: #ff4a50;
      padding: 4px 19px;
      background: rgba(255, 74, 80, 0.2);
    }
  }
  .room-operation {
    border-radius: 44px;
    font-size: 12px;
    line-height: 12px;
    cursor: pointer;
    text-align: center;
  }

  .video-area {
    padding: 0;
    overflow: hidden;
    .interactive-box {
      padding: 0 8px;
      position: relative;
      height: 64px;
      background: #302045;
      width: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: left;
      .apply-for-micro {
        box-sizing: border-box;
        width: 90px;
        height: 32px;
        line-height: 32px;
        background: linear-gradient(126deg, #a754ff 0%, #510df1 100%);
        position: absolute;
        right: 24px;
      }
      .cancel-micro {
        box-sizing: border-box;
        width: 90px;
        height: 32px;
        line-height: 32px;
        background: rgba(224, 221, 227, 0.1);
        position: absolute;
        right: 24px;
      }
      .operation {
        cursor: pointer;
        color: rgba(255, 255, 255, 0.8);
        font-size: 10px;
        margin: 0 16px;
        &:hover {
          color: #a653ff;
        }
        &:active {
          color: white;
        }
        svg {
          width: 30px;
          height: 30px;
        }
      }
    }
    .video-box {
      width: 100%;
      margin: 8px 0;
      height: calc(100% - 80px);
      display: flex;
      .anchor-box {
        width: calc(100% - 21.4% - 8px);
        max-width: calc(100% - 240px);
        height: 100%;
        position: relative;
      }
      .audience-box {
        width: 21.4%;
        min-width: 232px;
        margin-left: 8px;
      }
    }
  }
}
</style>
