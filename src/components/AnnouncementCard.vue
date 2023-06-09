<template>
  <v-card variant="flat" color="background">
    <div class="area">
      <p class="mx-2" style="font-weight: bold; min-width: fit-content">
        공지사항
      </p>

      <custom-btn
        class="announce-title-btn"
        :to="
          currentAnnounce?.id
            ? {
                name: pages.ViewThread,
                params: {
                  boardId: 5,
                  threadId: currentAnnounce?.id,
                },
              }
            : false
        "
      >
        <v-scroll-y-reverse-transition leave-absolute>
          <p v-if="transition" class="announce-title">
            {{ transition ? currentAnnounce?.title : getPrev() }}
          </p>
          <p v-else class="announce-title">
            {{ transition ? getPrev() : currentAnnounce?.title }}
          </p>
        </v-scroll-y-reverse-transition>
      </custom-btn>

      <v-spacer></v-spacer>
      <custom-btn
        size="small"
        :to="{ name: pages.ThreadList, params: { boardId: 5 } }"
      >
        모든 공지 보기
      </custom-btn>
    </div>
  </v-card>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";

import { reactive, onBeforeMount, onBeforeUnmount, watchEffect } from "vue";
import { useCycleList, useIntervalFn } from "@vueuse/core";
import { pages } from "@/router";
import { createToggle } from "@/modules/utility";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";

// Pinia storage

// Data
const announcements = reactive([]);
const {
  state: currentAnnounce,
  next: nextAnnounce,
  index,
} = useCycleList(announcements);
const { value: transition, toggle } = createToggle(true);
const CYCLE_INTERVAL = 2500;
const { pause, resume, isActive } = useIntervalFn(
  () => {
    nextAnnounce();
    toggle();
  },
  CYCLE_INTERVAL,
  { immediate: false }
);

// Hooks
onBeforeMount(() => {
  new apiRequest()
    .execute(
      API.GetBoard,
      { id: 5 },
      { thread_set: ["id", "title", "is_deleted", "date_created"] }
    )
    .then(parseResponse)
    .then((response) => {
      announcements.push(
        ...response[API.GetBoard].thread_set.filter(
          (thread) => !thread.is_deleted
        )
      );
    })
    .catch(() =>
      announcements.push({
        id: null,
        title: "오류가 발생했습니다",
      })
    )
    .finally(() => (index.value = 0));
});
onBeforeUnmount(pause);

// Watch
watchEffect(() => {
  if (announcements.length > 1 && !isActive.value) resume();
  if (announcements.length <= 1 && isActive.value) pause();
});

// Methods
const getPrev = () => {
  return announcements[(index - 1) % announcements.length];
};
</script>

<style scoped>
.area {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
}

.announce-title-btn {
  width: 100%;
  flex-shrink: 1;
  min-width: 0;
}

.announce-title {
  display: block;
  width: 100%;
  min-width: unset;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: left;
}

.icon {
  margin-right: 5px;
}
</style>
