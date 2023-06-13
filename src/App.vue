<template>
  <v-app>
    <!-- Header -->
    <top-navbar v-show="!hideTopNav"></top-navbar>
    <!-- Main -->
    <v-main
      :style="{
        marginTop: navHeight + 'px',
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

import { onMounted } from "vue";
import { useSystemStore } from "./store";
import { storeToRefs } from "pinia";

// Pinia
const systemStore = useSystemStore();
const { hideTopNav, navHeight } = storeToRefs(systemStore);

// Hook
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
