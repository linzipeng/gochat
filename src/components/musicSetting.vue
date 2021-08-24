<template>
  <div class="music-dialog">
    <div class="top">
      <div>背景音设置</div>
      <icon name="icon_close" :isButton="true" @click="$emit('close')"></icon>
    </div>
    <div class="content">
      <div class="music-play">
        <div>背景音</div>
        <div class="music-btn-container">
          <div v-for="item in music" :key="item.id">
            <div
              class="music-btn"
              :class="{
                'is-active': $store.state.mixingAudio.id === item.id,
              }"
              @click="playMusic(item)"
            >
              <div class="music-icon"></div>
              <lottie
                v-if="$store.state.mixingAudio.id === item.id"
                :width="19"
                :height="19"
                :options="options"
                class="music-playing"
              ></lottie>
            </div>
            <div>{{ item.title }}</div>
          </div>
        </div>
      </div>
      <div class="volume">
        <div>音乐音量</div>
        <div class="volume-input">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="$store.state.mixingAudio.volume"
            @change="updateMixingVolume"
          />
          <div
            class="blue-bg"
            :style="`width:${$store.state.mixingAudio.volume}%`"
          ></div>
        </div>
        <span>{{ $store.state.mixingAudio.volume }}</span>
      </div>
      <div class="volume">
        <div>人声音量</div>
        <div class="volume-input">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="$store.state.cameraConfig.volume"
            @change="updateCamerasVolume"
          />
          <div
            class="blue-bg"
            :style="`width:${$store.state.cameraConfig.volume}%`"
          ></div>
        </div>
        <span>{{ $store.state.cameraConfig.volume }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import animationData from "@/assets/json/jump.json";
import lottie from "@/components/lottie.vue";
import { useStore } from "vuex";
import { MainStore } from "@/store/store";

export default defineComponent({
  components: {
    lottie,
  },
  setup() {
    const store = useStore<MainStore>();
    const options = {
      loop: true,
      autoplay: true,
      animationData: animationData,
    };
    const music = [
      { id: "happy", title: "欢快", src: require("@/assets/music/Happy.mp3") },
      {
        id: "lovely",
        title: "浪漫",
        src: require("@/assets/music/Lovely.mp3"),
      },
      {
        id: "dream",
        title: "正能量",
        src: require("@/assets/music/Dream.mp3"),
      },
    ];

    const playMusic = function (item: {
      id: "happy" | "lovely" | "dream";
      src: string;
      title: string;
    }) {
      const mixingAudio = JSON.parse(JSON.stringify(store.state.mixingAudio));
      if (mixingAudio.id === item.id) {
        mixingAudio.src = "";
        mixingAudio.id = "";
        mixingAudio.title = "";
      } else {
        mixingAudio.src = item.src;
        mixingAudio.id = item.id;
        mixingAudio.title = item.title;
      }
      store.commit("setter", { key: "mixingAudio", value: mixingAudio });
    };

    const updateCamerasVolume = function (event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      if (input) {
        const cameraConfig = JSON.parse(
          JSON.stringify(store.state.cameraConfig));
        cameraConfig.volume = parseInt(input.value);
        store.commit("setter", { key: "cameraConfig", value: cameraConfig });
      }
    };

    const updateMixingVolume = function (event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      if (input) {
        const mixingAudio = JSON.parse(JSON.stringify(store.state.mixingAudio));
        mixingAudio.volume = parseInt(input.value);
        store.commit("setter", { key: "mixingAudio", value: mixingAudio });
      }
    };

    return {
      music,
      options,
      updateCamerasVolume,
      updateMixingVolume,
      playMusic,
    };
  },
});
</script>

<style lang="less">
.music-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 472px;
  height: 313px;
  background: #2c253c;
  box-shadow: 0px 6px 10px 0px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  color: #aca5b4;
  font-size: 14px;
  box-sizing: border-box;
  z-index: 15;
  .top {
    box-sizing: border-box;
    width: 100%;
    height: 45px;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(121, 120, 125, 0.19);
    svg {
      width: 18px;
      height: 18px;
    }
  }
  .content {
    padding: 0 80px;
    .music-play {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 48px;
      margin-bottom: 32px;
      .music-btn-container {
        width: 210px;
        display: flex;
        text-align: center;
        justify-content: space-between;
        font-size: 12px;
        .music-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 100%;
          background: rgba(224, 221, 227, 0.1);
          margin-bottom: 5px;
          cursor: pointer;
          .music-icon {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            width: 16px;
            height: 15px;
            background: url("../assets/music/hover.svg") no-repeat center;
            background-size: cover;
          }
          &:hover {
            background: #9f76ff;
            .music-icon {
              background: url("../assets/music/play.svg") no-repeat right;
            }
          }
          &.is-active {
            background: #9f76ff;
            &:hover {
              .music-icon {
                background: url("../assets/music/stop.svg") no-repeat center;
              }
            }
          }
          .music-playing {
            position: absolute;
            right: -2px;
            bottom: -2px;
          }
        }
      }
    }
    .volume {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;
      height: 22px;
      color: #b3b6ba;
      margin: 17px 0;
      .volume-input {
        position: relative;
        display: flex;
        flex-shrink: 0;
        flex-grow: 0;
        width: 180px;
        margin-left: 30px;
        .blue-bg {
          z-index: 1;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: 4px;
          background-color: #9f76ff;
          border-radius: 2px;
        }
        input[type="range"] {
          -webkit-appearance: none;
          width: 180px;
          height: 4px;
          border-radius: 10px; /*这个属性设置使填充进度条时的图形为圆角*/
          background-color: rgba(33, 30, 36, 1);
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
        }
        // 设置轨道样式
        input[type="range"]::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px; /*将轨道设为圆角的*/
          border: none;
        }
        // 去掉focus时的边框
        input[type="range"]:focus {
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 10px;
          width: 10px;
          margin-top: -3px; /*使滑块超出轨道部分的偏移量相等*/
          background: #edf1fa;
          border-radius: 50%; /*外观设置为圆形*/
          border: solid 0.125em rgba(205, 224, 230, 0.5); /*设置边框*/
          box-shadow: 0 0.125em 0.125em #3b4547; /*添加底部阴影*/
          position: relative;
          z-index: 2;
          cursor: pointer;
        }
      }
      span {
        width: 20px;
        font-size: 12px;
      }
    }
  }
}
</style>
