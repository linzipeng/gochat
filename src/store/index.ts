import { createStore } from "vuex";
import { MainStore } from "@/store/store";

const initState: MainStore = {
  user: {
    uid: 0,
    nick_name: "",
    avatar: "",
  },
  token: "",
  room: {
    room_id: "",
    subject: "",
    create_time: "",
    creator_name: "",
    creator_id: 0,
    online_count: "",
    on_stage_count: "",
  },
  cameraConfig: {
    videoInput: "",
    audioInput: "",
    video: true,
    audio: true,
    videoQuality: 2,
    volume: 50,
  },
  speakerDevice: {
    deviceID: "",
    deviceName: "",
    volume: 50,
  },
};

export default createStore<MainStore>({
  state: initState,
  mutations: {
    setter<T extends keyof MainStore>(
      state: MainStore,
      payload: { key: T; value: MainStore[T] }
    ) {
      state[payload.key] = payload.value;
    },
  },
  actions: {},
  modules: {},
});
