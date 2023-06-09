<template>
  <v-card
    class="area rounded-0 pa-1"
    elevation="0"
    @click="
      router.push({
        name: pages.ViewThread,
        params: { threadId: props.thread?.id },
      })
    "
  >
    <v-card-title>
      <writer-info
        :writer="props.thread.user"
        :date="date"
        :small="true"
        @click.stop
      >
      </writer-info>
    </v-card-title>

    <v-card-text class="pt-2">
      <p class="title">
        {{ props.thread.title }}
      </p>
      <p class="content">
        {{ content }}
      </p>
    </v-card-text>

    <v-card-actions class="actiondata-area">
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
      user: {
        id: Number | String,
        name: String,
      },
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
.area {
  transition: all 0.2s;
}
.area:hover {
  background-color: #f5f5f5;
}

.area:active {
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
