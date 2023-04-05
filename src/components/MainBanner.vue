<template>
  <v-carousel
    :height="props.height"
    hide-delimiter-background
    :show-arrows="false"
    touch
    cycle
    interval="5000"
    color="primary_accent"
  >
    <v-carousel-item>
      <v-img src="@/assets/Banner_Main.png" cover :height="props.height">
      </v-img>
    </v-carousel-item>
    <v-carousel-item v-for="image in props.images" :key="image">
      <v-img :src="image" cover :height="props.height"> </v-img>
    </v-carousel-item>
  </v-carousel>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  height: {
    Type: Number,
    default: 360,
  },
  images: Array,
});
</script>

<style scoped>
.banner-area {
  height: 100%;
}
</style>
