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
        v-if="isLoading | error"
        class="d-flex flex-column justify-center align-center"
        style="height: 40dvh"
      >
        <span v-if="error">
          게시글을 불러오는 데 실패했습니다. <br />
          나중에 다시 시도하거나 관리자에게 문의 바랍니다.
        </span>
        <v-icon v-else class="mdi-spin" icon="mdi-loading" size="50"> </v-icon>
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
        <thread-peeker :thread="thread"></thread-peeker>
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

import { reactive, defineProps, watch, onBeforeMount } from "vue";
import router, { pages } from "@/router";
import { API, apiRequest, parseResponse, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { useModalStore, useSystemStore } from "@/store";
import { storeToRefs } from "pinia";
import { safeBack } from "@/router";

// Pinia Storage
const systemStore = useSystemStore();
const { currentUser, loggedIn } = storeToRefs(systemStore);
const modalStore = useModalStore();

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

// Watches
watch(
  () => router.currentRoute.value.params.boardId,
  () => {
    if (router.currentRoute.value.name != pages.ThreadList) return;

    fetchBoardData();
  }
);

// Hook
onBeforeMount(() => {
  fetchBoardData();
});

// Methods
const { isLoading, error, execute: getThreads } = useAPI();
const fetchBoardData = async () => {
  // Get board data
  await new apiRequest()
    .execute(
      API.GetBoard,
      { id: Number(router.currentRoute.value.params.boardId) },
      ["title", "content", "board_type"]
    )
    .then(parseResponse)
    .then((response) => {
      if (!response[API.GetBoard])
        throw new Error("존재하지 않는 게시판입니다");
      Object.assign(board, response[API.GetBoard]);
    })
    .catch((err) => modalStore.showErrorMessage(err).then(safeBack()));

  // Get threads
  threads.splice(0, threads.length);
  getThreads(
    constructQuery({
      name: API.GetBoard,
      args: { id: Number(props.boardId) },
      fields: [
        {
          thread_set: [
            "id",
            { board: "id" },
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
  ).then(({ data: response }) => {
    const data = response.value.data[API.GetBoard];
    threads.push(...data.thread_set.filter((thread) => !thread.is_deleted));
  });
};
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
