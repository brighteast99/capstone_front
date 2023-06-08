<template>
  <v-carousel
    v-model="current"
    :height="props.height"
    hide-delimiter-background
    :show-arrows="false"
    touch
    cycle
    interval="5000"
    color="primary"
  >
    <v-carousel-item v-for="image in props.images" :key="image">
      <v-img :src="image" cover :height="props.height"> </v-img>
    </v-carousel-item>
  </v-carousel>
</template>

<script setup>
import { ref, defineProps, onBeforeMount } from "vue";

const current = ref();

const props = defineProps({
  height: {
    Type: Number,
    default: 360,
  },
  images: Array,
});

onBeforeMount(() => {
  current.value = 0;
});
</script>

<style scoped>
.banner-area {
  height: 100%;
}

.v-btn--active {
  color: white;
}
</style>
