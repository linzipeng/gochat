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
              <div class="message-content">
                <icon
                  v-if="message.isloading"
                  name="icon_loading"
                  class="loading-icon"
                ></icon>
                <icon
                  v-else-if="message.isError"
                  name="con_fail"
                  class="error-icon"
                ></icon>
                {{ message.message }}
              </div>
            </div>
          </template>
        </div>
        <el-input
          class="chat-input"
          type="textarea"
          :rows="6"
          resize="none"
          :maxlength="30"
          placeholder="说点什么吧..."
          @keydown.enter="sendMessage"
          @focus="(event) => placeholder(event.target, '')"
          @blur="(event) => placeholder(event.target, '说点什么吧...')"
          v-model="chatArea"
        >
        </el-input>
        <span
          class="chat-enter"
          :class="{ disabled: chatArea.trim().length === 0 }"
          @click="sendMessage"
        >
          <icon name="icon_send"></icon>
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
              我
            </template>
            <span v-else-if="person.role === 3" class="anthor-tab"> 主播 </span>
            <span
              v-else-if="person.onstage_state === 2 && isAnchor"
              class="onstage"
            >
              已连麦
            </span>
            <template v-else-if="isAnchor">
              <div
                v-if="inviteList.indexOf(person.uid) !== -1"
                class="inviting invite-btn"
              >
                已邀请
              </div>
              <div
                v-else
                class="zg-button invite-btn"
                @click="invite(person.uid)"
              >
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
  ComponentInternalInstance,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  PropType,
  ref,
  toRefs,
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

interface MessageInfo extends ZegoBroadcastMessageInfo {
  isloading?: boolean;
  isError?: boolean;
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
    isAnchor: {
      type: Boolean,
    },
    isPlaying: {
      type: Boolean,
    },
  },
  setup(props, rtx) {
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const { audienceStreamId, isAnchor, isPlaying } = toRefs(props);
    const store = useStore<MainStore>();
    const chatArea = ref("");
    const activeName = ref("MI");
    const messageList = ref([
      {
        updateType: "ADD",
        sendTime: Date.now(),
        userID: store.state.user.uid.toString(),
        userName: "我",
      },
    ] as Array<MessageInfo | enterOrOutRoom>);

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
      if (chatArea.value.trim().length > 0) {
        const message: MessageInfo = {
          fromUser: {
            userID: store.state.user.uid.toString(),
            userName: store.state.user.nick_name,
          },
          isloading: isPlaying.value,
          isError: false,
          message: chatArea.value,
          messageID: messageList.value.length,
          sendTime: Date.now(),
        };
        messageList.value.push(message);
        chatArea.value = "";
        chatBoxGotoBottom();
        if (isPlaying.value) {
          zg.sendBroadcastMessage(
            store.state.room.room_id,
            JSON.stringify({ cmd: 10001, message: chatArea.value })
          )
            .then(({ errorCode }) => {
              if (errorCode !== 0) {
                message.isError = true;
              }
            })
            .catch(() => {
              message.isError = true;
            })
            .finally(() => {
              message.isloading = false;
              if (proxy) {
                proxy.$forceUpdate();
              }
            });
        }
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
  margin-left: 2px;
  border-radius: 4px;
  width: 320px !important;
  box-sizing: border-box;
  background: #302045;
  .anthor-tab {
    width: 28px;
    height: 14px;
    background: #9F76FF;
    border-radius: 2px;
    line-height: 14px;
    font-size: 10px;
    padding: 0 4px;
    color: #E0DDE3;
  }
  .online-item {
    display: flex;
    justify-content: space-between;
    padding: 14px 16px;
    align-items: center;
    font-size: 12px;
    .user-name {
      margin-left: 16px;
      font-size: 14px;
    }
    .onstage {
      color: #a653ff;
    }
    .invite-btn {
      border-radius: 15px;
      height: 26px;
      width: 70px;
      text-align: center;
      line-height: 26px;
      box-sizing: border-box;
      font-size: 12px;
    }
    .inviting {
      color: #82798F;
      border: 1px solid #82798F;
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
      height: 56px;
      line-height: 56px;
      .el-tabs__active-bar {
        background-color: #9F76FF;
        height: 3px;
      }
      .el-tabs__item {
        text-align: center;
        color: #aca5b4;
        width: 50%;
        font-size: 16px;
        &:nth-child(2) {
          padding: 0 60px !important;
        }
        &:nth-child(3) {
          padding: 0 35px !important;
        }
      }
    }
    .el-tabs__content {
      height: calc(100% - 56px);
      #pane-online {
        overflow-y: scroll;
        height: 100%;
        &::-webkit-scrollbar {
          background-color: #302045;
        }
      }
    }
    .chat-box {
      height: 100%;
      .chat-message {
        overflow-y: scroll;
        height: calc(100% - 160px);
        &::-webkit-scrollbar {
          background-color: #302045;
        }
        .whole-message {
          padding: 12px 16px;
          .message-fromUser {
            font-size: 12px;
            line-height: 14px;
            height: 14px;
            color: #aca5b4;
          }
          .message-content {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 10px 12px;
            margin-top: 10px;
            font-size: 14px;
            line-height: 21px;
            display: inline-block;
            max-width: 266px;
            box-sizing: border-box;
            position: relative;
            .loading-icon {
              @keyframes loading {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(-360deg);
                }
              }
              transform-origin: center center;
              animation: loading 1s infinite linear;
              width: 15px;
              height: 15px;
              position: absolute;
              left: -20px;
              margin-top: 3px;
            }
            .error-icon {
              width: 15px;
              height: 15px;
              position: absolute;
              left: -20px;
              margin-top: 3px;
            }
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
    cursor: not-allowed;
    position: absolute;
    right: 14px;
    bottom: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 44px;
    svg {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      color: #8d8d8d;
      width: 15px;
      height: 15px;
    }
    &:not(.disabled) {
      cursor: pointer;
      svg {
        color: #dcd8df;
      }
    }
    &:not(.disabled):hover {
      svg {
        color: #8d8d8d;
      }
    }
  }
}
</style>
