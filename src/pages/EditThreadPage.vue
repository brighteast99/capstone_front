<template>
  <v-card class="card">
    <v-card-title class="pa-5 pt-10 pb-0 d-flex align-center position-relative">
      <custom-dropdown
        class="select-board"
        v-model="threadData.board"
        :items="boardList"
        item-value="id"
      >
      </custom-dropdown>
      <v-text-field
        class="title"
        v-model="threadData.title"
        placeholder="제목 (30자 이내)"
        variant="underlined"
        color="primary"
        autofocus
        hide-details
        density="compact"
        :rules="[() => validTitle]"
        @update:focused="
          if (!event) threadData.title = threadData.title.trim();
        "
      ></v-text-field>
      <span
        class="counter text-disabled"
        :class="{ 'text-error': displayValidity && !validTitle }"
      >
        {{ `${threadData.title.length} / 30` }}
      </span>
    </v-card-title>

    <v-card-text class="py-0">
      <text-editor v-model="threadData.content" :edit-mode="true" />

      <v-divider class="my-3"></v-divider>

      <recruitment-editor
        v-model="threadData.recruits"
        :existing="threadData_backup.recruits.length > 0"
      ></recruitment-editor>
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
        @click="submit"
      >
        {{ props.threadId ? "수정" : "등록" }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import CustomDropdown from "@/components/CustomDropdown.vue";
import TextEditor from "@/components/TextEditor.vue";
import recruitmentEditor from "@/components/RecruitmentEditor.vue";
import CustomBtn from "@/components/CustomBtn.vue";

import {
  ref,
  reactive,
  computed,
  defineProps,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import router, { pages, safeBack } from "@/router";
import { useSystemStore, useModalStore } from "@/store";
import {
  modalPresets,
  modalResponses,
  modalActions,
} from "@/store/modal.store";
import { API, apiRequest, parseResponse, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { escapeString, extractText, parseJSON } from "@/modules/utility";
import { useCloned, watchOnce } from "@vueuse/core";

// Pinia storage
const systemStore = useSystemStore();
// const editorStore = useTextEditor();
const modalStore = useModalStore();

// Data
let intendedLeaving = false;
const isNewThread = computed(() => router.currentRoute.value.meta.newThread);
const isEdited = computed(
  () => JSON.stringify(threadData_backup.value) !== JSON.stringify(threadData)
);
const canLeave = computed(() => !systemStore.loggedIn || !isEdited.value);
const boardList = reactive([]);
const threadData = reactive({
  board: null,
  title: "",
  content: null,
  recruits: [],
});
const { cloned: threadData_backup, sync: backup } = useCloned(threadData);
const validTitle = computed(
  () => (threadData.title.length > 0 && threadData.title.length <= 30) || ""
);
const displayValidity = ref(false);

// Props
const props = defineProps({
  boardId: String,
  threadId: String,
});

// Hooks
onBeforeMount(async () => {
  if (!systemStore.loggedIn) {
    const response = await modalStore.showNeedLoginMessage();

    intendedLeaving = true;
    if (response === "Login")
      return router.push({
        name: pages.Login,
        query: { redirect: router.currentRoute.value.fullPath },
      });
    return safeBack();
  }

  fetchData();

  window.addEventListener("beforeunload", beforeunloadEvent);
  // window.addEventListener("unload", unloadEvent);
});
onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeunloadEvent);
  // window.removeEventListener("unload", unloadEvent);
});
onBeforeRouteLeave(async (to, from, next) => {
  if (intendedLeaving || canLeave.value) return next(true);

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
  if (intendedLeaving || canLeave.value) return next(true);

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

// Watch
watchOnce(validTitle, () => (displayValidity.value = true));

// Methods
const fetchData = () => {
  const api = new apiRequest();

  // /게시판 목록
  api.push(API.GetBoards, null, ["id", "title", "board_type"]);

  // 게시판 권한 확인용
  if (isNewThread.value)
    api.push(API.GetBoard, { id: Number(props.boardId) }, "board_type");
  // 기존 게시글 정보
  else
    api
      .push(API.GetThread, { id: Number(props.threadId) }, [
        { user: "id" },
        { board: "id" },
        "is_deleted",
        "title",
        "content",
      ])
      .push(API.GetRecruitments, { thread_id: Number(props.threadId) }, [
        "id",
        { occupation: ["id", "name"] },
        "current_cnt",
        "max_cnt",
        "is_closed",
        "is_stopped",
      ]);

  api
    .send()
    .then(parseResponse)
    .then((response) => {
      const boards = response[API.GetBoards];
      if (!boards) throw new Error();
      if (systemStore.currentUser.is_staff) boardList.push(...boards);
      else
        boardList.push(
          ...boards.filter((board) => board.board_type != "SPECIAL")
        );

      // Guards
      if (isNewThread.value) {
        const boardData = response[API.GetBoard];
        if (!boardData) throw "noSuchBoard";
        if (
          boardData.board_type == "SPECIAL" &&
          !systemStore.currentUser.is_staff
        )
          throw "noPermission";
        threadData.board = props.boardId;
      } else {
        const loadedThread = response[API.GetThread];
        if (!loadedThread || loadedThread.is_deleted) throw "noSuchThread";
        if (loadedThread.board.id != props.boardId)
          router.replace({
            name: pages.EditThread,
            params: {
              boardId: loadedThread.board.id,
              threadId: props.threadId,
            },
          });

        if (
          loadedThread.user.id != systemStore.currentUser.id &&
          !systemStore.currentUser.is_staff
        )
          throw "noPermission";

        // Fetch data
        loadedThread.board = loadedThread.board.id;
        loadedThread.content = parseJSON(loadedThread.content);
        loadedThread.recruits = parseJSON(response[API.GetRecruitments]);
        Object.assign(threadData, loadedThread);
      }
      backup();
    })
    .catch((err) => {
      intendedLeaving = true;
      switch (err) {
        case "noSuchBoard":
          return modalStore
            .openModal("존재하지 않는 게시판입니다.", null, {
              actions: modalPresets.OK,
            })
            .then(safeBack);
        case "noSuchThread":
          return modalStore
            .openModal("존재하지 않는 게시글입니다.", null, {
              actions: modalPresets.OK,
            })
            .then(safeBack);
        case "noPermission":
          return modalStore.showNoPermissionMessage().then(() =>
            safeBack({
              defaultRoute: isNewThread.value
                ? {
                    name: pages.ThreadList,
                    params: { boardId: props.boardId },
                    replace: true,
                  }
                : {
                    name: pages.ViewThread,
                    params: {
                      boardId: props.boardId,
                      threadId: props.threadId,
                    },
                    replace: true,
                  },
            })
          );
        default:
          return modalStore.showErrorMessage().then(safeBack);
      }
    });
};
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
const submit = async () => {
  const operation = isNewThread.value ? "등록" : "수정";

  if (threadData.title.length == 0)
    return modalStore.openModal("제목이 필요합니다.", null, {
      actions: modalPresets.OK,
    });

  if (threadData.title.length > 30)
    return modalStore.openModal("제목은 30자 이내여야 합니다.", null, {
      actions: modalPresets.OK,
    });

  if (extractText(threadData.content).length == 0)
    return modalStore.openModal("내용이 필요합니다.", null, {
      actions: modalPresets.OK,
    });

  let message;
  if (
    !threadData.recruits.length ||
    threadData.recruits.every((recruit) => recruit.excluded)
  )
    message = `모집 직군을 명시하지 않고 ${operation}을 마치시겠습니까?`;
  else message = `게시글을 ${operation}하시겠습니까?`;

  const response = await modalStore.openModal(message, null, {
    actions: [{ label: operation }, modalActions.No],
  });
  if (response === modalResponses.No) return;

  let error = false;
  let newThreadId;
  if (isEdited.value) {
    // Submit thread data
    const apiName = isNewThread.value ? API.CreateThread : API.EditThread;

    let data = {
      board_id: Number(threadData.board),
      title: escapeString(threadData.title),
      content: escapeString(JSON.stringify(threadData.content)),
      occupation: threadData.recruits,
    };
    if (isNewThread.value) data.writer_id = Number(systemStore.currentUser.id);
    else data.id = Number(props.threadId);

    try {
      await execute(constructQuery({ name: apiName, args: data, fields: "id" }))
        .then(parseResponse)
        .then((response) => (newThreadId = response[apiName].id));

      // Submit recruitment data
      const toCreate = threadData.recruits
        .filter((recruit) => recruit.id == null)
        .map((recruit) => {
          return { id: recruit.occupation.id, count: recruit.max_cnt };
        });
      const toWithdraw = threadData.recruits
        .filter((recruit) => recruit.excluded)
        .map((recruit) => recruit.id);
      const toRevert = threadData.recruits
        .filter((recruit) => recruit.revert)
        .map((recruit) => recruit.id);
      const toUpdate = threadData.recruits
        .filter(
          (recruit) =>
            recruit.id != null &&
            !(recruit.excluded || (recruit.is_stopped && !recruit.revert))
        )
        .map((recruit) => {
          return { id: recruit.occupation.id, count: recruit.max_cnt };
        });
      const toCloseManually = threadData.recruits
        .filter(
          (recruit) =>
            recruit.max_cnt > recruit.current_cnt &&
            recruit.is_closed &&
            !(recruit?.excluded || (recruit.is_stopped && !recruit?.revert))
        )
        .map((recruit) => {
          return { id: recruit.id, occupation_id: recruit.occupation.id };
        });

      let queries = [];
      if (toWithdraw.length)
        for (const id of toWithdraw)
          queries.push({
            name: API.WithdrawRecruitment,
            args: {
              recruitment_id: Number(id),
            },
          });
      if (toRevert.length)
        for (const id of toRevert)
          queries.push({
            name: API.RevertWithdrawnRecruitment,
            args: { id: Number(id) },
          });
      if (toUpdate.length)
        queries.push({
          name: API.UpdateRecruitments,
          args: {
            thread_id: Number(newThreadId ?? props.threadId),
            inputs: JSON.stringify(JSON.stringify(toUpdate)),
          },
        });
      if (toCreate.length)
        queries.push({
          name: API.CreateRecruitments,
          args: {
            thread_id: Number(newThreadId ?? props.threadId),
            inputs: JSON.stringify(JSON.stringify(toCreate)),
          },
          fields: ["id", { occupation: "id" }],
        });

      await execute(constructQuery(queries))
        .then(parseResponse)
        .then((response) => {
          if (toWithdraw.length == 1 && !response[API.WithdrawRecruitment])
            throw new Error();
          if (
            toRevert.length > 1 &&
            response[API.WithdrawRecruitment]?.some((value) => !value)
          )
            throw new Error();

          if (toRevert.length == 1 && !response[API.RevertWithdrawnRecruitment])
            throw new Error();
          if (
            toRevert.length > 1 &&
            response[API.RevertWithdrawnRecruitment]?.some((value) => !value)
          )
            throw new Error();

          if (toUpdate.length && !response[API.UpdateRecruitments])
            throw new Error();

          if (toCreate.length && toCloseManually.length) {
            if (!response[API.CreateRecruitments]) throw new Error();
            for (const created of response[API.CreateRecruitments]) {
              toCloseManually.find(
                (recruitment) =>
                  recruitment.occupation_id == created.occupation.id
              ).id = created.id;
            }
          }
        });

      queries = [];
      if (toCloseManually.length) {
        for (const recruitment of toCloseManually) {
          queries.push({
            name: API.CloseRecruitment,
            args: { id: Number(recruitment.id) },
          });
        }

        execute(constructQuery(queries))
          .then(parseResponse)
          .then((response) => {
            if (toCloseManually.length == 1 && !response[API.CloseRecruitment])
              throw new Error();
            if (
              toCloseManually.length > 1 &&
              response[API.CloseRecruitment]?.some((value) => !value)
            )
              throw new Error();
          });
      }
    } catch (err) {
      console.log(err);
      error = true;
      modalStore.showErrorMessage(
        err || "모집 직군 설정 중 오류가 발생했습니다"
      );
    }
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
  flex: 0.2 0;
  margin-top: -20px;
  margin-bottom: 16px;
}
.title {
  flex: 0.8 1;
  margin-top: -26px;
  margin-bottom: 16px;
}
.counter {
  position: absolute;
  right: 1.5em;
  top: 1.8em;
  font-size: 0.7em;
}
</style>
