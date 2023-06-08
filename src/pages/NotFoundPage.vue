<template>
  <div class="d-flex flex-column h-screen align-center justify-center ma-auto">
    <v-icon icon="mdi-alert-outline" color="error" size="150"></v-icon>
    <h1>존재하지 않는 페이지입니다.</h1>
    <p>나중에 다시 시도하거나 관리자에게 문의 바랍니다.</p>

    <div class="d-flex mt-5">
      <custom-btn size="large" @click="router.back()">이전 페이지로</custom-btn>
      <custom-btn size="large" :to="{ name: pages.Main }">
        메인 페이지로</custom-btn
      >
    </div>
  </div>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";

import router, { pages } from "@/router";
</script>
