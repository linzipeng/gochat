<template>
  <div id="nav">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { MainStore } from "./store/store";
import keepLiving from "@/service/keepLiving";
import { createUserInfo } from "@/service/user";
import { checkSystemRequirements } from "@/service/SDKServer";
import { ElMessageBox } from "element-plus";

export default defineComponent({
  setup() {
    const store = useStore<MainStore>();
    checkSystemRequirements().then((result) => {
      if (!result) {
        store.commit("setter", { key: "browserIsSupport", value: false });
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
      }
    });

    onBeforeMount(() => {
      const user = createUserInfo();
      store.commit("setter", { key: "user", value: user });
    });

    onBeforeUnmount(() => {
      keepLiving.stop();
    });
  },
});
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  width: 100%;
  user-select: none;
}

::-webkit-scrollbar {
  background-color: #1d142e;
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-corner {
  background-color: #1d142e;
}

::-webkit-scrollbar-thumb {
  background-color: #82798f;
  border-radius: 5px;
}

#app,
#nav {
  width: 100%;
  height: 100%;
}

.avatar {
  display: inline-block;
  background-size: 100%;
  width: 36px;
  height: 36px;
  border-radius: 83px;
  vertical-align: middle;
  overflow: hidden;
  background-color: #556080;
}

.medium-button {
  height: 40px;
  line-height: 40px;
}

.small-button {
  font-size: 12px !important;
  padding: 6px 19px !important;
}

.disabled-zg-button {
  cursor: not-allowed;
  background: linear-gradient(
    126deg,
    rgba(167, 84, 255, 1) 0%,
    rgba(81, 13, 241, 1) 100%
  ) !important;
  border-radius: 44px;
  cursor: not-allowed !important;
  opacity: 0.5;
}

.zg-button {
  cursor: pointer;
  border: none !important;
  background: linear-gradient(
    126deg,
    rgba(167, 84, 255, 1) 0%,
    rgba(81, 13, 241, 1) 100%
  ) !important;
  &:not(.disabled-zg-button):hover {
    opacity: 0.8;
  }
  border-radius: 44px;
}

.el-popper {
  border: 1px solid #2c253c !important;
  background: #2c253c !important;
  .el-popper__arrow::before {
    background: #2c253c !important;
    border: 1px solid #2c253c !important;
  }
}

.el-select__popper {
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3) !important;
  border-radius: 4px;
  .el-select-dropdown__item {
    padding: 0 10px;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    border-radius: 4px;
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    &.selected {
      color: #9f76ff;
    }
  }
}

.disable-select {
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 28px;
  line-height: 28px;
  background-color: #2c253c;
  padding-right: 30px;
  border-radius: 4px;
  box-sizing: border-box;
  outline: 0;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  text-align: left;
  .icon {
    font-size: 10px;
  }
}

.about-menu {
  background: #2c253c !important;
  .el-dropdown-menu__item {
    font-size: 12px;
    color: #e0dde3;
    margin: 0 6px;
    padding: 0 14px;
    border-radius: 4px;
  }
  .el-dropdown-menu__item:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
    color: #e0dde3 !important;
  }
  .el-dropdown-menu__item--divided {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    &:before {
      background: #2c253c !important;
    }
  }
  .nothing:hover {
    background-color: inherit !important;
  }
}

.about-positon {
  width: 164px;
}

.about-popover {
  position: fixed !important;
  box-sizing: border-box !important;
  padding: 4px 6px !important;
  font-size: 10px !important;
  vertical-align: middle;
  background: #362f46 !important;
  color: #e0dde3 !important;
  line-height: 1.0 !important;
}

.about-popover-position {
  top: 53px;
  right: 128px;
  min-width: 38px !important;
  width: 38px !important;
  height: 22px !important;
}

.feedback-popover-position {
  min-width: 62px !important;
  width: 62px !important;
  height: 22px !important;
}

.el-select {
  width: 253px;
  margin-top: 6px;
  margin-bottom: 12px;
  .el-input {
    font-size: 12px;
    line-height: 28px;
    &.is-focus .el-input__inner {
      border-color: rgba(166, 83, 255, 0.5) !important;
    }
    .el-input__inner {
      height: 28px;
      line-height: 28px;
      background-color: #2c253c;
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:focus {
        border-color: rgba(166, 83, 255, 0.5);
      }
    }
    .el-select__caret {
      line-height: 28px;
    }
  }
}

.message-box {
  background: #2c253c !important;
  border: 1px solid #2c253c !important;
  box-shadow: 0px 6px 10px 0px rgba(0, 0, 0, 0.3) !important;
  width: auto !important;
  padding: 32px;
  .el-message-box__title {
    color: #e0dde3;
    font-size: 16px;
    font-weight: bold;
  }
  .el-message-box__header {
    padding-top: 0 !important;
  }
  .el-message-box__message {
    color: #e0dde3;
  }
  .message-cancel-btn {
    border: none !important;
    background: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0px 6px 10px 0px rgba(0, 0, 0, 0.3) !important;
    color: #e0dde3;
    &:hover {
      opacity: 0.8;
      color: #e0dde3;
    }
  }
  .border-radius-5 {
    border-radius: 5px !important;
  }
}

.alert-box {
  min-width: auto !important;
  height: 32px;
  line-height: 32px;
  background-color: rgba(44, 37, 60, 0.8) !important;
  color: #e0dde3 !important;
  font-size: 12px !important;
  border: none !important;
  top: 50% !important;
  .el-message__icon {
    display: none;
  }
}
</style>
