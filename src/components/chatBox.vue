<template>
  <el-aside class="MI-box">
    <el-tabs v-model="activeName">
      <el-tab-pane class="chat-box" label="互动" name="MI">
        <div class="chat-message">
          <template v-for="message in messageList" :key="message.sendTime">
            <div v-if="message.updateType" class="whole-traffic">
              <span class="traffic-user">{{ message.userName }}</span>
              <span class="traffic-message">{{
                message.updateType === "ADD" ? " 加入直播间" : " 离开直播间"
              }}</span>
            </div>
            <div
              v-else
              class="whole-message"
              :style="{
                'text-align':
                  message?.fromUser.userID == $store.state.user.uid
                    ? 'right'
                    : 'left',
              }"
            >
              <p class="message-fromUser">
                <span
                  v-if="
                    message?.fromUser.userID == $store.state.room.creator_id &&
                    message?.fromUser.userID == $store.state.user.uid
                  "
                  class="anthor-tab"
                  >主播</span
                >
                {{ message?.fromUser.userName }}
                <span
                  v-if="
                    message?.fromUser.userID == $store.state.room.creator_id &&
                    message?.fromUser.userID != $store.state.user.uid
                  "
                  class="anthor-tab"
                  >主播</span
                >
              </p>
              <div class="message-content">{{ message.message }}</div>
            </div>
          </template>
        </div>
        <el-input
          class="chat-input"
          type="textarea"
          :rows="7"
          resize="none"
          :maxlength="30"
          placeholder="说点什么呢..."
          @focus="(event) => placeholder(event.target, '')"
          @blur="(event) => placeholder(event.target, '说点什么呢...')"
          v-model="chatArea"
        >
        </el-input>
        <span
          class="chat-enter"
          v-loading="messageSendLoading"
          @click="sendMessage"
        >
          <i :class="chatArea.length > 0 ? 'abled-btn' : 'disabled-btn'"></i>
        </span>
      </el-tab-pane>
      <el-tab-pane :label="`在线人数·${onlinePerson?.length}`" name="online">
        <div
          v-for="person in onlinePerson"
          :key="person.uid"
          class="online-item"
        >
          <div>
            <i
              class="avatar"
              :style="{
                'background-image': `url(${require('../assets/person/' +
                  person.nick_name?.picIndex() +
                  '-avatar@2x.png')}`,
              }"
            ></i>
            <span class="user-name">
              {{ person.nick_name }}
            </span>
          </div>
          <div>
            <template v-if="person.uid === $store.state.user.uid">
              我（自己）
            </template>
            <template v-else-if="person.role === 3"> 主播 </template>
            <span
              v-else-if="
                attendeeList.some((attendee) => attendee.uid === person.uid)
              "
              class="onstage"
            >
              连麦中...
            </span>
            <template v-else-if="isAnchor">
              <div
                v-if="inviteList.indexOf(person.uid) !== -1"
                class="inviting invite-btn"
              >
                已邀请
              </div>
              <div v-else class="invite invite-btn" @click="invite(person.uid)">
                邀请连麦
              </div>
            </template>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-aside>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  PropType,
  ref,
  toRefs,
  watch,
  watchEffect,
} from "vue";
import { useRoute } from "vue-router";
import {
  getAttendeeList,
  inviteOnstage,
  responseOnstageInvite,
} from "@/service/room";
import router from "@/router";
import { useStore } from "vuex";
import { MainStore } from "@/store/store";
import { zg } from "@/service/SDKServer";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity";
import { ElMessageBox, ElMessage } from "element-plus";

interface enterOrOutRoom {
  updateType: "ADD" | "DELETE";
  sendTime: number;
  userID: string;
  userName: string;
}

export default defineComponent({
  props: {
    isLogin: {
      type: Boolean,
    },
    audienceStreamId: {
      type: Object as PropType<Array<string>>,
      default: () => {
        return [] as Array<string>;
      },
    },
    tryingConnected: {
      type: Boolean,
      require: true,
    },
    attendeeList: {
      type: Object as PropType<Array<Attendee>>,
      require: true,
      default: () => {
        return [] as Array<Attendee>;
      },
    },
  },
  setup(props, rtx) {
    const { params: routeParams } = useRoute();
    const { isLogin, audienceStreamId, tryingConnected, attendeeList } =
      toRefs(props);
    const store = useStore<MainStore>();
    const chatArea = ref("");
    const messageSendLoading = ref(false);
    const activeName = ref("MI");
    const messageList = ref([
      {
        updateType: "ADD",
        sendTime: Date.now(),
        userID: store.state.user.uid.toString(),
        userName: "我",
      },
    ] as Array<ZegoBroadcastMessageInfo | enterOrOutRoom>);

    const onlinePerson = ref<Array<Attendee>>([]);
    const inviteList = ref<Array<number>>([]);
    const raiseHandList = ref<Array<number>>([]);

    const isAnchor = computed(() => {
      // 是否为主播本人
      return store.state.room?.creator_id === store.state.user?.uid;
    });

    const stopClearInviteList = watch(
      audienceStreamId.value,
      (streamIdList) => {
        if (isAnchor.value) {
          inviteList.value = inviteList.value.filter((item) => {
            return streamIdList.indexOf(item.toString()) === -1;
          });
        } else {
          stopClearInviteList();
        }
      },
      {
        deep: true,
      }
    );

    const invite = function (uid: number) {
      if (attendeeList.value.length < 3) {
        inviteOnstage(store.state.user.uid, routeParams.roomId as string, uid)
          .then(() => {
            inviteList.value.push(uid);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        ElMessage({
          customClass: "alert-box",
          message: "最多支持3名观众连麦",
        });
      }
    };

    const sendMessage = function () {
      if (chatArea.value.length > 0) {
        messageSendLoading.value = true;
        zg.sendBroadcastMessage(routeParams.roomId as string, chatArea.value)
          .then(({ errorCode }) => {
            if (errorCode === 0) {
              messageList.value.push({
                fromUser: {
                  userID: store.state.user.uid.toString(),
                  userName: store.state.user.nick_name,
                },
                message: chatArea.value,
                messageID: messageList.value.length,
                sendTime: Date.now(),
              });
              chatArea.value = "";
              chatBoxGotoBottom();
            }
          })
          .finally(() => {
            messageSendLoading.value = false;
          });
      }
    };

    const chatBoxGotoBottom = async function () {
      await nextTick();
      const dom = document.querySelector(".chat-message");
      dom?.scrollTo(0, Number.MAX_SAFE_INTEGER);
    };

    const placeholder = function (textArea: HTMLTextAreaElement, msg: string) {
      if (textArea) {
        textArea.placeholder = msg;
      }
    };

    const onCallBack = function () {
      zg.on("IMRecvBroadcastMessage", (roomID, messageInfoList) => {
        if (routeParams.roomId === roomID) {
          messageList.value.push(...messageInfoList);
          chatBoxGotoBottom();
        }
      });
      zg.on("roomExtraInfoUpdate", (roomID, roomExtraInfoList) => {
        if (routeParams.roomId === roomID) {
          let updateAttendee = false;
          roomExtraInfoList.forEach((item) => {
            try {
              const { cmd, data } = JSON.parse(item?.value);
              if (cmd === 6002) {
                onlinePerson.value.forEach((person) => {
                  data.users.forEach((user: Attendee) => {
                    if (user.uid === person.uid) {
                      person = user;
                    }
                    if (
                      !updateAttendee &&
                      attendeeList.value.some(
                        (attendee) => attendee.uid === user.uid
                      )
                    ) {
                      // 台上观众，同时需要更新attendee
                      updateAttendee = true;
                    }
                  });
                });
                if (data.operator_uid !== store.state.user.uid) {
                  // 若为本客户端发出的请求信息，则不处理
                  if (data.type === 1) {
                    if (isAnchor.value) {
                      // 主播端需要处理举手操作
                      data.users.forEach((user: Attendee) => {
                        if (user.raise_hand === 2) {
                          if (!raiseHandList.value.includes(user.uid)) {
                            // 不包含在举手列表中
                            raiseHandList.value.push(user.uid);
                          }
                          ElMessageBox.confirm(
                            `${user.nick_name} 申请与你连麦`,
                            "申请连麦",
                            {
                              customClass: "message-box",
                              confirmButtonText: "同意",
                              cancelButtonText: "拒绝",
                              center: true,
                              showClose: false,
                              cancelButtonClass:
                                "message-cancel-btn border-radius-5 ",
                              confirmButtonClass:
                                "zg-button small-button border-radius-5 ",
                            }
                          )
                            .then(() => {
                              if (raiseHandList.value.includes(user.uid)) {
                                invite(user.uid);
                              } else {
                                ElMessage({
                                  customClass: "alert-box",
                                  message: user.nick_name + `已取消连麦申请`,
                                });
                              }
                            })
                            .catch(() => {
                              if (raiseHandList.value.includes(user.uid)) {
                                zg.sendCustomCommand(
                                  routeParams.roomId as string,
                                  JSON.stringify({ cmd: 6004 }),
                                  [user.uid.toString()]
                                );
                              } else {
                                ElMessage({
                                  customClass: "alert-box",
                                  message: user.nick_name + `已取消连麦申请`,
                                });
                              }
                            });
                        } else if (user.raise_hand === 1 && user.role === 1) {
                          // 取消连麦
                          if (raiseHandList.value.includes(user.uid)) {
                            raiseHandList.value.splice(
                              raiseHandList.value.indexOf(user.uid),
                              1
                            );
                          }
                        }
                      });
                    } else if (
                      data.operator_uid.toString() ===
                      store.state.room.creator_id
                    ) {
                      data.users.forEach((user: Attendee) => {
                        if (user.uid === store.state.user.uid) {
                          if (user.onstage_state === 2) {
                            // 主播同意连麦
                            rtx.emit("connected", true);
                          }
                        }
                      });
                    }
                  }
                }
              } else if (cmd === 6006) {
                ElMessageBox.alert("直播间已经关闭！返回首页！", {
                  center: true,
                  showClose: false,
                  customClass: "message-box",
                  confirmButtonClass: "zg-button small-button border-radius-5 ",
                  confirmButtonText: "确定",
                }).finally(() => {
                  router.push({ path: "/" });
                });
              }
            } catch (error) {
              console.log(error);
            }
          });
          if (updateAttendee) {
            rtx.emit("updateAttendee");
          }
        }
      });
      zg.on("roomStreamUpdate", (roomID) => {
        if (routeParams.roomId === roomID) {
          getAttendeeList(
            routeParams.roomId as string,
            store.state.user.uid
          ).then((data) => {
            onlinePerson.value = data as Array<Attendee>;
          });
        }
      });

      let isInit = true;
      zg.on("roomUserUpdate", (roomID, updateType, userList) => {
        if (routeParams.roomId === roomID) {
          getAttendeeList(
            routeParams.roomId as string,
            store.state.user.uid
          ).then((data) => {
            onlinePerson.value = data as Array<Attendee>;
          });
          if (!isInit) {
            userList.forEach((user) => {
              messageList.value.push({
                updateType,
                sendTime: Date.now(),
                userID: user.userID,
                userName: user.userName as string,
              });
            });
          }
          chatBoxGotoBottom();
          isInit = false;
        }
      });
      zg.on("IMRecvCustomCommand", (roomID, fromUser, command) => {
        if (routeParams.roomId === roomID) {
          if (fromUser.userID === "system" && fromUser.userName === "system") {
            try {
              const { cmd, data } = JSON.parse(command);
              if (store.state.user.uid === data.target_uid) {
                if (cmd === 6004) {
                  if (tryingConnected.value) {
                    responseOnstageInvite(
                      data.target_uid,
                      roomID,
                      data.invite_token,
                      2,
                      audienceStreamId.value?.length
                    ).then((bool) => {
                      if (bool) {
                        rtx.emit("connected", true);
                      }
                    });
                  } else {
                    // 代表邀请上台
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
                      .then(() => {
                        responseOnstageInvite(
                          data.target_uid,
                          roomID,
                          data.invite_token,
                          2,
                          audienceStreamId.value?.length
                        ).then((bool) => {
                          if (bool) {
                            rtx.emit("connected", true);
                          }
                        });
                      })
                      .catch(() => {
                        responseOnstageInvite(
                          data.target_uid,
                          roomID,
                          data.invite_token,
                          1,
                          audienceStreamId.value?.length
                        );
                      });
                  }
                } else if (cmd === 6005) {
                  inviteList.value.splice(
                    inviteList.value.indexOf(data.uid),
                    1
                  );
                  ElMessage({
                    customClass: "alert-box",
                    message: `${data.nick_name} 已拒绝连麦邀请`,
                  });
                }
              }
            } catch (error) {
              console.log(error);
            }
          } else if (
            fromUser.userID === store.state.room.creator_id.toString()
          ) {
            // 主播私发请求
            try {
              const { cmd, data } = JSON.parse(command);
              if (cmd === 6004) {
                //主播拒绝连麦申请，放下举手
                rtx.emit("connected", false);
              } else if (cmd === 10000) {
                if (data.type === 2) {
                  // 下麦
                  ElMessage({
                    customClass: "alert-box",
                    message: "你已被主播抱下麦",
                  });
                  rtx.emit("destroyStream");
                } else if (data.type === 1) {
                  ElMessage({
                    customClass: "alert-box",
                    message:
                      data.mic === 1 ? "你已被主播禁言" : "你已被主播解除禁言",
                  });
                  rtx.emit("updateMic", data.mic);
                }
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      });
    };

    const stop = watchEffect(() => {
      if (isLogin.value) {
        getAttendeeList(routeParams.roomId as string, store.state.user.uid)
          .then((data) => {
            onlinePerson.value = data as Array<Attendee>;
          })
          .finally(() => {
            stop();
          });
      }
    });

    onCallBack();

    return {
      chatArea,
      activeName,
      messageList,
      onlinePerson,
      messageSendLoading,
      isAnchor,
      inviteList,
      invite,
      sendMessage,
      placeholder,
    };
  },
});
</script>

<style lang="less">
.MI-box {
  margin-top: 8px;
  margin-left: 8px;
  border-radius: 4px;
  width: 320px !important;
  box-sizing: border-box;
  background: #302045;
  .online-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 15px;
    align-items: center;
    font-size: 13px;
    .user-name {
      margin-left: 10px;
    }
    .onstage {
      color: #a653ff;
    }
    .invite-btn {
      border-radius: 45px;
      height: 30px;
      width: 80px;
      text-align: center;
      line-height: 30px;
    }
    .inviting {
      color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .invite {
      cursor: pointer;
      color: white;
      background: linear-gradient(126deg, #a754ff 0%, #510df1 100%);
    }
  }
  .el-tabs {
    height: calc(100% - 15px);
    .el-tabs__nav-wrap::after {
      height: 1px;
      bottom: 1px;
      background-color: #fff;
      opacity: 0.1;
    }
    .el-tabs__nav {
      width: 100%;
      .el-tabs__active-bar {
        background-color: #a653ff;
        height: 3px;
      }
      .el-tabs__item {
        text-align: center;
        color: #aca5b4;
        width: 50%;
      }
    }
    .el-tabs__content {
      height: calc(100% - 40px);
    }
    .chat-box {
      height: 100%;
      .chat-message {
        overflow-y: scroll;
        height: calc(100% - 160px);
        &::-webkit-scrollbar {
          background-color: #2b1e3b;
        }
        .whole-message {
          padding: 12px 16px;
          .anthor-tab {
            width: 28px;
            height: 14px;
            background: #6e5bff;
            border-radius: 2px;
            color: white;
            height: 15px;
            line-height: 15px;
            font-size: 10px;
            padding: 0 4px;
          }
          .message-fromUser {
            font-size: 12px;
            line-height: 14px;
            height: 14px;
            padding: 10px 0;
            color: #aca5b4;
          }
          .message-content {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 5px 12px;
            margin: 10px 0;
            font-size: 14px;
            line-height: 21px;
            display: inline-block;
          }
        }
        .whole-traffic {
          text-align: center;
          font-size: 14px;
          height: 14px;
          line-height: 14px;
          padding: 12px 0;
          .traffic-user {
            color: #8be7ff;
          }
          .traffic-message {
            color: #82798f;
          }
        }
      }
      .chat-input {
        .el-textarea__inner {
          background: #302045;
          border: 0px;
          border-top: 1px solid #1d142e;
          border-radius: 0;
          color: #e0dde3;
          &::placeholder {
            color: #82798f;
          }
        }
      }
    }
  }
  .chat-enter {
    width: 53px;
    height: 29px;
    cursor: pointer;
    position: absolute;
    right: 14px;
    bottom: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 44px;
    i {
      width: 33px;
      height: 29px;
      display: inline-block;
      padding: 0 10px;
    }
    i::before {
      content: " ";
    }
    .disabled-btn {
      background: url("../assets/mediaicon/disabled-chat-btn.svg") no-repeat
        center;
      cursor: not-allowed;
    }
    .abled-btn {
      background: url("../assets/mediaicon/abled-chat-btn.svg") no-repeat center;
    }
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
