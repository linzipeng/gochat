<template>
  <div :style="style" ref="lavContainer"></div>
</template>

<script>
import lottie from "lottie-web";
import { defineComponent, onMounted, ref, toRefs } from "vue";

export default defineComponent({
  props: {
    options: {
      type: Object,
      required: true,
    },
    height: Number,
    width: Number,
  },
  setup(props, rtx) {
    const lavContainer = ref(null);
    const { options, height, width } = toRefs(props);
    const style = ref({
      width: width.value ? `${width.value}px` : "100%",
      height: height.value ? `${height.value}px` : "100%",
      overflow: "hidden",
      margin: "0 auto",
    });

    onMounted(() => {
      const anim = lottie.loadAnimation({
        container: lavContainer.value,
        renderer: "svg",
        loop: options.value.loop !== false,
        autoplay: options.value.autoplay !== false,
        animationData: options.value.animationData,
        rendererSettings: options.value.rendererSettings,
      });
      rtx.emit("animCreated", anim);
    });

    return {
      lavContainer,
      style,
    };
  },
});
</script>
