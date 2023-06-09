<template>
  <v-app>
    <!-- Header -->
    <top-navbar v-show="displayTopNavbar"></top-navbar>
    <!-- Main -->
    <v-main
      :style="{
        marginTop: (displayTopNavbar ? '72' : '0') + 'px',
        position: 'relative',
      }"
    >
      <v-container class="pa-0" fluid style="max-width: 1024px">
        <router-view :key="$route.fullPath"> </router-view>
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
const displayTopNavbar = computed(
  () => router.currentRoute.value.meta.useTopNavbar
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
