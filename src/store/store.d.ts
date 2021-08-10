import {
  ZegoDeviceInfo,
  ZegoCamera,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";

interface CameraConfig extends ZegoCamera {
  volume: number;
  actualVideoMuted?: boolean;
  actualAudioMuted?: boolean;
}

interface SpeakerConfig extends ZegoDeviceInfo {
  volume: number;
}

export interface MainStore {
  user: User;
  room: Room;
  token: string;
  cameraConfig: CameraConfig;
  speakerDevice: SpeakerConfig;
  browserIsSupport: boolean;
}
