<template>
  <v-container class="pa-0" style="width: fit-content">
    <v-row no-gutters>
      <v-col cols="auto" class="text-center">
        <v-icon
          icon="mdi-account-multiple"
          color="primary"
          :size="props.iconSize"
          @click="router.push({ name: pages.Main })"
        ></v-icon>
      </v-col>
      <v-col
        cols="auto"
        class="my-auto"
        :style="{
          fontSize: props.fontSize,
        }"
      >
        <p style="line-height: 1.3em">
          <strong style="font-size: 1.3em; margin-bottom: 0">팀</strong>원을
          <br />
          <strong style="font-size: 1.3em">구</strong>해보자
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { defineProps } from "vue";
import router from "@/router";
import { pages } from "@/router";

const props = defineProps({
  iconSize: {
    Type: String | Number,
    default: 64,
  },
  fontSize: {
    Type: String | Number,
    default: "1rem",
  },
});
</script>
