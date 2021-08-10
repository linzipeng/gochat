<template>
  <svg class="icon" :class="{ 'icon-button': isButton }" aria-hidden="true">
    <use :xlink:href="'#icon-' + name"></use>
  </svg>
</template>

<script lang="ts">
import { defineComponent, toRefs } from "vue";

export default defineComponent({
  name: "Icon",
  props: {
    name: {
      type: String,
      require: true,
    },
    className: {
      type: String,
    },
    isButton: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style lang="less">
.icon {
  width: 1.572em;
  height: 1.572em;
  fill: currentColor;
  overflow: hidden;
  vertical-align: middle;
  user-select: none;
}

.icon-button {
  cursor: pointer;
  &:hover {
    fill: currentColor;
    color: #9f76ff;
  }
  &:active {
    fill: currentColor;
    color: white;
  }
}
</style>
