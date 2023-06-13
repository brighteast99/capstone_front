<template>
  <custom-btn class="dot-btn" :size="props.size">
    <v-icon :icon="props.icon"> </v-icon>

    <v-menu
      v-if="props.menu"
      activator="parent"
      location="right"
      :open-on-hover="false"
      open-on-click
    >
      <v-sheet class="px-5 py-3">
        <slot> </slot>
      </v-sheet>
    </v-menu>
  </custom-btn>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";
import { defineProps } from "vue";

const props = defineProps({
  icon: {
    Type: String,
    default: "mdi-dots-vertical",
  },
  menu: {
    Type: Boolean,
    default: true,
  },
  size: {
    Type: String | Number,
    default: "small",
  },
});
</script>

<style scoped>
.dot-btn {
  position: absolute;
  padding: 0;
  top: 1em;
  right: 1em;
  z-index: 1;
}
</style>
