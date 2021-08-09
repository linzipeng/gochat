export interface apiType {
  label: string;
  url: string;
  method: string;
  params?: any;
  ignoreError?: boolean;
  data?: any;
}

export interface Api {
  [index: string]: apiType;
}

export const api: Api = {
  getToken: {
    label: "获取token",
    url: "/chat_room/misc/get_web_token",
    method: "post",
    data: {
      ttl: 10000000, // 过期时间
    },
  },
  login: {
    label: "登录",
    url: "/chat_room/login",
    method: "post",
  },
  logout: {
    label: "退出登录",
    url: "/chat_room/login",
    method: "post",
  },
  roomList: {
    label: "拉取房间列表",
    url: "/chat_room/get_room_list",
    method: "post",
  },
  createRoom: {
    label: "创建房间",
    url: "/chat_room/create_room",
    method: "post",
  },
  loginRoom: {
    label: "进入房间",
    url: "/chat_room/login_room",
    ignoreError: true,
    method: "post",
  },
  quitRoom: {
    label: "离开房间",
    url: "/chat_room/quit_room",
    method: "post",
  },
  closeRoom: {
    label: "关闭房间",
    url: "/chat_room/close_room",
    method: "post",
  },
  getAttendeeList: {
    label: "拉取成员列表",
    url: "/chat_room/get_attendee_list",
    method: "post",
  },
  getRaiseHandList: {
    label: "拉取举手列表",
    url: "/chat_room/get_raise_hand_list",
    method: "post",
  },
  getStatefulList: {
    label: "拉取台上用户列表",
    url: "/chat_room/get_stateful_list",
    method: "post",
  },
  operateRaiseHand: {
    label: "举手操作",
    url: "/chat_room/operate_raise_hand",
    method: "post",
  },
  setUserInfo: {
    label: "设置用户属性",
    url: "/chat_room/set_user_info",
    method: "post",
  },
  inviteOnstage: {
    label: "邀请上台",
    url: "/chat_room/invite_onstage",
    method: "post",
  },
  responseOnstageInvite: {
    label: "回应邀请",
    url: "/chat_room/response_onstage_invite",
    method: "post",
  },
  heartbeat: {
    label: "心跳",
    url: "/chat_room/heartbeat",
    method: "post",
  },
};
