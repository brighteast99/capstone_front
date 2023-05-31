<template>
  <custom-btn
    class="mt-5 pl-0 mb-1"
    @click="
      router.push({
        name: pages.PostList,
        params: { boardId: props.boardId },
      })
    "
  >
    <template v-slot:prepend>
      <v-icon icon="mdi-chevron-left"></v-icon>
    </template>
    {{ props.boardId }}
  </custom-btn>

  <v-card class="mx-auto mb-5 pa-3" :class="{ 'mt-10': isEditmode }">
    <v-card-title class="pb-0">
      <div class="d-flex flex-column">
        <span class="title mb-3">{{ postData.title }}</span>
        <p class="info-area">
          <span> 작성자: </span>
          <custom-btn
            weight="bold"
            :to="{
              name: pages.UserInfo,
              params: { userId: writerData.id },
            }"
          >
            {{ writerData.name }}
          </custom-btn>
          <v-spacer></v-spacer>
          <span class="mr-3">{{ `작성일: ${date}` }} </span>
          <span v-if="postData.modifyDate">
            {{ `최종 수정일: ${modifyDate}` }}
          </span>
        </p>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-0">
      <text-editor v-model="postData.content" :edit-mode="false" />
    </v-card-text>

    <v-card-actions v-if="isUsersPost">
      <v-spacer> </v-spacer>
      <custom-btn @click="startEdit">수정</custom-btn>
      <custom-btn color="error" @click="deletePost">삭제</custom-btn>
    </v-card-actions>
  </v-card>

  <v-card v-if="!isEditmode" class="mx-auto mb-5 pa-3">
    <v-card-title>
      <p class="comment-title">
        {{ comments.length > 0 ? `${comments.length}개의 댓글` : "댓글" }}
      </p>
    </v-card-title>
    <v-card-text>
      <v-form
        ref="commentForm"
        style="display: flex; height: 80px"
        @submit.prevent="registerComment"
      >
        <v-textarea
          color="primary"
          rows="2"
          no-resize
          v-model="comment"
        ></v-textarea>
        <v-btn
          type="submit"
          class="rounded-s-0"
          variant="flat"
          color="primary"
          height="100%"
        >
          등록
        </v-btn>
      </v-form>
      <div
        v-if="!comments"
        class="d-flex align-center justify-center text-h6 text-center text-grey"
        style="height: 150px"
        placeholder="이용규칙을 위반한 댓글은 경고 없이 삭제될 수 있습니다."
      >
        아직 댓글이 없습니다. <br />
        첫 번째 댓글을 남겨보세요!
      </div>
      <div v-else>
        <!-- TODO: 댓글 컴포넌트 -->
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import TextEditor from "@/components/TextEditor.vue";
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
import router, { pages } from "@/router";
import { useSystemStore, useTextEditor, useModalStore } from "@/store";
import {
  modalPresets,
  modalResponses,
  modalActions,
} from "@/store/modal.store";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";

// Pinia storage
const systemStore = useSystemStore();
const editorStore = useTextEditor();
const modalStore = useModalStore();

// Components
const commentForm = ref(null);

// Data
let intendedLeaving = false;
const isEditmode = computed(
  () =>
    router.currentRoute.value.name === pages.EditPost ||
    router.currentRoute.value.name === pages.NewPost
);
const isEdited = computed(
  () =>
    postData_backup.title !== postData.title ||
    JSON.stringify(postData_backup.content) !== JSON.stringify(postData.content)
);
const canLeave = computed(() => {
  return !systemStore.loggedIn || !isEditmode.value || !isEdited.value;
});
const isUsersPost = computed(() => systemStore.currentUser.id == writerData.id);
const writerData = reactive({
  id: null,
  name: null,
  email: null,
});
const postData = reactive({
  title: "",
  date: null,
  modifyDate: null,
  content: null,
});
let postData_backup = {};
const date = computed(() => new Date(postData.date).toLocaleDateString());
const modifyDate = computed(() => {
  if (!postData.modifyDate) return null;
  return new Date(postData.modifyDate).toLocaleDateString();
});

const comments = reactive([]);
const comment = ref("");

// Props
const props = defineProps({
  boardId: String,
  postId: String,
});

// Hooks
onBeforeMount(() => {
  if (props.postId) {
    new apiRequest()
      .push(API.GetPost, { id: Number(props.postId) }, [
        "id",
        "user {id name email}",
        "title",
        "content",
        "occupation",
        "date_created",
        "date_updated",
        "views",
        "likes",
      ])
      .send()
      .then(parseResponse)
      .then((response) => {
        const post = response[API.GetPost];

        postData.title = post.title;
        Object.assign(writerData, post.user);
        postData.date = post.date_created;
        postData.modifyDate = post.date_updated;

        postData.content = JSON.parse(post.content);
      })
      .catch(() => {
        /**
         * TODO: 게시글 찾을 수 없을 때 처리
         */
      });
    postData_backup.title = postData.title;
    postData_backup.content = postData.content;
  } else writerData.id = systemStore.currentUser.id;

  if (isEditmode.value) {
    window.addEventListener("beforeunload", beforeunloadEvent);
    window.addEventListener("unload", unloadEvent);
  }
});

// Navigation guards
onBeforeUnmount(() => {
  if (isEditmode.value) {
    window.removeEventListener("beforeunload", beforeunloadEvent);
    window.removeEventListener("unload", unloadEvent);
  }
});
onBeforeRouteLeave(async (to, from, next) => {
  if (intendedLeaving || canLeave.value) return next();

  let confirm = await modalStore.openModal(
    `페이지를 벗어나시겠습니까?\n${
      router.currentRoute.value.name == pages.EditPost ? "수정" : "작성"
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

  if (confirm === modalResponses.Yes) return next();
  else next(false);
});
onBeforeRouteUpdate(async () => {
  if (intendedLeaving || canLeave.value) return true;

  const operation = props.postId ? "수정" : "작성";
  return (
    (await modalStore.openModal(
      `페이지를 새로고침하시겠습니까?\n${operation}중인 내용은 저장되지 않습니다.`,
      null,
      {
        actions: [
          {
            label: "새로고침",
            response: modalResponses.Yes,
            color: "error",
          },
          { label: "취소", color: "black" },
        ],
      }
    )) === modalResponses.Yes
  );
});

// Methods
const startEdit = async () => {
  router.push({
    name: pages.EditPost,
    params: router.currentRoute.value.params,
  });
};
const deletePost = async () => {
  if (
    (await modalStore.openModal(
      "게시글을 삭제합니다.\n삭제된 글은 복구할 수 없습니다.",
      null,
      {
        actions: [
          {
            label: "삭제",
            color: "error",
          },
          {
            label: "취소",
            response: modalResponses.Cancel,
            color: "black",
          },
        ],
      }
    )) === modalResponses.Cancel
  )
    return;

  /**
   * TODO: 게시물 삭제 및 확인 모달
   */

  // 삭제 성공시
  {
    await modalStore.openModal("게시글이 삭제되었습니다.", null, {
      actions: modalPresets.OK,
    });
    router.push({
      name: pages.PostList,
      params: { boardId: props.boardId },
    });
  }
  //삭제 실패시
  // {
  //   await modalStore.openModal(
  //     "삭제에 실패했습니다.\n다시 시도하거나 관리자에게 문의 바랍니다.",
  //     null,
  //     { actions: modalPresets.OK }
  //   );
  // }
};
const registerComment = () => {
  /**
   * TODO 댓글 등록 -> 컴포넌트 분리?
   */
};

const unloadEvent = () => {
  editorStore.clearImages();
};
const beforeunloadEvent = (event) => {
  if (intendedLeaving || canLeave.value) return;

  event.preventDefault();
  event.returnValue = "";
};
</script>

<style scoped>
.select-board {
  flex: 0 0;
}
.title {
  font-size: 1.5em;
}
.info-area {
  display: flex;
  font-size: 0.7em;
  color: gray;
  font-weight: 300;
}

.comment-title {
  font-size: 1.2em;
}
</style>
