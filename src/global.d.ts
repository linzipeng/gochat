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
    create_time: string;
    creator_name: string;
    creator_id: number;
    online_count: string;
    on_stage_count: string;
  };
  type User = {
    uid: number;
    nick_name: string;
    avatar?: string;
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
