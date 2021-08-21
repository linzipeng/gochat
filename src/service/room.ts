import { api } from "@/api/api";
import { zg } from "@/service/SDKServer";
import keepLiving from "@/service/keepLiving";
import { ElMessage } from "element-plus";
import { getToken } from "./user";

// 创建房间
export const createRoom = function (
  user: User,
  subject = "默认房间名"
): Promise<{ user_info: User; room_info: Room }> {
  const tooltip = function (message?: string) {
    ElMessage({
      showClose: false,
      customClass: "alert-box",
      message: message || "创建失败，请重试",
    });
  };
  return new Promise((resolve, reject) => {
    api("createRoom", {
      subject,
      cover_img: user.avatar,
      nick_name: user.nick_name,
      avatar: user.avatar,
    })
      .then(({ ret, data }: RSP) => {
        if (ret && ret.code === 0) {
          const { user_info: userInfo, room_info: roomInfo } = data as {
            user_info: User;
            room_info: Room;
          };
          getToken(userInfo.uid)
            .then((token) => {
              // 第三步登录即构SDK
              zg.loginRoom(
                roomInfo.room_id,
                token,
                {
                  userID: userInfo.uid.toString(),
                  userName: userInfo.nick_name,
                },
                { userUpdate: true }
              )
                .then(() => {
                  // 第四步用户跟开发者的server心跳连接
                  keepLiving({ uid: userInfo.uid, roomId: roomInfo.room_id });
                  resolve(data);
                })
                .catch(() => {
                  closeRoom(userInfo.uid, roomInfo.room_id);
                  reject();
                });
            })
            .catch(() => {
              closeRoom(userInfo.uid, roomInfo.room_id);
              reject();
            });
        } else {
          tooltip();
          reject();
        }
      })
      .catch(() => {
        tooltip();
        reject();
      });
  });
};

// 关闭房间
export const closeRoom = function (uid: number, room_id: string): void {
  api("closeRoom", { uid, room_id }).then(({ ret }) => {
    if (ret?.code === 0) {
      console.log("房间关闭成功！");
    }
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

export const setStatus = function ({
  uid,
  room_id,
  nick_name,
  target_uid,
  mic,
  camera,
  type,
}: {
  uid: number;
  room_id: string;
  nick_name: string;
  target_uid: number;
  mic?: 1 | 2;
  camera?: 1 | 2;
  type: 1 | 2 | 3; // 1.mic操作  2. camera操作 3. 关闭连麦
}): Promise<void> {
  return new Promise((resolve, reject) => {
    api("setStatus", {
      uid,
      room_id,
      nick_name,
      target_uid,
      mic,
      camera,
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

export const onstageRequestAction = function (
  uid: number,
  nick_name: string,
  target_uid: number,
  room_id: string,
  action: 1 | 2 | 3 | 4 // 1.申请 2.取消申请 3. 接受申请 4. 拒绝申请
): Promise<void> {
  return new Promise((resolve, reject) => {
    api("onstageRequestAction", { uid, nick_name, room_id, target_uid, action })
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

export const onstageInviteAction = function (
  uid: number,
  room_id: string,
  target_uid: number,
  nick_name: string,
  action: 1 | 2 | 3 | 4, // 1.邀请 2.取消邀请 3. 接受邀请 4. 拒绝邀请
  extra?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    api("onstageInviteAction", {
      uid,
      room_id,
      target_uid,
      nick_name,
      action,
      extra,
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

// 拉取房间列表
export const getRoomList = function (
  count = 1000,
  direct = 1, //方向，0：从新到旧，1:从旧到新
  from = "1" // cursor，拉取起始点
): Promise<Room[]> {
  return new Promise((resolve, reject) => {
    api("roomList", { count, direct, from })
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
  uid: number,
  room_id: string
): Promise<Array<User>> {
  return new Promise((resolve) => {
    api("getAttendeeList", {
      room_id,
      uid,
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

// 设置主播流id
export const setRoomStream = function (
  uid: number,
  room_id: string,
  stream_id: string
): void {
  api("setRoomStream", { uid, room_id, stream_id }).then(({ ret }) => {
    if (ret.code === 0) {
      console.log("设置主播流id成功！");
    }
  });
};

// 登录房间
export const loginRoom = function (user: User, roomId: string): Promise<RSP> {
  return new Promise((resolve, reject) => {
    // 第一步开发者在自己的server记录登录者
    api("loginRoom", {
      room_id: roomId,
      nick_name: user.nick_name,
      avatar: user.avatar,
    })
      .then(({ ret, data }: RSP) => {
        if (ret?.code === 0) {
          const userInfo = data.user_info as User;
          // 第二步获取token
          getToken(userInfo.uid)
            .then((token) => {
              // 第三步登录即构SDK
              zg.loginRoom(
                roomId,
                token,
                {
                  userID: userInfo.uid.toString(),
                  userName: user.nick_name,
                },
                { userUpdate: true }
              )
                .then(() => {
                  // 第三步用户跟开发者的server心跳连接
                  keepLiving({ uid: userInfo.uid, roomId });
                  resolve({ ret, data });
                })
                .catch(() => {
                  logoutRoom(userInfo.uid, roomId);
                  reject({
                    ret: { code: 81000, message: "直播间已经关闭！返回首页！" },
                    data: null,
                  });
                });
            })
            .catch(() => {
              logoutRoom(userInfo.uid, roomId);
              reject({
                ret: { code: 81000, message: "获取token异常！返回首页！" },
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
      })
      .catch(() => {
        reject({
          ret: { code: 81000, message: "直播间已经关闭！返回首页！" },
          data: null,
        });
      });
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
      // 断开房间心跳
      keepLiving.stop();
    }
  });
};

// 检查摄像头权限
export const checkDevices = async function (
  { video, audio }: { video: boolean; audio: boolean } = {
    video: true,
    audio: true,
  }
) {
  let errMessage = "";
  try {
    // 先触发摄像头调用，调起授权，但先不预览
    const authStream = await zg.createStream({
      camera: { video, audio },
    });
    zg.destroyStream(authStream);
    const { cameras, microphones } = await zg.enumDevices();
    if (video && audio && cameras.length === 0 && microphones.length === 0) {
      errMessage = "未检查到可用摄像头和摄像头";
    } else if (video && cameras.length === 0) {
      errMessage = "未检查到可用摄像头";
    } else if (audio && microphones.length === 0) {
      errMessage = "未检查到可用麦克风";
    }
  } catch (error) {
    if (video && audio) {
      errMessage = "请先授权摄像头或麦克风权限";
    } else if (video) {
      errMessage = "请先授权摄像头权限";
    } else {
      errMessage = "请先授权麦克风权限";
    }
  }
  return errMessage;
};
