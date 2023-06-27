<template>
  <v-card
    class="rounded-0 pa-1 card"
    :class="{ disabled: is_deleted || alreadyInThread }"
    elevation="0"
    :disabled="alreadyInThread || is_deleted"
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
    <v-overlay
      :model-value="alreadyInThread"
      class="justify-center align-center"
      activator="parent"
      scrim="black"
      persistent
      contained
      no-click-animation
      :open-on-click="false"
      :close-on-content-click="false"
    >
      <div class="text-white text-h5">현재 게시글입니다</div>
    </v-overlay>

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
    <v-card-text class="pa-0">
      <recruitment-viewer
        v-if="!props.thread.is_deleted && props.thread.board.id != 5"
        :loading="isLoading"
        :error="error"
        :owner="currentUser.id == props.thread.user.id"
        :recruitments="recruitments"
        :readonly="true"
      ></recruitment-viewer>
    </v-card-text>

    <v-card-actions v-if="!props.thread.is_deleted" class="actiondata-area">
      <div class="d-flex align-center">
        <v-icon start icon="mdi-eye"></v-icon>
        <span>{{ props.thread.views }}</span>
      </div>
      <div class="d-flex align-center">
        <v-icon start icon="mdi-comment-text-outline"></v-icon>
        <span>{{ comment_count }}</span>
      </div>
      <div class="d-flex align-center">
        <v-icon start icon="mdi-heart-outline" color="error"></v-icon>
        <span>{{ props.thread.likes }}</span>
      </div>
      <div class="d-flex align-center">
        <v-icon start icon="mdi-star-outline" color="warning"></v-icon>
        <span>{{ props.thread.favorites }}</span>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import WriterInfo from "./WriterInfo.vue";
import RecruitmentViewer from "./RecruitmentViewer.vue";

import { computed, defineProps, watch } from "vue";

import router, { pages } from "@/router";
import {
  countActiveComments,
  extractText,
  formatDateRelative,
} from "@/modules/utility";
import { API, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { useSystemStore } from "@/store";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

// Pinia storage
const systemStore = useSystemStore();
const { currentUser } = storeToRefs(systemStore);

// Data
const alreadyInThread = computed(() => {
  const current = router.currentRoute.value;
  return (
    current.name == pages.ViewThread &&
    current.params.threadId == props.thread.id
  );
});
const is_deleted = computed(() => props.thread.is_deleted);
const date = computed(() =>
  formatDateRelative(props.thread.date_created ?? new Date(), {
    max_unit: "days",
  })
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
const recruitments = computed(() =>
  data.value?.data[API.GetRecruitments]
    .filter((recruitment) => !recruitment.is_stopped)
    .sort((a, b) => a.occupation.name.localeCompare(b.occupation.name))
);

// Props
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
      favorites: Number | String,
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

onMounted(() => fetchRecruitments());
watch(
  () => props.thread.id,
  () => fetchRecruitments()
);

const { isLoading, error, data, execute } = useAPI();
const fetchRecruitments = () => {
  if (!props.thread.id) return;
  execute(
    constructQuery({
      name: API.GetRecruitments,
      args: { thread_id: Number(props.thread.id) },
      fields: [
        "id",
        { occupation: ["name"] },
        {
          applyforrecruitment_set: [
            "id",
            { applicant: ["id", "name"] },
            "result",
            "memo",
            "date_created",
          ],
        },
        "current_cnt",
        "max_cnt",
        "is_closed",
        "is_stopped",
      ],
    })
  );
};
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
