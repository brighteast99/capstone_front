<template>
  <v-app>
    <!-- Header -->
    <top-navbar v-show="!hideTopNavbar"></top-navbar>
    <!-- Main -->
    <v-main
      :style="{
        marginTop: (hideTopNavbar ? '0' : '72') + 'px',
        position: 'relative',
      }"
    >
      <v-container class="pa-0" fluid style="max-width: 1024px">
        <router-view> </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>
<script setup>
import TopNavbar from "./components/TopNavbar.vue";

import { computed, onMounted } from "vue";
import router from "@/router";
import { useSystemStore } from "./store";

// Pinia
const systemStore = useSystemStore();

// Data
const hideTopNavbar = computed(
  () => router.currentRoute.value.meta.hideTopNavbar
);

onMounted(() => {
  systemStore.verify();
  systemStore.startHistoryCleanup();
});
</script>

<style scoped>
.v-main {
  overflow: scroll;
}
</style>
