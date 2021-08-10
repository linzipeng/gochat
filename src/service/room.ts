import { api } from "@/api/api";
import { zg } from "@/service/SDKServer";
import keepLiving from "@/service/keepLiving";
import { ElMessage } from "element-plus";

// 创建房间
export const createRoom = function (
  uid: number,
  subject = "默认房间名"
): Promise<Room> {
  return new Promise((resolve, reject) => {
    api("createRoom", { uid, subject })
      .then(({ ret, data }: RSP) => {
        if (ret && ret.code === 0) {
          console.log("创建房间成功！", data);
          resolve(data);
        } else {
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const responseOnstageInvite = function (
  uid: number,
  room_id: string,
  invite_token: string,
  respond: 1 | 2,
  audienceLen: number
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let innerRespond = respond;
    if (respond === 2 && audienceLen >= 3) {
      // 同意
      innerRespond = 1;
      ElMessage({
        customClass: "alert-box",
        message: "最多支持3名观众连麦",
      });
    }
    api("responseOnstageInvite", {
      uid,
      room_id,
      invite_token,
      respond: innerRespond,
    })
      .then(({ ret }) => {
        if (ret.code === 0) {
          // 判断是否等于代表 本地是否开启摄像头并推流
          resolve(innerRespond === 2);
        } else {
          reject(innerRespond === 2);
        }
      })
      .catch(() => {
        reject(innerRespond === 2);
      });
  });
};

export const getStatefulList = function (
  uid: number,
  room_id: string
): Promise<Array<Attendee>> {
  return new Promise((resolve) => {
    api("getStatefulList", { uid, room_id })
      .then(({ ret, data }) => {
        if (ret.code === 0) {
          // 去重
          const list = data.attendee_list.filter(
            (item: Attendee, index: number, arr: Array<Attendee>) => {
              return arr.indexOf(item, 0) === index;
            }
          );
          resolve(list);
        } else {
          resolve([]);
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};

interface userInfo {
  uid: number;
  room_id: string;
  target_uid: number;
  mic?: 1 | 2;
  on_stage?: 1 | 2;
  type: 1 | 2 | 3;
}

export const setUserInfo = function ({
  uid,
  room_id,
  target_uid,
  mic,
  on_stage,
  type,
}: userInfo): Promise<void> {
  return new Promise((resolve, reject) => {
    api("setUserInfo", {
      uid,
      room_id,
      target_uid,
      mic,
      on_stage,
      type,
    })
      .then(({ ret }) => {
        if (ret.code === 0) {
          resolve();
        } else {
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const operateRaiseHand = function (
  uid: number,
  room_id: string,
  type: 1 | 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    api("operateRaiseHand", { uid, room_id, type })
      .then(({ ret }) => {
        if (ret.code === 0) {
          resolve();
        } else {
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const inviteOnstage = function (
  uid: number,
  room_id: string,
  target_uid: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    api("inviteOnstage", { uid, room_id, target_uid })
      .then(({ ret }) => {
        if (ret.code === 0) {
          resolve();
        } else {
          reject(ret.message);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// 拉取房间列表
export const getRoomList = function (
  uid: number,
  count = 1000
): Promise<Room[]> {
  return new Promise((resolve, reject) => {
    api("roomList", { uid, count })
      .then(({ ret, data }: RSP) => {
        if (ret?.code === 0) {
          resolve(data.room_list);
        } else {
          reject([]);
        }
      })
      .catch(() => {
        reject([]);
      });
  });
};

// 拉取成员列表
export const getAttendeeList = function (
  room_id: string,
  uid: number,
  page = 1,
  page_size = 1000
): Promise<Array<Attendee>> {
  return new Promise((resolve) => {
    api("getAttendeeList", {
      room_id,
      uid,
      page,
      page_size,
    }).then(({ ret, data }) => {
      if (ret?.code === 0) {
        // 排序：主播-自己-台上观众-台下观众
        data?.attendee_list?.sort(
          (
            a: {
              role: number;
              uid: number;
              onstage_state: number;
              onstage_timestamp: number;
            },
            b: {
              role: number;
              uid: number;
              onstage_state: number;
              onstage_timestamp: number;
            }
          ) => {
            if (a.role === 3) {
              return -Infinity;
            }
            if (b.role === 3) {
              return Infinity;
            }
            if (a.uid === uid) {
              return -1000;
            }
            if (b.uid === uid) {
              return 1000;
            }
            if (a.onstage_state === b.onstage_state) {
              return a.onstage_timestamp - b.onstage_timestamp;
            } else {
              return b.onstage_state - a.onstage_state;
            }
          }
        );
        resolve(data.attendee_list);
      }
    });
  });
};

// 登录房间
export const loginRoom = function (
  user: User,
  roomId: string,
  token: string
): Promise<RSP> {
  return new Promise((resolve, reject) => {
    // 第一步开发者在自己的server记录登录者
    api("loginRoom", { uid: user.uid, room_id: roomId }).then(
      ({ ret, data }: RSP) => {
        if (ret?.code === 0 || ret?.code === 80004) {
          // 第二步登录即构SDK
          zg.loginRoom(
            roomId,
            token,
            {
              userID: user?.uid?.toString(),
              userName: user.nick_name,
            },
            { userUpdate: true }
          )
            .then(() => {
              // 第三步用户跟开发者的server心跳连接
              keepLiving({ uid: user.uid, roomId });
              resolve({ ret, data });
            })
            .catch(() => {
              reject({
                ret: { code: 81000, message: "直播间已经关闭！返回首页！" },
                data: null,
              });
            });
        } else if (ret?.code === 80002) {
          reject({
            ret: { code: 81000, message: "直播间已经关闭！返回首页！" },
            data: null,
          });
        } else {
          reject({
            ret: {
              code: 81001,
              message: "随机用户已经过期！已为你重新注册",
            },
            data: null,
          });
        }
      }
    );
  });
};

// 退出房间
export const logoutRoom = async function (
  uid: number,
  room_id: string
): Promise<void> {
  zg.logoutRoom();
  await api("quitRoom", { uid, room_id }).then(({ ret }: RSP) => {
    if (ret?.code === 0) {
      sessionStorage.removeItem("room");
      // 断开房间心跳
      keepLiving({ uid: uid });
    }
  });
};
