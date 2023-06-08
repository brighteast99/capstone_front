<template>
  <v-card class="card">
    <v-card-title class="pa-5 pt-10 pb-0 d-flex align-center">
      <custom-dropdown
        class="select-board mt-n5 mb-4"
        v-model="threadData.board"
        :items="boardList"
        item-value="id"
        style="width: 20%; flex: 0.2 0"
      >
      </custom-dropdown>
      <v-text-field
        class="mt-n7 mb-4"
        v-model="threadData.title"
        placeholder="글 제목"
        variant="underlined"
        color="primary"
        autofocus
        hide-details
        density="compact"
        @update:focused="
          if (!event) threadData.title = threadData.title.trim();
        "
        style="flex: 0.8 1"
      ></v-text-field>
    </v-card-title>

    <v-card-text class="py-0">
      <text-editor v-model="threadData.content" :edit-mode="true" />
    </v-card-text>

    <v-card-actions class="pb-5">
      <v-spacer></v-spacer>
      <custom-btn class="mr-3" color="error" @click="cancel">
        돌아가기
      </custom-btn>
      <v-btn
        variant="flat"
        color="primary"
        :loading="submitting"
        @click="thread"
      >
        {{ props.threadId ? "수정" : "등록" }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import CustomDropdown from "@/components/CustomDropdown.vue";
import TextEditor from "@/components/TextEditor.vue";
import CustomBtn from "@/components/CustomBtn.vue";

import {
  reactive,
  computed,
  defineProps,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import router, { pages } from "@/router";
import { useSystemStore, useModalStore } from "@/store";
import {
  modalPresets,
  modalResponses,
  modalActions,
} from "@/store/modal.store";
import { API, apiRequest, parseResponse, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { escapeString, parseJSON } from "@/modules/utility";

// Pinia storage
const systemStore = useSystemStore();
// const editorStore = useTextEditor();
const modalStore = useModalStore();

// Data
let intendedLeaving = false;
const isNewThread = computed(() => router.currentRoute.value.meta.newThread);
const isEdited = computed(() => {
  console.log(JSON.stringify(threadData));
  console.log(JSON.stringify(threadData_backup));
  return JSON.stringify(threadData_backup) !== JSON.stringify(threadData);
});
const canLeave = computed(() => !systemStore.loggedIn || !isEdited.value);
const boardList = reactive([]);
const threadData = reactive({
  board: null,
  title: "",
  content: null,
  occupation: [],
});
let threadData_backup;

// Props
const props = defineProps({
  boardId: String,
  threadId: String,
});

// Fetch data before route enter
onBeforeMount(() => {
  const api = new apiRequest();

  api.push(API.GetBoards, null, ["id", "title", "board_type"]);
  if (!isNewThread.value) {
    api.push(API.GetThread, { id: Number(props.threadId) }, [
      "title",
      "content",
      "occupation",
    ]);
  }

  api
    .send()
    .then(parseResponse)
    .then((response) => {
      const boards = response[API.GetBoards];
      if (systemStore.currentUser.is_staff) boardList.push(...boards);
      else
        boardList.push(
          ...boards.filter((board) => board.board_type != "SPECIAL")
        );

      const loadedThread = response[API.GetThread];
      threadData.board = props.boardId;
      if (loadedThread) {
        loadedThread.occupation = loadedThread.occupation.split(", ");
        loadedThread.content = parseJSON(loadedThread.content);

        Object.assign(threadData, loadedThread);
      }
      threadData_backup = Object.assign({}, threadData);
    })
    .catch(() => router.replace({ name: pages.ServerError }));

  window.addEventListener("beforeunload", beforeunloadEvent);
  // window.addEventListener("unload", unloadEvent);
});

// Navigation guards
onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeunloadEvent);
  // window.removeEventListener("unload", unloadEvent);
});
onBeforeRouteLeave(async (to, from, next) => {
  if (intendedLeaving || canLeave.value) return next();

  const response = await modalStore.openModal(
    `페이지를 벗어나시겠습니까?\n${
      isNewThread.value ? "작성" : "수정"
    }중인 내용은 저장되지 않습니다.`,
    null,
    {
      actions: [
        {
          label: "예",
          response: modalResponses.Yes,
          color: "error",
        },
        modalActions.No,
      ],
    }
  );

  return next(response === modalResponses.Yes);
});
onBeforeRouteUpdate(async (to, from, next) => {
  if (intendedLeaving || canLeave.value) return true;

  const response = await modalStore.openModal(
    `페이지를 새로고침하시겠습니까?\n${
      isNewThread.value ? "작성" : "수정"
    }중인 내용은 저장되지 않습니다.`,
    null,
    {
      actions: [
        {
          label: "새로고침",
          response: modalResponses.Yes,
          color: "error",
        },
        modalActions.SafeCancel,
      ],
    }
  );

  return next(response === modalResponses.Yes);
});

// Methods
const cancel = async () => {
  if (!canLeave.value) {
    const operation = isNewThread.value ? "작성" : "수정";
    const response = await modalStore.openModal(
      `${operation}을 취소합니다.\n${operation}한 내용은 저장되지 않습니다`,
      null,
      {
        actions: [
          { label: `${operation} 취소`, color: "error" },
          {
            label: `계속 ${operation}`,
            response: modalResponses.Cancel,
          },
        ],
      }
    );

    if (response === modalResponses.Cancel) return;
  }

  intendedLeaving = true;
  if (props.threadId)
    router.push({
      name: pages.ViewThread,
      params: router.currentRoute.value.params,
    });
  else router.back();
};
const { isLoading: submitting, execute } = useAPI();
const thread = async () => {
  const operation = isNewThread.value ? "등록" : "수정";

  // If no content in new thread
  if (isNewThread.value && !isEdited.value)
    return modalStore.openModal("제목과 내용이 필요합니다.", null, {
      actions: modalPresets.OK,
    });

  const response = await modalStore.openModal(
    `게시글을 ${operation}하시겠습니까?`,
    null,
    {
      actions: [{ label: operation }, modalActions.Cancel],
    }
  );
  if (response === modalResponses.Cancel) return;

  let error = false;
  let newThreadId;
  if (isEdited.value) {
    const apiName = isNewThread.value ? API.CreateThread : API.EditThread;

    let data = {
      board_id: Number(threadData.board),
      title: escapeString(threadData.title),
      content: escapeString(JSON.stringify(threadData.content)),
      occupation: threadData.occupation,
    };
    if (isNewThread.value) data.writer_id = Number(systemStore.currentUser.id);
    else data.id = Number(props.threadId);

    await execute(constructQuery({ name: apiName, args: data, fields: "id" }))
      .then(
        ({ data: response }) => (newThreadId = response.value.data[apiName].id)
      )
      .catch(async () => {
        error = true;
        await modalStore.showErrorMessage();
      });
  }

  if (!error) {
    intendedLeaving = true;
    router.replace({
      name: pages.ViewThread,
      params: {
        boardId: threadData.board,
        threadId: newThreadId ?? props.threadId,
      },
      meta: { leaving: true },
    });
  }
};

// const unloadEvent = () => {
//   editorStore.clearImages();
// };
const beforeunloadEvent = (event) => {
  if (intendedLeaving || canLeave.value) return;

  event.preventDefault();
  event.returnValue = "";
};
</script>

<style scoped>
.card {
  margin: 40px auto 20px auto;
  min-width: fit-content;
}
.select-board {
  flex: 0 0;
}
</style>
