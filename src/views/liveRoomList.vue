<template>
  <el-container class="room-list">
    <el-header height="56px" class="room-list-header">
      <div class="height-56">
        <img src="../assets/logo/logo.svg" />
        <span class="room-list-title"> 多人连麦直播</span>
      </div>
      <div class="height-56">
        <div
          class="icon-feedback"
          v-popover:feedback-popover
          @click="gotoLink()"
        ></div>
        <el-popover
          ref="feedback-popover"
          placement="bottom"
          popper-class="about-popover feedback-popover-position"
          trigger="hover"
          :show-arrow="false"
          :offset="12"
          content="意见反馈"
        >
        </el-popover>
        <el-popover
          ref="about-popover"
          placement="bottom"
          popper-class="about-popover about-popover-position"
          trigger="hover"
          :show-arrow="false"
          content="关于"
        >
        </el-popover>
        <el-dropdown trigger="click" @command="handleCommand">
          <icon
            name="icon_about_normal"
            class="about-icon"
            :isButton="true"
            v-popover:about-popover
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
              <el-dropdown-item divided class="nothing"
                >应用版本
                <span style="float: right; color: #82798f"
                  >v1.0.0</span
                ></el-dropdown-item
              >
              <el-dropdown-item class="nothing"
                >SDK版本
                <span style="float: right; color: #82798f"
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
      <template v-if="roomList?.length">
        <div class="playing-tag">
          <icon name="icon_camrea" class="playing-icon"></icon>
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
                  require(`../assets/person/${room.cover_img}-cover@2x.png`)
                "
              />
            </div>
            <div class="room-message">
              <p class="subject">{{ room.subject }}</p>
              <div class="room-number">
                <div>
                  <icon name="icon_people" class="room-person"></icon>
                  <span style="vertical-align: middle">{{ room.online }}</span>
                </div>
                <div class="goto-look">
                  去观看
                  <icon name="icon_into" style="width: 9px; height: 9px"></icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="empty-room">暂无在线房间，快去创建吧</div>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { MainStore } from "@/store/store";
import { defineComponent, ref, onBeforeUnmount, onBeforeMount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { getRoomList } from "@/service/room";
import { getVersion } from "@/service/SDKServer";
import icon from "@/components/icon.vue";

export default defineComponent({
  components: { icon },
  setup() {
    const store = useStore<MainStore>();
    const router = useRouter();
    let interval = 0;

    let roomList = ref<Array<Room>>([]);

    // 跳转到直播界面
    const gotoLiveRoom = function (room?: Room) {
      if (!store.state.browserIsSupport) {
        ElMessageBox({
          title: "浏览器不支持",
          message:
            "您当前的浏览器不符合直播间要求，为获得更好的直播体验，请安装最新版本的 Chrome 浏览器",
          center: true,
          showClose: false,
          closeOnClickModal: false,
          showCancelButton: true,
          showConfirmButton: true,
          customClass: "message-box",
          cancelButtonText: "我知道了",
          confirmButtonText: "去下载",
          cancelButtonClass: "message-cancel-btn border-radius-5 ",
          confirmButtonClass: "zg-button small-button border-radius-5 ",
        }).then(() => {
          window.open("https://oomake.com/download/chrome", "_blank");
        });
        return;
      }

      if (!room) {
        ElMessageBox.prompt("", "创建直播间", {
          showInput: true,
          customClass: "create-room-message",
          showCancelButton: false,
          confirmButtonClass: `zg-button small-button`,
          confirmButtonText: "创建直播",
          inputPlaceholder: "请输入直播间名称",
          inputValue: `${store.state.user.nick_name}创建的直播间`,
          inputValidator(value) {
            if (value.length > 15) {
              const input = document.querySelector(
                ".create-room-message .el-input input"
              ) as HTMLInputElement;
              input.value = value.substring(0, 15);
            }
            const btn = document.querySelector(
              ".create-room-message .zg-button"
            ) as HTMLButtonElement;
            if (value) {
              btn.className = btn.className.replace("disabled-zg-button", "");
            } else {
              btn.className = `${btn.className} disabled-zg-button`;
            }
            return !!value;
          },
        }).then(({ value }) => {
          router.push({
            name: "LiveRoom",
            params: {
              roomId: "100000",
              name: value.substring(0, 15),
            },
          });
        });
      } else {
        router.push({ path: `/liveRoom/${room.room_id}` });
      }
    };

    const clearInterval = function () {
      if (interval) {
        window.clearInterval(interval);
        interval = 0;
      }
    };

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

    const getBrowser = function () {
      let UserAgent: any = navigator.userAgent.toLowerCase();
      let browserInfo: any = {};
      let browserArray: any = {
        IE: window.ActiveXObject || "ActiveXObject" in window, // IE
        Chrome:
          UserAgent.indexOf("chrome") > -1 && UserAgent.indexOf("safari") > -1, // Chrome浏览器
        Firefox: UserAgent.indexOf("firefox") > -1, // 火狐浏览器
        Opera: UserAgent.indexOf("opera") > -1, // Opera浏览器
        Safari:
          UserAgent.indexOf("safari") > -1 && UserAgent.indexOf("chrome") == -1, // safari浏览器
        Edge: UserAgent.indexOf("edge") > -1, // Edge浏览器
        QQBrowser: /qqbrowser/.test(UserAgent), // qq浏览器
        WeixinBrowser: /MicroMessenger/i.test(UserAgent), // 微信浏览器
      };
      // console.log(browserArray)
      for (let i in browserArray) {
        if (browserArray[i]) {
          var versions = "";
          if (i == "IE") {
            versions = UserAgent.match(/(msie\s|trident.*rv:)([\w.]+)/)[2];
          } else if (i == "Chrome") {
            for (var mt in navigator.mimeTypes) {
              //检测是否是360浏览器(测试只有pc端的360才起作用)
              if (
                navigator.mimeTypes[mt]["type"] ==
                "application/360softmgrplugin"
              ) {
                i = "360";
              }
            }
            versions = UserAgent.match(/chrome\/([\d.]+)/)[1];
          } else if (i == "Firefox") {
            versions = UserAgent.match(/firefox\/([\d.]+)/)[1];
          } else if (i == "Opera") {
            versions = UserAgent.match(/opera\/([\d.]+)/)[1];
          } else if (i == "Safari") {
            versions = UserAgent.match(/version\/([\d.]+)/)[1];
          } else if (i == "Edge") {
            versions = UserAgent.match(/edge\/([\d.]+)/)[1];
          } else if (i == "QQBrowser") {
            versions = UserAgent.match(/qqbrowser\/([\d.]+)/)[1];
          }
          browserInfo.type = i;
          browserInfo.versions = parseInt(versions);
        }
      }
      return browserInfo;
    };

    const gotoLink = function () {
      const browser = getBrowser();
      window.open(
        `https://demo-operation.zego.im/feedback/goenjoy/index.html?platform=32&system_version=${
          browser.type
        }&app_version=${
          browser.versions
        }&sdk_version=${getVersion()}&client=${getVersion()}`,
        "_blank"
      );
    };

    onBeforeMount(() => {
      clearInterval();
      const updateRoomList = () => {
        getRoomList()
          .then((data) => {
            roomList.value = data;
          })
          .catch(() => {
            ElMessage({
              customClass: "alert-box alert-box-40",
              message: `网络异常，请检查网络后重试`,
            });
          });
      };
      updateRoomList();
      interval = window.setInterval(updateRoomList, 2000);
    });

    onBeforeUnmount(() => {
      sessionStorage.removeItem("checkFinish");
      clearInterval();
    });

    return { roomList, gotoLiveRoom, getVersion, handleCommand, gotoLink };
  },
});
</script>

<style lang="less">
.icon-feedback {
  width: 1.572em;
  height: 1.572em;
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
  font-size: 14px;
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

.about-icon {
  margin-right: 14px;
}

.create-room-message {
  width: 436px;
  height: 242px;
  background: #2c253c;
  box-shadow: 0px 6px 10px 0px rgba(0, 0, 0, 0.24);
  border-radius: 8px;
  border: none;
  box-sizing: border-box;
  .el-message-box__content {
    padding: 0;
  }
  input {
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
  .invalid > input {
    border-color: rgba(255, 255, 255, 0.1) !important;
    &:focus {
      border-color: rgba(255, 255, 255, 0.1) !important;
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
    color: #e0dde3;
    font-size: 16px;
    border-radius: 0px;
    &:focus {
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    &::placeholder {
      color: #82798f;
    }
  }
  .el-message-box__header {
    height: 18px;
    border-bottom: 1px solid rgba(121, 120, 125, 0.19);
    .el-message-box__close {
      color: rgba(255, 255, 255, 0.4);
      font-size: 18px;
      &:hover {
        color: #9f76ff !important;
      }
      &:active {
        color: white !important;
      }
    }
  }
  .el-message-box__title {
    color: #aca5b4;
    font-size: 14px;
  }
  .el-message-box__input {
    width: 308px;
    margin: auto;
    padding-top: 30px;
  }
  .el-message-box__btns {
    text-align: center;
    padding: 0;
  }
  .zg-button {
    width: 160px;
    border-radius: 44px;
    height: 40px;
    margin-top: 31px;
    font-size: 14px !important;
  }
}

.playing-icon {
  width: 18px;
  height: 17px;
  margin-right: 10px;
}

.room-person {
  width: 10px;
  height: 10px;
  margin-right: 4px;
}

.room-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 1280px;
  background: url("../assets/bg/bg.png") no-repeat center;
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
    .height-56 {
      height: 56px;
      line-height: 55px;
    }
    img {
      vertical-align: middle;
    }
    .room-list-title {
      font-size: 18px;
      vertical-align: middle;
    }
  }
  .room-card-container {
    width: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
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
      font-size: 18px;
      color: #aca5b4;
    }
    .room-cards {
      width: 1200px;
      display: grid;
      grid-template-columns: 276px 276px 276px 276px;
      grid-template-rows: 260px;
      grid-gap: 32px;
    }
    align-self: center;
    .playing-tag {
      width: 1200px;
      height: 90px;
      line-height: 90px;
      color: #e0dde3;
      font-size: 16px;
    }
    .room-card {
      height: 260px;
      cursor: pointer;
      .room-cover-container {
        width: 100%;
        height: 180px;
        overflow: hidden;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        .room-cover {
          object-fit: cover;
          width: 100%;
          height: 100%;
          display: block;
          background-size: cover;
          transition: all 0.5s;
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
          line-height: 56px;
        }
        .room-number {
          display: flex;
          justify-content: space-between;
          height: 40px;
          line-height: 30px;
          font-size: 12px;
          .goto-look {
            width: 64px;
            height: 24px;
            margin-bottom: 10px;
            text-align: center;
            color: #9f76ff;
            border-radius: 14px;
            line-height: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
      }

      &:hover {
        .room-cover {
          transform: scale(1.1);
        }
        .room-message {
          box-shadow: 0px 14px 24px -8px rgba(151, 0, 255, 0.3);
          transition: ease-in-out 250ms box-shadow;
        }
      }
    }
  }
}
</style>
