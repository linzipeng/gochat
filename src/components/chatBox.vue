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
                    message?.fromUser.userID == $store.state.room.host_id &&
                    message?.fromUser.userID == $store.state.user.uid
                  "
                  class="anthor-tab"
                  >主播</span
                >
                {{ message?.fromUser.userName }}
                <span
                  v-if="
                    message?.fromUser.userID == $store.state.room.host_id &&
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
          :rows="6"
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
      <el-tab-pane :label="`在线人数·${attendeeList?.length}`" name="online">
        <div
          v-for="person in attendeeList"
          :key="person.uid"
          class="online-item"
        >
          <div>
            <i
              class="avatar"
              :style="{
                'background-image': `url(${require('../assets/person/' +
                  person.avatar +
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
              v-else-if="person.onstage_state === 2 && isAnchor"
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
  onBeforeUnmount,
  PropType,
  ref,
  toRefs,
  watch,
} from "vue";
import { onstageInviteAction } from "@/service/room";
import { useStore } from "vuex";
import { MainStore } from "@/store/store";
import { zg } from "@/service/SDKServer";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity";
import { ElMessage } from "element-plus";

interface enterOrOutRoom {
  updateType: "ADD" | "DELETE";
  sendTime: number;
  userID: string;
  userName: string;
}

export default defineComponent({
  props: {
    audienceStreamId: {
      type: Object as PropType<Array<string>>,
      default: () => {
        return [] as Array<string>;
      },
    },
    attendeeList: {
      type: Object as PropType<Array<Attendee>>,
      require: true,
      default: () => {
        return [] as Array<Attendee>;
      },
    },
    inviteList: {
      type: Object as PropType<Array<number>>,
    },
  },
  setup(props, rtx) {
    const { audienceStreamId } = toRefs(props);
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

    const isAnchor = computed(() => {
      // 是否为主播本人
      return store.state.room?.host_id === store.state.user?.uid;
    });

    const invite = function (uid: number) {
      if (audienceStreamId.value.length < 3) {
        onstageInviteAction(
          store.state.user.uid,
          store.state.room.room_id,
          uid,
          store.state.user.nick_name,
          1,
        )
          .then(() => {
            rtx.emit("updateInviteList", "add", [uid]);
          })
          .catch((err) => {
            ElMessage({
              customClass: "alert-box",
              message: err,
            });
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
        zg.sendBroadcastMessage(
          store.state.room.room_id,
          JSON.stringify({ cmd: 10001, message: chatArea.value })
        )
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
        if (store.state.room.room_id === roomID) {
          messageInfoList.forEach((messageInfo) => {
            if (messageInfo.fromUser.userID !== "system") {
              try {
                const { cmd, message } = JSON.parse(messageInfo.message);
                if (cmd === 10001) {
                  const mess = JSON.parse(JSON.stringify(messageInfo));
                  mess.message = message;
                  messageList.value.push(mess);
                }
              } catch (error) {
                console.log(error);
              }
            }
          });
          chatBoxGotoBottom();
        }
      });

      let isInit = true;
      zg.on("roomUserUpdate", (roomID, updateType, userList) => {
        if (store.state.room.room_id === roomID) {
          if (isAnchor.value || !isInit) {
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
    };

    onCallBack();

    onBeforeUnmount(() => {
      zg.off("IMRecvBroadcastMessage");
      zg.off("roomUserUpdate");
    });

    return {
      chatArea,
      activeName,
      messageList,
      messageSendLoading,
      isAnchor,
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
      #pane-online {
        overflow-y: scroll;
        height: 100%;
        &::-webkit-scrollbar {
          background-color: #2d1e3b;
        }
      }
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
            color: #aca5b4;
          }
          .message-content {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 5px 12px;
            margin-top: 10px;
            font-size: 14px;
            line-height: 21px;
            display: inline-block;
            max-width: 266px;
            box-sizing: border-box;
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
          font-family: MicrosoftYaHei;
          background: #302045;
          border: 0px;
          border-top: 1px solid #1d142e;
          border-radius: 0;
          color: #e0dde3;
          padding: 14px;
          box-sizing: border-box;
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
