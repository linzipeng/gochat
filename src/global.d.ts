import { AxiosInstance } from "axios";
// 全局配置Axios
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

declare global {
  type Ret = {
    code:
      | 0
      | 80000
      | 80001
      | 80002
      | 80003
      | 80004
      | 80005
      | 80006
      | 80007
      | 80008
      | 80009
      | 80010
      | 80011
      | 80012
      | 80013
      | 80014
      | 100000
      | 100001;
    message?: string;
  };
  type RSP = {
    ret: Ret;
    data: any;
  };
  type Room = {
    room_id: string;
    subject: string;
    cover_img: string;
    online: number;
    stream_id: string;
    host_id: number;
    create_time: number;
  };
  type User = {
    uid: number;
    nick_name: string;
    avatar: string;
    role?: 1 | 3; // 1、观众  3、主持人
    login_timestamp?: number;
    mic?: 1 | 2; // 1：关闭  2:打开
    camera?: 1 | 2; // 1：关闭  2:打开
    onstage_state?: 1 | 2 | 3; // 1 未连麦 2 连麦 3 被邀请连麦
  };
  interface Attendee {
    room_id: string;
    uid: number;
    nick_name: string;
    avatar: string;
    role: number;
    login_timestamp: number;
    mic: number;
    raise_hand: 1 | 2; //1: 没举手， 2：已举手
    raise_hand_timestamp: number;
    onstage_state: 1 | 2; //1:不在台上  2：在台上
    onstage_timestamp: number;
  }
}
