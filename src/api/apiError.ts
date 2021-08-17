interface ApiError {
  [key: string]: string;
  [index: number]: string;
}
export const apiError = {
  0: "成功",
  80001: "错误的参数",
  80002: "房间不存在",
  80005: "上麦人数已到上限",
  80008: "关闭liveroom房间失败",
  80009: "发送liveroom消息失败",
  80010: "用户无权进行更改",
  80011: "用户不在线",
  80013: "已连麦",
  80017: "不在连麦",
  80018: "没有申请连麦",
  100000: "房间不存在",
  100001: "程序出错",
} as ApiError;
