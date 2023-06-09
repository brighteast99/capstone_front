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
          <router-view @completed="displayHelp = !$event"></router-view>
        </v-row>

        <!-- Help area -->
        <v-row
          v-if="displayHelp"
          class="mt-3"
          justify="start"
          style="font-size: 0.9em"
        >
          <custom-btn class="pl-0" weight="normal" :to="{ name: pages.Login }">
            <template v-slot:prepend>
              <v-icon icon="mdi-chevron-left"></v-icon>
            </template>
            로그인 페이지로
          </custom-btn>
        </v-row>
      </v-container>
    </v-row>
  </v-defaults-provider>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";
import LogoGroup from "@/components/LogoGroup.vue";

import { ref } from "vue";
import { pages } from "@/router";

const defaults = {
  VTextField: {
    variant: "solo",
    density: "compact",
    hideDetails: true,
    clearable: true,
  },
  VCombobox: {
    variant: "solo",
    density: "compact",
    clearable: true,
    hideDetails: true,
  },
  VCheckbox: {
    hideDetails: true,
    density: "compact",
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

const displayHelp = ref(true);
</script>

<style scoped></style>
