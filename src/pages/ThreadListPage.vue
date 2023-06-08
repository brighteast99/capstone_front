<template>
  <v-card class="background">
    <v-card-title class="pt-5 pl-7 d-flex align-baseline">
      <p class="board-name mr-3">{{ board?.title }}</p>
      <p class="board-desc">{{ board?.content }}</p>
      <v-spacer></v-spacer>
      <custom-btn
        v-if="
          loggedIn && (board?.board_type == 'GENERAL' || currentUser.is_staff)
        "
        size="small"
        :to="{ name: pages.NewThread, params: { boardId: props.boardId } }"
      >
        게시글 작성
      </custom-btn>
    </v-card-title>

    <v-divider class="mx-3"> </v-divider>

    <v-card-text class="list-area pt-2">
      <div
        v-if="isLoading"
        class="d-flex flex-column justify-center align-center"
        style="height: 40dvh"
      >
        <v-icon class="mdi-spin" icon="mdi-loading" size="50"> </v-icon>
      </div>
      <div
        v-else-if="!threads"
        class="d-flex flex-column justify-center align-center"
        style="height: 40dvh"
      >
        <v-icon icon="mdi-alert-outline" color="error" size="128"> </v-icon>
        <p style="font-size: 24px">아직 등록된 글이 없습니다.</p>
      </div>
      <div v-else v-for="thread in threads" :key="thread">
        <thread-peeker
          :thread="thread"
          @click="
            router.push({
              name: pages.ViewThread,
              params: { boardId: props.boardId, threadId: thread?.id },
            })
          "
        ></thread-peeker>
        <v-divider class="mx-1 my-1"></v-divider>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer>
        <v-pagination
          variant="text"
          length="10"
          active-color="primary_accent"
          density="compact"
          show-first-last-page
        >
        </v-pagination>
      </v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";
import ThreadPeeker from "@/components/ThreadPeeker.vue";

import { reactive, defineProps, onBeforeMount } from "vue";
import { pages } from "@/router";
import { API, apiRequest, parseResponse, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";
import router from "@/router";
import { useSystemStore } from "@/store";
import { storeToRefs } from "pinia";

// Pinia Storage
const systemStore = useSystemStore();
const { currentUser, loggedIn } = storeToRefs(systemStore);

// Data
const board = reactive({
  title: "",
  content: "",
  board_type: "",
});
const threads = reactive([]);

// Props
const props = defineProps({
  boardId: String,
});

// Hook
const { isLoading, execute: getThreads } = useAPI();
onBeforeMount(() => {
  // Get board data
  new apiRequest()
    .execute(API.GetBoard, { id: Number(props.boardId) }, [
      "title",
      "content",
      "board_type",
    ])
    .then(parseResponse)
    .then((response) => Object.assign(board, response[API.GetBoard]));

  // Get threads
  getThreads(
    constructQuery({
      name: API.GetBoard,
      args: { id: Number(props.boardId) },
      fields: [
        {
          thread_set: [
            "id",
            { user: ["id", "name"] },
            "title",
            "content",
            "date_created",
            "is_deleted",
            "views",
            "likes",
            { commentforthread_set: ["is_deleted", { replies: "is_deleted" }] },
          ],
        },
      ],
    })
  )
    .then(({ data: response }) => {
      const data = response.value.data[API.GetBoard];
      threads.push(...data.thread_set.filter((thread) => !thread.is_deleted));
    })
    .catch(() => router.replace({ name: pages.ServerError }));
});
</script>
<style scoped>
.background {
  margin: 40px 0 40px 0;
  position: relative;
}

.board-name {
  font-size: 1.5em;
  font-weight: bold;
}
.board-desc {
  line-height: 1.3;
  font-size: 0.9em;
  color: grey;
  font-weight: lighter;
}

.list-area {
  min-height: 50dvh;
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
