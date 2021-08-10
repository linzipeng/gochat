interface ApiError {
  [key: string]: any;
  [index: number]: any;
}
export const apiError = {
  0: "成功",
  80000: "用户名已在使用中",
  80001: "错误的参数",
  80002: "系统错误",
  80003: "房间人已满",
  80004: "用户已经在房间内",
  80005: "上麦人数已到上限",
  80006: "已经上麦",
  80007: "获得房间码失败",
  80008: "清理房间失败",
  80009: "发送房间消息失败",
  80010: "用户无权进行更改",
  80011: "目标用户不在会议房间",
  80012: "用户不在线",
  80013: "已连麦",
  80014: "无效的 invite token",
  100000: "房间不存在",
  100001: "程序出错",
} as ApiError;