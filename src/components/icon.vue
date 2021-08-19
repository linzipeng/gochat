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
  color: #ACA5B4;
  overflow: hidden;
  vertical-align: middle;
  user-select: none;
  &:hover {
    fill: currentColor;
  }
  &:active {
    fill: currentColor;
  }
}

.icon-button {
  cursor: pointer;
  &:hover {
    color: #9f76ff;
  }
  &:active {
    color: white;
  }
}
</style>
