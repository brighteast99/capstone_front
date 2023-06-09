<template>
  <v-sheet :style="{ height: props.height, width: '100%' }">
    <v-window v-model="index">
      <v-window-item v-for="(image, i) in props.images" :key="image" :value="i">
        <v-img :src="image" cover :height="props.height"> </v-img>
      </v-window-item>
    </v-window>
    <div class="controller-area">
      <v-icon
        v-for="i in props.images.length"
        :key="i"
        class="controller"
        :class="{ 'text-primary_accent': index == i - 1 }"
        @click="test(i)"
        icon="mdi-circle"
        size="small"
      ></v-icon>
    </div>
  </v-sheet>
</template>

<script setup>
import { useCycleList, useIntervalFn } from "@vueuse/core";
import { onBeforeUnmount } from "vue";
import { watchEffect } from "vue";
import { computed, defineProps } from "vue";

const test = (event) => {
  index.value = event - 1;
  pause();
  resume();
};

// Data
const list = computed(() => props.images);
const { next: nextBanner, index } = useCycleList(list);
const { pause, resume, isActive } = useIntervalFn(nextBanner, 5000, {
  immediate: false,
});

// Props
const props = defineProps({
  height: {
    Type: Number,
    default: 360,
  },
  images: {
    Type: [String],
    default: [],
  },
});

// Hook
onBeforeUnmount(pause);

// Watches
watchEffect(() => {
  if (list.value.length > 1 && !isActive.value) resume();
  if (list.value.length <= 1 && isActive.value) pause();
});
</script>

<style scoped>
.controller-area {
  position: absolute;
  bottom: 0.5em;
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 1em;
}

.controller {
  color: white;
  transition: all 0.2s;
  border-radius: 50%;
  border-width: 0px;
}

.controller:hover:not(.text-primary_accent) {
  box-shadow: 0 0 0 4px lightgray;
}
</style>
