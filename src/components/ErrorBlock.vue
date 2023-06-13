<template>
  <div
    class="d-flex w-100 justify-center align-center text-center text-h6"
    :class="`text-${props.color}`"
    :style="{ height: parsedHeight }"
    style="white-space: pre"
  >
    <v-icon v-if="props.loading" class="mdi-spin" icon="mdi-loading"></v-icon>
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { computed, defineProps } from "vue";

const parsedHeight = computed(() => {
  if (isNaN(Number(props.height))) return props.height;
  else return props.height + "px";
});

const props = defineProps({
  height: {
    Type: String,
    default: "5em",
  },
  color: {
    Type: String,
    default: "disabled",
  },
  loading: Boolean,
});
</script>
