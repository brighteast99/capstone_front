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
        :to="{ name: pages.ThreadList, params: { boardId: props.boardId } }"
      >
        전체보기
      </custom-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="py-1">
      <error-block
        v-if="props.loading || props.error || !props.items.length"
        :loading="props.loading"
      >
        <span v-if="props.error"> 게시글을 불러오지 못했습니다 </span>
        <span v-else> 아직 게시글이 없습니다 </span>
      </error-block>
      <div v-else>
        <div v-for="item in sliced" :key="item" class="d-flex">
          <custom-btn
            class="my-2"
            default-color="black"
            :size="16"
            :to="{
              name: pages.ViewThread,
              params: { boardId: item.board.id, threadId: item.id },
            }"
          >
            <p class="title-text">
              {{ item.title }}
            </p>
          </custom-btn>
          <v-spacer></v-spacer>
          <div
            v-if="props.showLikes"
            class="d-flex align-center actiondata-area"
          >
            <v-icon start icon="mdi-heart-outline" color="error"></v-icon>
            <span>{{ item.likes }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";

import { defineProps } from "vue";
import { pages } from "@/router";
import ErrorBlock from "./ErrorBlock.vue";
import { computed } from "vue";

const sliced = computed(() => props.items.slice(0, props.limit));

const props = defineProps({
  loading: {
    Type: Boolean,
    default: false,
  },
  error: {
    Type: Boolean,
    default: false,
  },
  boardName: String,
  boardDesc: String,
  boardId: {
    Type: Number | String,
  },
  items: Array,
  elevation: {
    Type: Number,
    default: 1,
  },
  limit: {
    Type: Number,
    default: 5,
  },
  showLikes: {
    Type: Boolean,
    default: false,
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

.actiondata-area {
  min-height: unset;
  gap: 1.5em;
  font-size: 0.9em;
  filter: grayscale(0.2) opacity(0.7);
}
</style>
