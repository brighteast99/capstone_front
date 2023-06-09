<template>
  <custom-btn class="dot-btn" size="small">
    <v-icon icon="mdi-dots-vertical"> </v-icon>

    <v-menu
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
</script>

<style scoped>
.dot-btn {
  position: absolute;
  padding: 0;
  top: 0.5em;
  right: 1em;
  z-index: 1;
}
</style>
