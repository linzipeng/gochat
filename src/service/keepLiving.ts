import { api } from "@/api/api";
import { ElMessage, ElMessageBox } from "element-plus";
import router from "@/router";

interface livingParams {
  uid: number;
  roomId?: string | null;
  wait?: number;
  immediate?: boolean;
  maxSecond?: number;
}

const livingCheck = function ({
  uid,
  roomId = "",
  wait = 10 * 1000,
  immediate = true,
  maxSecond = 6,
}: livingParams): number {
  let failureTimes = 0;

  const request = function () {
    return new Promise<void>((resolve, reject) => {
      api("heartbeat", { uid, room_id: roomId })
        .then(({ ret }: RSP) => {
          if (ret?.code === 0) {
            failureTimes = 0;
            resolve();
          }
        })
        .catch(() => {
          ++failureTimes;
          reject();
        });
    });
  };

  if (immediate) {
    request();
  }

  const handler = setInterval(() => {
    request().catch(() => {
      if (failureTimes === maxSecond) {
        ElMessageBox.confirm("网络连接失败，请检查网络后重试", "网络异常", {
          confirmButtonText: "重试",
          cancelButtonText: "退出",
          customClass: "message-box",
          confirmButtonClass: "zg-button small-button border-radius-5 ",
          cancelButtonClass: "message-cancel-btn border-radius-5 ",
          center: true,
          showClose: false,
        })
          .then(() => {
            router.go(0);
          })
          .catch(() => {
            router.push({ path: "/" });
          });
      } else if (failureTimes < maxSecond) {
        ElMessage({
          customClass: "alert-box",
          message: `网络异常，请检查网络后重试`,
        });
      }
    });
  }, wait);
  return handler as unknown as number;
};

const livingHandler = function () {
  let innerHandler: number;
  const innerFunc = function ({
    uid,
    roomId = null,
    wait = 10 * 1000,
    immediate = true,
    maxSecond = 6,
  }: livingParams) {
    innerFunc.stop();
    innerHandler = livingCheck({
      uid,
      roomId,
      wait,
      immediate,
      maxSecond,
    });
  };
  innerFunc.stop = function () {
    if (innerHandler) {
      clearInterval(innerHandler);
      innerHandler = 0;
    }
  };
  return innerFunc;
};
const keepLiving = livingHandler();
export default keepLiving;
