<template>
  <el-container class="room-list">
    <el-header height="56px" class="room-list-header">
      <div>
        <img src="../assets/logo/logo.svg" />
        <span class="room-list-title"> 互动直播</span>
      </div>
      <div>
        <div class="icon-feedback"></div>
        <el-dropdown trigger="click" @command="handleCommand">
          <icon
            name="icon_about_normal"
            style="margin-right: 10px"
            :isButton="true"
          ></icon>
          <template v-slot:dropdown>
            <el-dropdown-menu class="about-menu about-positon">
              <el-dropdown-item command="userAgreement"
                >用户协议</el-dropdown-item
              >
              <el-dropdown-item command="privacyAgreement"
                >隐私协议</el-dropdown-item
              >
              <el-dropdown-item command="aboutUs">关于我们</el-dropdown-item>
              <el-dropdown-item divided
                >应用版本
                <span style="float: right">v1.0.0</span></el-dropdown-item
              >
              <el-dropdown-item
                >SDK版本
                <span style="float: right"
                  >v{{ getVersion() }}</span
                ></el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span class="one-line"></span>
        <span class="small-button zg-button" @click="gotoLiveRoom()"
          >我要开播</span
        >
      </div>
    </el-header>
    <el-main class="room-card-container">
      <template v-if="roomList?.length > 0">
        <div class="playing-tag">
          <icon name="icon_camrea"></icon>
          <i class="iconfont icon-litte-micro" />
          <span>正在直播</span>
        </div>
        <div class="room-cards">
          <div
            v-for="room in roomList"
            :key="room.room_id"
            @click="gotoLiveRoom(room)"
            class="room-card"
          >
            <div class="room-cover-container">
              <img
                class="room-cover"
                :src="
                  require(`../assets/person/${room.creator_name?.picIndex()}-cover@2x.png`)
                "
              />
            </div>
            <div class="room-message">
              <p class="subject">{{ room.subject }}</p>
              <div class="room-number">
                <div>
                  <icon name="icon_people"></icon>
                  <span>{{ room.online_count }}</span>
                </div>
                <div class="goto-look">去观看 ></div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="empty-room">暂无在线房间，快去创建直播间吧</div>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { MainStore } from "@/store/store";
import { defineComponent, watch, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { createRoom, getRoomList } from "@/service/room";
import { getVersion } from "@/service/SDKServer";
import icon from "@/components/icon.vue";

export default defineComponent({
  components: { icon },
  setup() {
    const store = useStore<MainStore>();
    const router = useRouter();

    let roomList = ref<Array<Room>>([]);

    // 跳转到直播界面
    const gotoLiveRoom = function (room?: Room) {
      if (store.state.user.uid) {
        if (store.state.token) {
          if (!room) {
            ElMessageBox.prompt("", "创建直播间", {
              showInput: true,
              customClass: "create-room-message",
              showCancelButton: false,
              confirmButtonClass: `zg-button small-button`,
              confirmButtonText: "创建直播",
              inputPlaceholder: "请输入直播间名称",
              inputValidator(value) {
                if (value.length > 15) {
                  value = value.slice(0, 15);
                }
                const btn = document.querySelector(
                  ".create-room-message .zg-button"
                ) as HTMLButtonElement;
                btn.style.opacity = value ? "1" : "0.5";
                return !!value;
              },
            }).then(({ value }) => {
              createRoom(store.state.user.uid, value).then((data) => {
                store.commit("setter", { key: "room", value: data });
                router.push({ path: `/liveRoom/${data.room_id}` });
              });
            });
          } else {
            store.commit("setter", { key: "room", value: room });
            router.push({ path: `/liveRoom/${room.room_id}` });
          }
        } else {
          ElMessage({
            customClass: "alert-box",
            message: "用户账号token异常！稍后重试！",
          });
        }
      } else {
        ElMessage({
          showClose: false,
          message: "用户尚未登录",
          customClass: "alert-box",
        });
      }
    };

    // 用户登录后执行操作
    const stopWatchLogin = watch(
      () => store.state.user.uid,
      async (uid) => {
        if (uid !== 0) {
          getRoomList(uid)
            .then((data) => {
              roomList.value = data.reverse();
            })
            .finally(() => {
              stopWatchLogin();
            });
        }
      },
      {
        immediate: true,
      }
    );

    const handleCommand = function (command: string) {
      let url = "";
      if (command === "userAgreement") {
        url = "https://www.zego.im/terms";
      } else if (command === "privacyAgreement") {
        url = "https://www.zego.im/privacy";
      } else if (command === "aboutUs") {
        url = "https://www.zego.im/team";
      }
      if (url) {
        window.open(url, "_blank");
      }
    };

    return { roomList, gotoLiveRoom, getVersion, handleCommand };
  },
});
</script>

<style lang="less">
.one-line {
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 14px;
}

.about-positon {
  width: 164px;
}

.about-menu {
  background: #2c253c !important;
  .el-dropdown-menu__item {
    font-size: 12px;
  }
  .el-dropdown-menu__item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e0dde3;
  }
  .el-dropdown-menu__item--divided {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    &:before {
      background: #2c253c !important;
    }
  }
}

.icon-feedback {
  width: 1.572em;
  height: 1.572em;
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
  vertical-align: middle;
  background: url("../assets/mediaicon/icon-feedback.svg") no-repeat;
  background-size: cover;
  &:hover {
    background: url("../assets/mediaicon/icon-feedback-hover.svg") no-repeat;
    background-size: cover;
  }
  &:active {
    background: url("../assets/mediaicon/icon-feedback-active.svg") no-repeat;
    background-size: cover;
  }
}

.create-room-message {
  width: 436px;
  height: 242px;
  background: #2c253c;
  box-shadow: 0px 6px 10px 0px rgba(0, 0, 0, 0.24);
  border-radius: 8px;
  border: none;
  .invalid > input {
    border-color: inherit !important;
    &:focus {
      border-color: inherit !important;
    }
  }
  .el-message-box__errormsg {
    display: none;
  }
  .el-input__inner {
    border: none;
    background-color: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
  }
  .el-message-box__header {
    height: 19px;
    border-bottom: 1px solid rgba(121, 120, 125, 0.19);
  }
  .el-message-box__title {
    color: #aca5b4;
    font-size: 14px;
  }
  .el-message-box__input {
    width: 308px;
    margin: auto;
  }
  .el-message-box__btns {
    text-align: center;
  }
  .zg-button {
    width: 160px;
    border-radius: 44px;
    height: 40px;
    margin-top: 10px;
    opacity: 0.5;
  }
}

.room-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: url("../assets/bg/bg.svg") no-repeat center;
  background-size: cover;
  line-height: 56px;
  color: white;
  .icon-object {
    margin-right: 10px;
    vertical-align: middle;
  }
  .room-list-header {
    display: flex;
    justify-content: space-between;
    padding: 0 24px;
    background: #251735;
    img {
      vertical-align: middle;
    }
    .room-list-title {
      font-size: 18px;
      vertical-align: middle;
    }
  }
  .room-card-container {
    width: 1200px;
    padding: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    .empty-room {
      text-align: center;
      width: 300px;
      height: 36px;
      line-height: 36px;
      position: absolute;
      margin: auto;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
    .room-cards {
      display: grid;
      grid-template-columns: 276px 276px 276px 276px;
      grid-template-rows: 260px;
      grid-gap: 27px;
      overflow-y: scroll;
      flex: 1;
      &::-webkit-scrollbar {
        display: none; /* Chrome Safari */
      }
    }
    align-self: center;
    .playing-tag {
      width: 100%;
      height: 90px;
      line-height: 90px;
      color: #e0dde3;
      font-size: 16px;
    }
    .room-card {
      height: 260px;
      border-radius: 8px;
      cursor: pointer;
      .room-cover-container {
        width: 100%;
        height: 160px;
        overflow: hidden;
        .room-cover {
          object-fit: cover;
          width: 100%;
          height: 100%;
          display: block;
          border-radius: 6px;
          background-size: cover;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          transition: all 0.5s;
          &:hover {
            transform: scale(1.4);
          }
        }
      }
      .room-message {
        width: 100%;
        height: 80px;
        background: url("../assets/bg/card-bg.svg") no-repeat center;
        background-size: cover;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        padding: 0 14px;
        box-sizing: border-box;
        .subject {
          font-size: 16px;
          color: #e0dde3;
          height: 40px;
          line-height: 40px;
        }
        .room-number {
          display: flex;
          justify-content: space-between;
          height: 40px;
          line-height: 40px;
          font-size: 12px;
          vertical-align: middle;
          .goto-look {
            width: 64px;
            height: 24px;
            margin: 7px 0;
            text-align: center;
            color: #9f76ff;
            border-radius: 14px;
            line-height: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
      }
    }
  }
}
</style>
