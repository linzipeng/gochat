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
    url: "/live_show/misc/get_web_token",
    method: "post",
    data: {
      ttl: 10000000, // 过期时间
    },
  },
  roomList: {
    label: "拉取房间列表",
    url: "/live_show/get_room_list",
    method: "post",
  },
  createRoom: {
    label: "创建房间",
    url: "/live_show/create_room",
    method: "post",
  },
  loginRoom: {
    label: "进入房间",
    url: "/live_show/login_room",
    ignoreError: true,
    method: "post",
  },
  getStatefulList: {
    label: "拉取连麦人员列表",
    url: "/live_show/get_stateful_list",
    method: "post",
  },
  getOnlineInfo: {
    label: "获取房间在线人数信息",
    url: "/live_show/get_online_info",
    method: "post",
  },
  quitRoom: {
    label: "离开房间",
    url: "/live_show/quit_room",
    method: "post",
  },
  closeRoom: {
    label: "关闭房间",
    url: "/live_show/close_room",
    method: "post",
  },
  setStatus: {
    label: "设置状态",
    url: "/live_show/set_status",
    method: "post",
  },
  heartbeat: {
    label: "心跳",
    url: "/live_show/heartbeat",
    method: "post",
  },
  onstageRequestAction: {
    label: "连麦申请/取消/接受/拒绝",
    url: "/live_show/onstage_request_action",
    method: "post",
  },
  getOnstageReqList: {
    label: "获取连麦申请列表",
    url: "/live_show/get_onstage_req_list",
    method: "post",
  },
  setRoomStream: {
    label: "设置主播流id",
    url: "/live_show/set_room_stream",
    method: "post",
  },
  switchRoom: {
    label: "切换房间",
    url: "/live_show/switch_room",
    method: "post",
  },
  onstageInviteAction: {
    label: "连麦邀请/取消/接受/拒绝",
    url: "/live_show/onstage_invite_action",
    method: "post",
  },
  getAttendeeList: {
    label: "获取成员列表",
    url: "/live_show/get_attendee_list",
    method: "post",
  },
};
