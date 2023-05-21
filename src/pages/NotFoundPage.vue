<template>
  <div class="d-flex flex-column fill-height align-center justify-center">
    <v-icon icon="mdi-alert-outline" color="error" size="150"></v-icon>
    <h1>Page Not Found</h1>

    <div class="d-flex">
      <custom-btn size="large" @click="router.back()">이전 페이지로</custom-btn>
      <custom-btn size="large" :to="{ name: pages.Main.name }"
        >메인 페이지로</custom-btn
      >
    </div>
  </div>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";

import router, { pages } from "@/router";
</script>
