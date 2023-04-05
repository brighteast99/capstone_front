<template>
  <v-card :elevation="props.elevation">
    <v-card-title class="d-flex flex-row align-end">
      <div>
        <p class="board-name">{{ props.boardName }}</p>
        <p class="board-desc">{{ props.boardDesc }}</p>
      </div>
      <v-spacer></v-spacer>
      <custom-btn
        size="small"
        :to="{ name: 'PostListPage', params: { boardId: props.boardId } }"
      >
        전체보기
      </custom-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="py-1">
      <custom-btn
        v-for="item in props.items"
        :key="item"
        class="my-2"
        default-color="black"
        :size="16"
        :to="{
          name: 'PostPage',
          params: { boardId: item.boardId, postId: item.postId },
        }"
      >
        <p class="title-text">
          {{ item.title }}
        </p>
      </custom-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";

import { defineProps } from "vue";

const props = defineProps({
  boardName: String,
  boardDesc: String,
  boardId: String,
  items: Array,
  elevation: {
    Type: Number,
    default: 1,
  },
});
</script>

<style scoped>
.board-name {
  font-size: 1.2em;
  font-weight: bold;
}
.board-desc {
  line-height: 1.2;
  font-size: 0.8em;
  color: grey;
  font-weight: lighter;
}

.title-text {
  width: 100%;
  display: block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.1s;
  text-align: left;
}
</style>
