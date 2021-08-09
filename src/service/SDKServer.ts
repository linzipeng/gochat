// 集成SDK
import { App } from "vue";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

export const zg = new ZegoExpressEngine(
  3127407533,
  "wss://webliveroom3127407533-api.zego.im/ws"
);

zg.setDebugVerbose(false);

export const getVersion = function (): string {
  return zg.getVersion();
};

export const checkSystemRequirements = async function (): Promise<boolean> {
  console.log("sdk version is", zg.getVersion());
  try {
    const result = await zg.checkSystemRequirements();
    if (!result.webRTC) {
      console.log("browser is not support webrtc!!");
      return false;
    } else if (!result?.videoCodec?.VP8) {
      console.log("browser is not support VP8");
      return false;
    }
    return true;
  } catch (err) {
    console.error("checkSystemRequirements", err);
    return false;
  }
};

export default {
  install(app: App): void {
    app.config.globalProperties.$zg = zg;
  },
};
