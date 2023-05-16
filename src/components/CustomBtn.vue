<template>
  <div class="wrapper">
    <div
      class="container"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <div :style="{ color: fontColor, marginLeft: 'auto' }">
        <slot name="prepend"></slot>
      </div>
      <button class="px-0" :style="style" @click="route">
        <slot></slot>
      </button>

      <div :style="{ color: fontColor, marginLeft: 'auto' }">
        <slot name="append"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from "vue";

import { themes } from "@/plugins/vuetify.config";
import router from "@/router";

const isHover = ref(false);
const fontColor = computed(() => {
  const activeColor = themes.customTheme.colors[props.color] ?? props.color;
  const defaultColor =
    themes.customTheme.colors[props.defaultColor] ?? props.defaultColor;
  return isHover.value || props.active ? activeColor : defaultColor;
});
const fontSize = computed(() =>
  typeof props.size == "number" ? props.size + "px" : props.size
);
const style = computed(() => {
  return {
    fontSize: fontSize.value,
    fontWeight: props.weight,
    color: fontColor.value,
    whiteSpace: "nowrap",
  };
});

const props = defineProps({
  size: {
    Type: String | Number,
    default: "1em",
  },
  weight: {
    Type: String | Number,
    default: "normal",
  },
  to: {
    Type: String | Object,
  },
  defaultColor: {
    Type: String,
    default: "gray",
  },
  color: {
    Type: String,
    default: "primary_accent",
  },
  active: {
    Type: Boolean,
    default: false,
  },
});

const route = () => {
  if (!props.to) return;

  router.push(props.to);
};
</script>

<style scoped>
button {
  width: 100%;
  font-weight: bold;
  transition: all 0.1s;
  padding-left: 0.5em;
  padding-right: 0.5em;
  outline: none;
}

.wrapper {
  width: fit-content;
  padding: 0 0.5em 0 0.5em;
}

.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: fit-content;
}
</style>
