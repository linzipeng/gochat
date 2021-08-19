import {
  ZegoDeviceInfo,
  ZegoCamera,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";

export interface CameraConfig extends ZegoCamera {
  volume: number;
  actualVideoMuted?: boolean;
  actualAudioMuted?: boolean;
  videoErrorMessage?: string;
  audioErrorMessage?: string;
}

export interface SpeakerConfig extends ZegoDeviceInfo {
  volume: number;
  speaker: boolean;
  speakerErrorMessage?: "";
}

export interface MixingAudio {
  src: string;
  title: string;
  id: string;
  volume: number;
}

export interface MainStore {
  user: User;
  room: Room;
  cameraConfig: CameraConfig;
  speakerDevice: SpeakerConfig;
  mixingAudio: MixingAudio;
  browserIsSupport: boolean;
}
