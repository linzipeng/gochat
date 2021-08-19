import { createStore } from "vuex";
import { MainStore } from "@/store/store";

const initState: MainStore = {
  user: {
    uid: 0,
    nick_name: "",
    avatar: "",
    role: 1,
    login_timestamp: 0,
    mic: 1,
    camera: 1,
    onstage_state: 1,
  },
  room: {
    room_id: "",
    subject: "",
    online: 0,
    cover_img: "",
    stream_id: "",
    host_id: 0,
    create_time: 0,
  },
  cameraConfig: {
    videoInput: "",
    audioInput: "",
    video: true,
    audio: true,
    videoQuality: 2,
    actualAudioMuted: false,
    actualVideoMuted: false,
    videoErrorMessage: "",
    audioErrorMessage: "",
    volume: 50,
  },
  speakerDevice: {
    deviceID: "",
    deviceName: "",
    volume: 50,
    speaker: true,
    speakerErrorMessage: "",
  },
  mixingAudio: {
    src: "",
    title: "",
    id: "",
    volume: 50,
  },
  browserIsSupport: true,
};

export default createStore<MainStore>({
  state: initState,
  mutations: {
    setter<T extends keyof MainStore, N extends keyof MainStore[T]>(
      state: MainStore,
      payload: { key: T; innerKey: N; value: MainStore[T] | MainStore[T][N] }
    ) {
      if (payload.innerKey) {
        state[payload.key][payload.innerKey] = payload.value as MainStore[T][N];
      } else {
        state[payload.key] = payload.value as MainStore[T];
      }
    },
  },
  actions: {},
  modules: {},
});
