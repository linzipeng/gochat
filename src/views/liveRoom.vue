<template>
  <el-container class="live-room">
    <el-header height="56px" class="live-room-header">
      <div>
        <i
          class="avatar"
          :style="{
            'background-image': `url(${require('../assets/person/' +
              ($store.state.room?.cover_img || $store.state.user?.avatar) +
              '-avatar@2x.png')}`,
          }"
        ></i>
        <span class="room-title">
          {{
            $store.state.room?.subject ||
            $route.params.name ||
            $store.state.user.nick_name + "创建的直播间"
          }}
        </span>
      </div>
      <div class="line-height-33">
        <el-popover
          v-if="isAnchor"
          placement="bottom"
          popper-class="about-popover feedback-popover-position"
          trigger="hover"
          :show-arrow="false"
          :offset="12"
          content="实时数据"
        >
          <template #reference>
            <icon
              name="icon_data_normal"
              class="margin-right-10"
              :isButton="true"
              @click="showStatus = !showStatus"
            ></icon>
          </template>
        </el-popover>
        <el-popover
          placement="bottom"
          v-if="isAnchor"
          popper-class="about-popover about-popover-position"
          trigger="hover"
          :show-arrow="false"
          :offset="12"
          content="设置"
        >
          <template #reference>
            <icon
              v-popover:media-popover
              name="a-icon_settingup"
              :isButton="true"
              class="margin-right-10"
              @click="showMediaSetting = !showMediaSetting"
            ></icon>
          </template>
        </el-popover>
        <span class="one-line" v-if="isAnchor"></span>
        <span
          class="room-operation"
          :class="isPlaying ? 'close-anchor' : 'zg-button start-anchor'"
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
            ref="anthorVideo"
            :streamId="anchorStreamId"
            :picIndex="
              $store.state.room?.cover_img || $store.state.user?.avatar
            "
            :user="attendeeMap.get(anchorStreamId)"
            :isPlaying="isPlaying"
            :isAnchor="isAnchor"
            :createStream="
              !showEquipmentCheck &&
              ($route.params.roomId === '100000' || anchorStreamId !== '')
            "
            @localStream="setLocalStream"
            :style="
              !audienceStreamId.length && { width: '100%', maxWidth: '100%' }
            "
            :showStatus="showStatus"
            @closeStatus="showStatus = false"
            :streamExtraInfo="streamExtraInfo.get(anchorStreamId)"
          ></main-video>
          <div class="audience-box" v-if="audienceStreamId.length > 0">
            <main-video
              v-for="streamId in audienceStreamId"
              :key="streamId"
              :streamId="streamId"
              :attendeeMap="attendeeMap"
              :isAnchor="isAnchor"
              :user="attendeeMap.get(streamId)"
              @localStream="setLocalStream"
              @handleCommand="
                (value, streamId) => handleCommand(value, streamId)
              "
              :picIndex="attendeeMap.get(streamId)?.avatar"
              :streamExtraInfo="streamExtraInfo.get(streamId)"
            ></main-video>
          </div>
        </div>
        <div class="interactive-box">
          <div
            class="operation"
            :class="{ 'operation-diabled': !$store.state.cameraConfig.video }"
            v-if="!!localStream || isAnchor"
            @click="updateMedia('webcam')"
          >
            <icon
              :name="
                $store.state.cameraConfig.video
                  ? $store.state.cameraConfig.actualVideoMuted
                    ? 'icon_cam_off'
                    : 'icon_cam_on'
                  : 'icon_cam_fault'
              "
            ></icon
            ><br />
            <div>摄像头</div>
          </div>
          <div
            class="operation"
            :class="{ 'operation-diabled': !$store.state.cameraConfig.audio }"
            v-if="!!localStream || isAnchor"
            @click="updateMedia('microphone')"
          >
            <icon
              :name="
                $store.state.cameraConfig.audio
                  ? attendeeMap.get($store.state.user?.uid.toString())?.mic ===
                      1 || $store.state.cameraConfig.actualAudioMuted
                    ? 'icon_operation_mic_off'
                    : 'icon_mic_on'
                  : 'icon_mic_fault'
              "
            ></icon
            ><br />
            <div>麦克风</div>
          </div>
          <div
            class="operation"
            v-if="isAnchor && !showEquipmentCheck"
            @click="updateMedia('music')"
          >
            <icon name="icon_setting_music" style="transform: scale(0.8)"></icon
            ><br />
            <div>背景音</div>
          </div>
          <template v-if="!isAnchor">
            <span
              v-if="audienceStreamId.includes($store.state.user.uid.toString())"
              class="room-operation cancel-micro message-cancel-btn"
              @click="destroyStream"
              ><icon name="icon_wheat"></icon>结束连麦</span
            >
            <span
              v-else-if="tryingConnected"
              class="room-operation cancel-micro message-cancel-btn"
              @click="applyForMicro(2, $store.state.room.host_id)"
              ><icon name="icon_wheat"></icon>取消连麦</span
            >
            <span
              v-else
              class="room-operation apply-for-micro zg-button"
              @click="applyForMicro(1, $store.state.room.host_id)"
              ><icon name="icon_wheat"></icon>申请连麦</span
            >
          </template>
        </div>
      </el-main>
      <chat-box
        :audienceStreamId="audienceStreamId"
        :attendeeList="attendeeList"
        @destroyStream="destroyStream"
        @connected="connectedAnthor"
        :inviteList="inviteList"
        @updateInviteList="updateInviteList"
        :isAnchor="isAnchor"
        :isPlaying="isPlaying"
      ></chat-box>
    </el-container>
    <media-setting
      v-if="isAnchor && showMediaSetting"
      @show="showMediaSetting = false"
    ></media-setting>
    <music-setting
      v-if="isAnchor"
      v-show="music"
      @close="music = false"
    ></music-setting>
    <equipmentCheck
      v-if="showEquipmentCheck"
      @checkFinish="createStream"
    ></equipmentCheck>
  </el-container>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  ref,
} from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import router from "@/router";
import mainVideo from "@/components/mainVideo.vue";
import {
  checkDevices,
  closeRoom,
  createRoom,
  getAttendeeList,
  loginRoom,
  logoutRoom,
  onstageInviteAction,
  onstageRequestAction,
  setStatus,
} from "@/service/room";
import { zg } from "@/service/SDKServer";
import { ElMessage, ElMessageBox } from "element-plus";
import chatBox from "@/components/chatBox.vue";
import { MainStore } from "@/store/store";
import mediaSetting from "@/components/mediaSetting.vue";
import musicSetting from "@/components/musicSetting.vue";
import equipmentCheck from "@/components/equipmentInspection/equipmentCheck.vue";
import { createUserInfo } from "@/service/user";
import keepLiving from "@/service/keepLiving";

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
    const raiseHandList: number[] = []; // 申请连麦列表
    const anthorVideo = ref<InstanceType<typeof mainVideo>>();
    const streamIdList = ref<Array<string>>([]);
    const attendeeList = ref<Array<User>>([]); // 房间成员列表
    // 主播流Id
    const anchorStreamId = computed(() => {
      if (streamIdList.value.length === 0) {
        return "";
      } else if (streamIdList.value.length === 1) {
        return streamIdList.value[0];
      } else {
        for (const streamId of streamIdList.value) {
          if (streamId === store.state.room.host_id.toString()) {
            return streamId;
          }
        }
        return streamIdList.value[0];
      }
    });
    // 连麦观众流Id
    const audienceStreamId = computed(() => {
      if (streamIdList.value.length < 2) {
        return [];
      } else {
        return streamIdList.value.filter((streamId) => {
          return streamId !== store.state.room.host_id.toString();
        });
      }
    });
    const streamExtraInfo = new Map<string, unknown>();
    // 房间人员映射表
    const attendeeMap = computed(() => {
      const map = new Map<string, User>();
      for (const attendee of attendeeList.value) {
        map.set(attendee.uid.toString(), attendee);
      }
      return map;
    });
    let isPublishing = false;
    const inviteList = ref<Array<number>>([]); // 邀请列表

    const showStatus = ref(false); // 展示主播设备状态
    const showMediaSetting = ref(false); // 设置房间弹窗
    const tryingConnected = ref(false);
    const showEquipmentCheck = ref(false);

    const localStream = ref<MediaStream | null>(null); // 本客户端流
    // 主播是否已开播，观众端只能为开播状态
    const isPlaying = ref(true);
    const setLocalStream = function (value: MediaStream, streamId: string) {
      localStream.value = value;
      if (
        streamIdList.value.indexOf(streamId) !== -1 &&
        routeParams.roomId !== "100000"
      ) {
        // 如果是观众端，则直接推流
        zg.startPublishingStream(streamId, localStream.value, {
          videoCodec: "VP8",
        });
      }
    };

    const isAnchor = computed(() => {
      // 是否为主播本人
      return (
        store.state.room?.host_id.toString() ===
          store.state.user?.uid.toString() || routeParams.roomId === "100000"
      );
    });

    const destroyStream = function (broadcast = true) {
      if (broadcast) {
        // 广播通知其他成员
        setStatus({
          uid: store.state.user.uid,
          target_uid: store.state.user.uid,
          nick_name: store.state.user.nick_name,
          room_id: store.state.room.room_id,
          type: 3,
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
          streamIdList.value.splice(
            streamIdList.value.indexOf(store.state.user.uid.toString()),
            1
          );
        }
        // 清空本地缓冲流
        zg.destroyStream(localStream.value);
        localStream.value = null;
      }
    };

    const check = async function (invite = true) {
      const cameraMessage = await checkDevices({ video: true, audio: false });
      if (cameraMessage) {
        ElMessage({
          customClass: "alert-box",
          message: `${invite ? "连麦" : "申请"}失败，${cameraMessage}`,
        });
        return false;
      }
      const microphoneMessage = await checkDevices({
        video: false,
        audio: true,
      });
      if (microphoneMessage) {
        ElMessage({
          customClass: "alert-box",
          message: `${invite ? "连麦" : "申请"}失败，${microphoneMessage}`,
        });
        return false;
      }
      return true;
    };

    const applyForMicro = async function (
      action: 1 | 2 | 3 | 4,
      targetUid: number
    ) {
      if (action === 1) {
        if (!(await check(false))) return;
        if (audienceStreamId.value.length > 2) {
          ElMessage({
            customClass: "alert-box",
            message: "最多支持3名观众连麦",
          });
          return;
        }
      }
      onstageRequestAction(
        store.state.user.uid,
        store.state.user.nick_name,
        targetUid,
        store.state.room.room_id,
        action
      )
        .then(() => {
          if (action === 1) {
            tryingConnected.value = true;
            ElMessage({
              customClass: "alert-box",
              message: "你已申请连麦，请等待主播确认",
            });
          } else if (action === 2) {
            tryingConnected.value = false;
          }
        })
        .catch((mess) => {
          if (action === 1 || action === 2) {
            ElMessage({
              customClass: "alert-box",
              message: mess || "申请失败，请重试",
            });
          } else if (action === 3) {
            ElMessage({
              customClass: "alert-box",
              message: mess || "最多支持3名观众连麦",
            });
          }
        });
    };

    const connectedAnthor = function (isConnected: boolean, message?: string) {
      // 与主播连麦
      if (isConnected) {
        streamIdList.value.push(store.state.user.uid.toString());
      } else {
        if (tryingConnected.value) {
          ElMessage({
            customClass: "alert-box",
            message: message || "主播已拒绝与你的连麦申请",
          });
        }
      }
      tryingConnected.value = false;
    };

    const updateAttendee = function () {
      getAttendeeList(store.state.user.uid, store.state.room.room_id).then(
        (data) => {
          attendeeList.value = data;
        }
      );
    };

    const onCallBack = () => {
      zg.on("IMRecvBroadcastMessage", (roomID, messageInfoList) => {
        if (store.state.room.room_id === roomID) {
          messageInfoList.forEach((messageInfo) => {
            if (messageInfo.fromUser.userID === "system") {
              try {
                const { cmd, data } = JSON.parse(messageInfo.message);
                if (cmd === 6002) {
                  // 成员状态变更通知
                  /**
                   * data.type
                   * 1.mic变化
                   * 2.cameara 变化
                   * 3.连麦状态变化
                   * 4.被邀请连麦
                   * 5.取消邀请连麦
                   * 6.拒绝邀请连麦
                   * 7.因为台上人数满上台失败
                   */
                  data.users.forEach((attendee: User) => {
                    if (attendee.uid === store.state.user.uid) {
                      // 主播操作的信息
                      let mess = "";
                      if (
                        data.type === 1 &&
                        data.operator_uid !== store.state.user.uid
                      ) {
                        if (attendee.mic === 1) {
                          mess = "你已被主播禁言";
                        } else {
                          mess = "你已被主播解除禁言";
                        }
                        updateMic(attendee.mic as 1 | 2);
                      } else if (data.type === 3) {
                        if (
                          attendee.onstage_state === 1 &&
                          store.state.user.uid !== data.operator_uid
                        ) {
                          mess = "你已被主播抱下麦";
                          destroyStream(false);
                        } else if (
                          attendee.onstage_state === 2 &&
                          data.operator_uid === store.state.user.uid
                        ) {
                          connectedAnthor(true);
                        }
                      } else if (data.type === 4 && !isAnchor.value) {
                        ElMessageBox.confirm(
                          "主播邀请您连麦？是否同意",
                          "连麦邀请",
                          {
                            confirmButtonText: "同意",
                            cancelButtonText: "拒绝",
                            center: true,
                            showClose: false,
                            customClass: "message-box",
                            cancelButtonClass:
                              "message-cancel-btn border-radius-5 ",
                            confirmButtonClass:
                              "zg-button small-button border-radius-5 ",
                          }
                        )
                          .then(async () => {
                            const isOk = await check();
                            onstageInviteAction(
                              store.state.user.uid,
                              store.state.room.room_id,
                              store.state.room.host_id,
                              store.state.user.nick_name,
                              isOk ? 3 : 4,
                              isOk ? "" : `连麦失败`
                            )
                              .then(() => {
                                // connectedAnthor(true);
                              })
                              .catch(() => {
                                ElMessage({
                                  customClass: "alert-box",
                                  message: "最多支持3名观众连麦",
                                });
                              });
                          })
                          .catch(() => {
                            onstageInviteAction(
                              store.state.user.uid,
                              store.state.room.room_id,
                              store.state.room.host_id,
                              store.state.user.nick_name,
                              4
                            );
                          });
                      }
                      if (mess) {
                        ElMessage({
                          customClass: "alert-box",
                          message: mess,
                        });
                      }
                    }
                    if (isAnchor.value) {
                      if (data.type === 3) {
                        inviteList.value.splice(
                          inviteList.value.indexOf(attendee.uid),
                          1
                        );
                      } else if (data.type === 6) {
                        inviteList.value.splice(
                          inviteList.value.indexOf(attendee.uid),
                          1
                        );
                        ElMessage({
                          customClass: "alert-box",
                          message: `${attendee.nick_name}${
                            data.extra ? data.extra : "已拒绝连麦邀请"
                          }`,
                        });
                      } else if (data.type === 7) {
                        // 观众同意连麦，但是连麦人数已上限
                        inviteList.value.splice(
                          inviteList.value.indexOf(data.uid),
                          1
                        );
                      }
                    }
                  });
                  updateAttendee();
                } else if (cmd === 6003) {
                  // 成员列表变更通知
                  updateAttendee();
                }
              } catch (err) {
                console.log(err);
              }
            }
          });
        }
      });
      zg.on("IMRecvCustomCommand", (roomID, fromUser, command) => {
        if (store.state.room.room_id === roomID) {
          if (fromUser.userID === "system") {
            try {
              const { cmd, data } = JSON.parse(command);
              if (cmd === 12006) {
                // 连麦申请/取消申请
                if (!raiseHandList.includes(data.uid)) {
                  // 不包含在举手列表中
                  raiseHandList.push(data.uid);
                }
                ElMessageBox.confirm(
                  `${data.nick_name} 申请与你连麦`,
                  "申请连麦",
                  {
                    customClass: "message-box",
                    confirmButtonText: "同意",
                    cancelButtonText: "拒绝",
                    center: true,
                    showClose: false,
                    cancelButtonClass: "message-cancel-btn border-radius-5 ",
                    confirmButtonClass:
                      "zg-button small-button border-radius-5 ",
                  }
                )
                  .then(() => {
                    if (raiseHandList.includes(data.uid)) {
                      onstageRequestAction(
                        store.state.user.uid,
                        store.state.user.nick_name,
                        data.uid,
                        roomID,
                        3
                      ).catch((err) => {
                        ElMessage({
                          customClass: "alert-box",
                          message: err || "最多支持3名观众连麦",
                        });
                      });
                    } else {
                      ElMessage({
                        customClass: "alert-box",
                        message: data.nick_name + `已取消连麦申请`,
                      });
                    }
                  })
                  .catch(() => {
                    if (raiseHandList.includes(data.uid)) {
                      onstageRequestAction(
                        store.state.user.uid,
                        store.state.user.nick_name,
                        data.uid,
                        roomID,
                        4
                      ).catch((err) => {
                        ElMessage({
                          customClass: "alert-box",
                          message: err,
                        });
                      });
                    } else {
                      ElMessage({
                        customClass: "alert-box",
                        message: data.nick_name + `已取消连麦申请`,
                      });
                    }
                  })
                  .finally(() => {
                    // 无论同意或者拒绝，清除举手列表
                    if (raiseHandList.includes(data.uid)) {
                      raiseHandList.splice(raiseHandList.indexOf(data.uid), 1);
                    }
                  });
              } else if (cmd === 12007) {
                // 取消申请连麦
                if (raiseHandList.includes(data.uid)) {
                  raiseHandList.splice(raiseHandList.indexOf(data.uid), 1);
                }
              } else if (cmd === 12008) {
                connectedAnthor(
                  false,
                  data.reason === 1
                    ? "主播已拒绝与你的连麦申请"
                    : "连麦人数达到上限"
                );
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      });
      zg.on("roomStreamUpdate", (roomID, updateType, streamList) => {
        if (store.state.room.room_id === roomID) {
          updateAttendee();
          if (updateType === "ADD") {
            streamList.forEach((stream) => {
              if (streamIdList.value.indexOf(stream.streamID) === -1) {
                streamIdList.value.push(stream.streamID);
                if (stream.extraInfo) {
                  streamExtraInfo.set(
                    stream.streamID,
                    JSON.parse(stream.extraInfo)
                  );
                }
              }
            });
          } else {
            streamList.forEach((stream) => {
              if (stream.user.userID !== store.state.user.uid.toString()) {
                zg.stopPlayingStream(stream.streamID);
                if (streamExtraInfo.has(stream.streamID)) {
                  streamExtraInfo.delete(stream.streamID);
                }
                if (store.state.room.stream_id === stream.streamID) {
                  keepLiving.stop();
                  ElMessageBox.alert("主播已结束直播", {
                    confirmButtonText: "确定",
                    center: true,
                    showClose: false,
                    customClass: "message-box",
                    confirmButtonClass:
                      "zg-button small-button border-radius-5 ",
                  }).then(() => {
                    quitRoom(false, false);
                  });
                } else {
                  streamIdList.value.splice(
                    streamIdList.value.indexOf(stream.streamID),
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
      if (type === "webcam") {
        if (!store.state.cameraConfig.video) {
          ElMessage({
            customClass: "alert-box",
            message: "摄像头不可用，请检查设备后重试",
          });
          return;
        }
        if (localStream.value) {
          const cameraConfig = JSON.parse(
            JSON.stringify(store.state.cameraConfig)
          );
          cameraConfig.actualVideoMuted = !cameraConfig.actualVideoMuted;
          store.commit("setter", {
            key: "cameraConfig",
            value: cameraConfig,
          });
          if (isPlaying.value) {
            setStatus({
              uid: store.state.user.uid,
              target_uid: store.state.user.uid,
              nick_name: store.state.user.nick_name,
              room_id: store.state.room.room_id,
              mic: store.state.cameraConfig.actualAudioMuted ? 1 : 2,
              camera: store.state.cameraConfig.actualVideoMuted ? 1 : 2,
              type: 2,
            });
          }
        }
      } else if (type === "microphone") {
        if (!store.state.cameraConfig.audio) {
          ElMessage({
            customClass: "alert-box",
            message: "麦克风不可用，请检查设备后重试",
          });
          return;
        }
        if (localStream.value) {
          if (isAnchor.value) {
            const cameraConfig = JSON.parse(
              JSON.stringify(store.state.cameraConfig)
            );
            cameraConfig.actualAudioMuted = !cameraConfig.actualAudioMuted;
            store.commit("setter", {
              key: "cameraConfig",
              value: cameraConfig,
            });
            if (isPlaying.value) {
              setStatus({
                uid: store.state.user.uid,
                target_uid: store.state.user.uid,
                nick_name: store.state.user.nick_name,
                room_id: store.state.room.room_id,
                mic: store.state.cameraConfig.actualAudioMuted ? 1 : 2,
                type: 1,
              });
            }
          } else {
            if (
              attendeeMap.value.get(store.state.user.uid.toString())?.mic ===
                1 &&
              !store.state.cameraConfig.actualAudioMuted
            ) {
              ElMessage({
                customClass: "alert-box",
                message: `您已被主播禁麦`,
              });
            } else {
              const cameraConfig = JSON.parse(
                JSON.stringify(store.state.cameraConfig)
              );
              cameraConfig.actualAudioMuted = !cameraConfig.actualAudioMuted;
              store.commit("setter", {
                key: "cameraConfig",
                value: cameraConfig,
              });
              setStatus({
                uid: store.state.user.uid,
                target_uid: store.state.user.uid,
                nick_name: store.state.user.nick_name,
                room_id: store.state.room.room_id,
                mic: store.state.cameraConfig.actualAudioMuted ? 1 : 2,
                type: 1,
              });
            }
          }
        }
      } else if (type === "music") {
        music.value = !music.value;
      }
    };

    const publishStream = function () {
      if (!localStream.value) {
        if (isPlaying.value) {
          router.push({ path: "/" });
        } else {
          ElMessage({
            customClass: "alert-box",
            message: "开播失败，请重新检测设备",
          });
        }
      } else if (!isPublishing) {
        if (!isPlaying.value) {
          isPublishing = true;
          // 创建房间
          createRoom(
            store.state.user,
            (routeParams.name ||
              store.state.user.nick_name + "创建的直播间") as string
          )
            .then(({ user_info: userInfo, room_info: roomInfo }) => {
              store.commit("setter", { key: "user", value: userInfo });
              store.commit("setter", { key: "room", value: roomInfo });
              sessionStorage.setItem("user", JSON.stringify(userInfo));
              streamIdList.value.push(userInfo.uid.toString());
              isPlaying.value = true;
              updateAttendee();
              if (anthorVideo.value) {
                anthorVideo.value.startPublishingStream();
              }
              router.push({
                name: "LiveRoom",
                params: { roomId: roomInfo.room_id },
              });
            })
            .catch(() => {
              ElMessage({
                showClose: false,
                customClass: "alert-box",
                message: "创建失败，请重试",
              });
            })
            .finally(() => {
              isPublishing = false;
            });
        } else {
          ElMessageBox({
            title: "结束直播",
            message: "结束直播后，该房间将会解散",
            center: true,
            showClose: false,
            closeOnClickModal: false,
            showCancelButton: true,
            showConfirmButton: true,
            customClass: "message-box",
            cancelButtonText: "取消",
            confirmButtonText: "确定",
            cancelButtonClass: "message-cancel-btn border-radius-5 ",
            confirmButtonClass: "zg-button small-button border-radius-5 ",
          }).then(() => {
            quitRoom(false);
          });
        }
      }
    };

    const loginRoomInit = function () {
      if (routeParams.roomId !== "100000") {
        loginRoom(store.state.user, routeParams.roomId as string)
          .then(({ data }) => {
            store.commit("setter", { key: "user", value: data.user_info });
            store.commit("setter", { key: "room", value: data.room_info });
          })
          .catch(({ ret }) => {
            ElMessageBox.alert(ret.message, {
              center: true,
              confirmButtonText: "确定",
              customClass: "message-box",
              showClose: false,
              confirmButtonClass: "zg-button small-button border-radius-5 ",
            });
            if (ret.code === 81001) {
              const user = createUserInfo();
              store.commit("setter", { key: "user", value: user });
            }
            quitRoom(false);
          });
      } else {
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
            createStream();
          } else {
            showEquipmentCheck.value = true;
          }
        } catch (error) {
          showEquipmentCheck.value = true;
        }
      }
    };

    // 创建摄像头和麦克风，准备推流
    const createStream = function () {
      if (routeParams.roomId === "100000") {
        // 主播端创建摄像头前需要关闭设备检测弹窗
        showEquipmentCheck.value = false;
      } else {
        streamIdList.value.push(store.state.user.uid.toString());
      }
    };

    const updateMic = function (mic: 1 | 2) {
      if (localStream.value) {
        if (mic === 1) {
          zg.mutePublishStreamAudio(localStream.value, true);
        } else if (mic === 2 && !store.state.cameraConfig.actualAudioMuted) {
          // 解除禁言的同时，麦克风必须开启才开始推音频流
          zg.mutePublishStreamAudio(localStream.value, false);
        }
      }
    };

    const handleCommand = function (command: string, streamId: string) {
      let mic = attendeeMap.value.get(streamId)?.mic as 1 | 2;
      if (command === "onMic") {
        mic = mic === 1 ? 2 : 1;
      }
      setStatus({
        uid: store.state.user.uid,
        room_id: store.state.room.room_id,
        nick_name: store.state.user.nick_name,
        target_uid: parseInt(streamId),
        type: command === "onMic" ? 1 : 3,
        mic,
      });
    };

    const quitRoom = function (broadcast = true, logout = true) {
      zg.off("IMRecvBroadcastMessage");
      zg.off("IMRecvCustomCommand");
      zg.off("roomStreamUpdate");
      if (store.state.room.room_id === "" || store.state.room.host_id === 0) {
        router.push({ path: "/" });
        return;
      }
      destroyStream(broadcast);
      if (logout) {
        logoutRoom(store.state.user.uid, store.state.room.room_id);
      }
      if (isAnchor.value) {
        closeRoom(store.state.user.uid, store.state.room.room_id);
      }
      router.push({ path: "/" });
    };

    const updateInviteList = function (type: string, value: number[]) {
      if (type === "add") {
        inviteList.value.push(...value);
      }
    };

    onCallBack();

    window.onbeforeunload = async function () {
      quitRoom(!isAnchor.value);
    };

    onBeforeMount(() => {
      loginRoomInit();
    });

    onBeforeUnmount(() => {
      keepLiving.stop();
      store.commit("setter", {
        key: "room",
        value: {
          room_id: "",
          subject: "",
          online: 0,
          cover_img: "",
          stream_id: "",
          host_id: 0,
          create_time: 0,
        },
      });
    });

    return {
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
      anthorVideo,
      inviteList,
      streamExtraInfo,
      updateInviteList,
      updateMedia,
      updateAttendee,
      handleCommand,
      destroyStream,
      applyForMicro,
      connectedAnthor,
      setLocalStream,
      publishStream,
      quitRoom,
      createStream,
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
  color: #e0dde3;
  min-width: 1000px;
  min-height: 600px;

  .live-room-header {
    display: flex;
    justify-content: space-between;
    background: #302045;
    border-radius: 4px;
    padding: 10px 24px;
    .room-title {
      padding-left: 10px;
      font-size: 18px;
      font-family: MicrosoftYaHei-Bold, MicrosoftYaHei;
      font-weight: bold;
      color: #ccc;
      vertical-align: middle;
    }
    .margin-right-10 {
      margin-right: 10px;
      width: 22px;
      height: 22px;
    }
    .start-anchor {
      display: inline-block;
      color: white;
      padding: 0px 19px;
      height: 30px;
      line-height: 30px;
    }
    .close-anchor {
      color: #ff4a50;
      display: inline-block;
      padding: 0px 19px;
      background: rgba(255, 74, 80, 0.2);
      height: 30px;
      line-height: 30px;
      &:hover {
        background: rgba(255, 102, 107, 0.2);
      }
      &:active {
        background: rgba(255, 74, 80, 0.1);
      }
    }
  }
  .room-operation {
    border-radius: 44px;
    font-size: 12px;
    line-height: 12px;
    cursor: pointer;
    text-align: center;
    svg {
      margin-right: 5px;
      width: 16px;
      height: 15px;
    }
  }

  .video-area {
    padding: 0;
    overflow: hidden;
    .interactive-box {
      padding: 0 8px;
      box-sizing: border-box;
      position: relative;
      height: 64px;
      background: #302045;
      width: calc(100% - 6px);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: left;
      .apply-for-micro {
        box-sizing: border-box;
        width: 90px;
        height: 32px;
        line-height: 32px;
        position: absolute;
        right: 24px;
      }
      .cancel-micro {
        box-sizing: border-box;
        width: 90px;
        height: 32px;
        line-height: 32px;
        position: absolute;
        right: 24px;
      }
      .operation {
        cursor: pointer;
        font-size: 12px;
        margin: 0 13px;
        text-align: center;
        &:hover {
          svg {
            color: #966cfa;
          }
          div {
            color: #9f76ff;
          }
        }
        svg {
          width: 30px;
          height: 30px;
          color: #aca5b4;
        }
        div {
          transform: scale(0.84);
          color: #82798f;
        }
      }
      .operation-diabled:hover {
        cursor: not-allowed;
        svg {
          color: #aca5b4;
        }
        div {
          color: #82798f;
        }
      }
    }
    .video-box {
      width: 100%;
      margin: 8px 0;
      height: calc(100% - 80px);
      display: flex;
      .anchor-box {
        flex: 1;
        height: 100%;
        position: relative;
        overflow: hidden;
        margin-right: 6px;
      }
      .audience-box {
        width: 21.4%;
        min-width: 164px;
        max-width: 300px;
        margin-left: 2px;
        background-color: #302045;
        border-radius: 4px;
        overflow-y: scroll;
      }
    }
  }
}
</style>
