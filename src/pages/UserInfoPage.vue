<template>
  <h1>{{ "userId: " + props.userId + "의 정보" }}</h1>
  <router-view></router-view>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  userId: String,
});
</script>
