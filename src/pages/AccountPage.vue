<template>
  <v-defaults-provider :defaults="defaults">
    <v-row class="h-screen">
      <v-container style="max-width: 400px">
        <!-- Site Logo -->
        <v-row>
          <logo-group icon-size="96" font-size="1.3em"></logo-group>
        </v-row>

        <!-- Form area -->
        <v-row>
          <router-view></router-view>
        </v-row>

        <!-- Help area -->
        <v-row class="mt-3" justify="start" style="font-size: 0.9em">
          <custom-btn class="pl-0" weight="normal" :to="{ name: 'Login' }">
            ＜ 로그인 페이지로
          </custom-btn>
        </v-row>
      </v-container>
    </v-row>
  </v-defaults-provider>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";
import LogoGroup from "@/components/LogoGroup.vue";

import { onMounted, onUnmounted } from "vue";
import { useSystem } from "@/store";

const systemStore = useSystem();

const defaults = {
  VTextField: {
    variant: "solo",
    density: "compact",
    hideDetails: "auto",
  },
  VRow: {
    justify: "center",
    align: "center",
    noGutters: true,
  },
  VCol: {
    cols: "auto",
  },
  VBtn: {
    color: "primary",
  },
};

// Hooks
onMounted(() => systemStore.hideUI());
onUnmounted(() => systemStore.showUI());
</script>

<style scoped></style>
