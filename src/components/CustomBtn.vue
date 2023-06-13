<template>
  <div
    class="wrapper"
    :class="{ disabled: props.disabled }"
    v-element-hover="toggleHover"
    @click="route"
  >
    <div class="container">
      <div
        style="margin-right: auto; white-space: nowrap; align-items: center"
        :style="{ color: fontColor }"
      >
        <slot name="prepend">
          <v-icon v-if="props.prependIcon" :icon="props.prependIcon"></v-icon>
        </slot>
      </div>

      <button class="px-0" :style="style">
        <slot></slot>
      </button>

      <div
        style="margin-left: auto; white-space: nowrap; align-items: center"
        :style="{ color: fontColor }"
      >
        <slot name="append">
          <v-icon v-if="props.appendIcon" :icon="props.appendIcon"></v-icon>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from "vue";

import { vElementHover } from "@vueuse/components";
import { createToggle } from "@/modules/utility";
import { themes } from "@/plugins/vuetify.config";
import router from "@/router";

const { value: isHover, toggle: toggleHover } = createToggle(false);
const fontColor = computed(() => {
  const activeColor = themes.customTheme.colors[props.color] ?? props.color;
  const defaultColor =
    themes.customTheme.colors[props.defaultColor] ?? props.defaultColor;
  return (!props.disabled && isHover.value) || props.active
    ? activeColor
    : defaultColor;
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
    default: "primary",
  },
  active: {
    Type: Boolean,
    default: false,
  },
  disabled: {
    Type: Boolean,
    default: false,
  },
  prependIcon: {
    Type: String,
    default: null,
  },
  appendIcon: {
    Type: String,
    default: null,
  },
});

const route = (event) => {
  if (props.disabled) return event.stopImmediatePropagation();
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

.wrapper:not(.disabled) {
  cursor: pointer;
}

.disabled {
  filter: brightness(0.7);
}

.wrapper.disabled button {
  cursor: default;
}

.wrapper:hover:not(.disabled) {
  filter: brightness(1.2);
}
.wrapper:active:not(.disabled) {
  transition: all 0s;
  filter: brightness(0.8);
}

.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: fit-content;
}
</style>
