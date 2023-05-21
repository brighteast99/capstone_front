<template>
  <custom-btn
    v-if="!isEditmode && props.postId"
    class="mt-5 pl-0 mb-1"
    @click="
      router.push({
        name: pages.PostList.name,
        params: { boardId: props.boardId },
      })
    "
  >
    <template v-slot:prepend>
      <v-icon icon="mdi-chevron-left"></v-icon>
    </template>
    {{ " 게시글 목록으로" }}
  </custom-btn>
  <v-card class="mx-auto mb-5 pa-3" :class="{ 'mt-10': isEditmode }">
    <template v-if="isEditmode">
      <v-card-title class="pa-5 pb-0">
        <v-text-field
          class="mt-n7 mb-4"
          placeholder="글 제목"
          variant="underlined"
          color="primary"
          autofocus
          hide-details
          v-model="postData.title"
        ></v-text-field>
      </v-card-title>

      <v-card-text class="py-0">
        <text-editor v-model="postData.content" :editable="true" />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <custom-btn class="mr-3" color="error" @click="cancel">
          돌아가기
        </custom-btn>
        <v-btn variant="flat" color="primary" @click="post">
          {{ props.postId ? "수정" : "등록" }}
        </v-btn>
      </v-card-actions>
    </template>

    <template v-else>
      <v-card-title class="pb-0">
        <div class="d-flex flex-column">
          <span class="title mb-3">{{ postData.title }}</span>
          <p class="info-area">
            <span> 작성자: </span>
            <custom-btn
              weight="bold"
              :to="{
                name: pages.UserInfo.name,
                params: { userId: postData.writer?.id },
              }"
            >
              {{ postData.writer?.name }}
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
        <text-editor v-model="postData.content" :editable="false" />
      </v-card-text>

      <v-card-actions v-if="isUsersPost">
        <v-spacer> </v-spacer>
        <custom-btn @click="startEdit">수정</custom-btn>
        <custom-btn color="error" @click="deletePost">삭제</custom-btn>
      </v-card-actions>
    </template>
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
        v-if="comments.length == 0"
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
  onMounted,
  onBeforeUnmount,
} from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import router, { pages } from "@/router";
import {
  useDevelopStore,
  useSystemStore,
  useTextEditor,
  useModalStore,
} from "@/store";
import {
  modalPresets,
  modalResponses,
  modalActions,
} from "@/store/modal.store";

// Pinia storage
const systemStore = useSystemStore();
const editorStore = useTextEditor();
const developStore = useDevelopStore();
const modalStore = useModalStore();

// Components
const commentForm = ref(null);

// Data
let intendedLeaving = false;
const isEditmode = computed(
  () =>
    router.currentRoute.value.name === pages.EditPost.name ||
    router.currentRoute.value.name === pages.NewPost.name
);
const isEdited = computed(
  () =>
    postData_backup.title !== postData.title ||
    JSON.stringify(postData_backup.content) !== JSON.stringify(postData.content)
);
const canLeave = computed(() => {
  return !systemStore.loggedIn || !isEditmode.value || !isEdited.value;
});
const isUsersPost = computed(
  () => systemStore.currentUser.id == postData.writer?.id
);
const postData = reactive({
  writer: {
    id: null,
    name: null,
    email: null,
  },
  title: "",
  date: null,
  modifyDate: null,
  content: undefined,
});
let postData_backup = {
  title: "",
  content: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
      },
    ],
  },
};
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
onMounted(() => {
  if (props.postId) {
    /**
     * TODO 서버에서 게시글 불러오기. 자기 글인지 체크해서 수정중이면 나가리, 아니면 state에 글 정보 저장
     */
    Object.assign(postData, developStore.postData);
  } else Object.assign(postData.writer, systemStore.currentUser);
  postData_backup.title = postData.title;
  postData_backup.content = postData.content;

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
      router.currentRoute.value.name == pages.EditPost.name ? "수정" : "작성"
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
    name: pages.EditPost.name,
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
      name: pages.PostList.name,
      params: { boardId: props.boardId },
    });
  }
  //삭제 실패시
  // {
  //   await modalStore.openModal(
  //     "삭제에 실패했습니다.\n다시 시도하거나 관리자에게 문의해주세요.",
  //     null,
  //     { actions: modalPresets.OK }
  //   );
  // }
};
const cancel = async () => {
  if (!canLeave.value) {
    const operation = props.postId ? "수정" : "작성";
    if (
      (await modalStore.openModal(
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
      )) === modalResponses.Cancel
    )
      return;
  }

  intendedLeaving = true;
  if (props.postId)
    router.push({
      name: pages.ViewPost.name,
      params: router.currentRoute.value.params,
    });
};
const post = async () => {
  const operation = props.postId ? "수정" : "등록";

  // If no content in new post
  if (
    !props.postId &&
    (postData.title.trim().length == 0 ||
      JSON.stringify(postData.content) ==
        JSON.stringify(postData_backup.content))
  )
    return await modalStore.openModal("제목과 내용이 필요합니다.", null, {
      actions: modalPresets.OK,
    });

  if (
    (await modalStore.openModal(`게시글을 ${operation}하시겠습니까?`, null, {
      actions: [{ label: operation }, modalActions.Cancel],
    })) === modalResponses.Cancel
  )
    return;

  if (isEdited.value) {
    postData[props.postId ? "modifyDate" : "date"] = Date.now();
    /**
     * TODO 게시물 서버 저장
     */

    developStore.updatePost(postData);
  }

  // 게시물 등록 성공
  {
    const postId = 1234; //서버에서 받아온 postId;
    intendedLeaving = true;
    router.replace({
      name: pages.ViewPost.name,
      params: { boardId: props.boardId, postId: props.postId ?? postId },
    });
  }
  //등록 실패
  // {
  //   await modalStore.openModal(
  //     `게시물 ${operation}에 실패하였습니다.\n다시 시도하거나 관리자에게 문의해주세요.`,
  //      null,
  //     `${operation} 실패`,
  //     { actions: actionPresets.OK }
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
