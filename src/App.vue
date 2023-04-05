<template>
  <v-app>
    <!-- header -->
    <page-header v-show="displayUI"></page-header>
    <!-- Main -->
    <v-main
      :style="{
        marginTop: (displayUI ? '72' : '0') + 'px',
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
import PageHeader from "@/components/PageHeader.vue";
import { computed } from "vue";
import { useSystem } from "@/store";

const systemStore = useSystem();

const displayUI = computed(() => systemStore.displayUI);
</script>

<style scoped>
.v-btn {
  margin-top: auto;
  margin-bottom: auto;
  font-weight: bold;
  font-size: 1em;
}
</style>
