<template>
  <v-card
    class="rounded-0 pa-1 card"
    :class="{ disabled: is_deleted }"
    elevation="0"
    :disabled="is_deleted"
    @click="
      if (!is_deleted)
        router.push({
          name: pages.ViewThread,
          params: {
            boardId: props.thread?.board?.id,
            threadId: props.thread?.id,
          },
        });
    "
  >
    <v-card-title>
      <writer-info
        :writer="props.thread.user"
        :date="date"
        :small="true"
        :disabled="props.thread.is_deleted"
        @click.stop
      >
      </writer-info>
    </v-card-title>

    <v-card-text class="pt-2">
      <div
        v-if="props.thread.is_deleted"
        class="d-flex flex-column justify-center text-center text-disabled"
        style="height: 50px; font-size: 1.3em; background-color: #fafafa"
      >
        삭제된 게시글입니다
      </div>
      <div v-else>
        <p class="title">
          {{ props.thread.title }}
        </p>
        <p class="content">
          {{ content }}
        </p>
      </div>
    </v-card-text>

    <v-card-actions v-if="!props.thread.is_deleted" class="actiondata-area">
      <div class="d-flex align-center">
        <v-icon icon="mdi-eye"></v-icon>
        <span>&nbsp;{{ props.thread.views }}</span>
      </div>
      <div class="d-flex align-center">
        <v-icon icon="mdi-comment-text-outline"></v-icon>
        <span>&nbsp;{{ comment_count }}</span>
      </div>
      <div class="d-flex align-center">
        <v-icon icon="mdi-heart-outline" color="error"></v-icon>
        <span>&nbsp;{{ props.thread.likes }}</span>
      </div>
      <div class="d-flex align-center">
        <v-icon icon="mdi-star-outline" color="warning"></v-icon>
        <span>&nbsp;0</span>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import WriterInfo from "./WriterInfo.vue";

import { computed, defineProps } from "vue";

import {
  countActiveComments,
  extractText,
  formatDateRelative,
} from "@/modules/utility";
import router, { pages } from "@/router";

const is_deleted = computed(() => props.thread.is_deleted);
const date = computed(() =>
  formatDateRelative(props.thread.date_created, { max_unit: "days" })
);
const content = computed(() => {
  const text = extractText(props.thread?.content);
  if (text.length > props.maxLen)
    return text.substring(0, props.maxLen) + "...";
  return text;
});
const comment_count = computed(() =>
  countActiveComments(props.thread?.commentforthread_set)
);

const props = defineProps({
  thread: {
    Type: {
      id: Number | String,
      board: { id: Number | String },
      user: {
        id: Number | String,
        name: String,
      },
      is_deleted: Boolean,
      title: String,
      content: String,
      date_created: Date | String,
      views: Number | String,
      likes: Number | String,
      commentforthread_set: {
        is_deleted: Boolean,
        replies: [
          {
            is_deleted: Boolean,
          },
        ],
      },
    },
  },
  maxLen: {
    Type: Number,
    default: 300,
  },
});
</script>

<style scoped>
.card:active:not(.disabled) {
  transition: all 0s;
  background-color: #f0f0f0;
}
.title {
  font-weight: 600;
  font-size: 1.4em;
  margin-bottom: 0.5em;
}
.actiondata-area {
  min-height: unset;
  gap: 1.5em;
  font-size: 0.9em;
  filter: grayscale(0.2) opacity(0.7);
}
</style>
