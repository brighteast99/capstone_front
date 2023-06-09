<template>
  <custom-btn
    class="mt-5 pl-0 mb-1"
    @click="
      router.push({
        name: pages.ThreadList,
        params: { boardId: props.boardId },
      })
    "
  >
    <template v-slot:prepend>
      <v-icon icon="mdi-chevron-left"></v-icon>
    </template>
    게시글 목록
  </custom-btn>

  <v-card class="mx-auto mb-5">
    <v-card-title class="pa-5 pb-0">
      <span class="title">
        {{ thread.title }}<span class="board-name"> | {{ boardTitle }}</span>
      </span>
      <writer-info
        class="py-2"
        :writer="writer"
        :date="thread.date"
        :views="views"
      ></writer-info>

      <custom-btn
        v-if="isUsersThread || currentUser.is_staff"
        class="actions-btn"
        size="small"
      >
        <v-icon icon="mdi-dots-vertical"> </v-icon>

        <v-menu
          activator="parent"
          location="right"
          :open-on-hover="false"
          open-on-click
        >
          <v-sheet class="px-5 py-3">
            <custom-btn
              class="mb-1"
              @click="
                router.push({
                  name: pages.EditThread,
                  params: router.currentRoute.value.params,
                })
              "
            >
              게시글 수정
            </custom-btn>
            <custom-btn color="error" @click="deleteThread">
              게시글 삭제
            </custom-btn>
          </v-sheet>
        </v-menu>
      </custom-btn>
    </v-card-title>

    <v-card-text class="py-0 px-3">
      <text-editor v-model="thread.content" :edit-mode="false" />
    </v-card-text>

    <v-card-actions class="pa-5">
      <custom-btn
        color="error"
        :active="loggedIn && likes.state?.value"
        @click="toggleLike"
      >
        <v-icon icon="mdi-heart"></v-icon>
        <template v-slot:append>
          <div class="d-flex">
            <span class="thread-action-counter ml-1">좋아요</span>
            <v-slide-y-reverse-transition hide-on-leave>
              <p v-if="likes.state?.value" class="thread-action-counter">
                {{ likes.value + 1 }}
              </p>
            </v-slide-y-reverse-transition>
            <v-slide-y-transition hide-on-leave>
              <p v-if="!likes.state?.value" class="thread-action-counter">
                {{ likes.value }}
              </p>
            </v-slide-y-transition>
          </div>
        </template>
      </custom-btn>
      <custom-btn
        color="warning"
        :active="loggedIn && bookmarks.state?.value"
        @click="toggleBookmark"
      >
        <v-icon icon="mdi-star"></v-icon>
        <template v-slot:append>
          <div class="d-flex">
            <span class="thread-action-counter ml-1">관심</span>
            <v-slide-y-reverse-transition hide-on-leave>
              <p v-if="bookmarks.state?.value" class="thread-action-counter">
                {{ bookmarks.value + bookmarks.state?.value }}
              </p>
            </v-slide-y-reverse-transition>
            <v-slide-y-transition hide-on-leave>
              <p v-if="!bookmarks.state?.value" class="thread-action-counter">
                {{ bookmarks.value }}
              </p>
            </v-slide-y-transition>
          </div>
        </template>
      </custom-btn>
    </v-card-actions>
  </v-card>

  <v-card class="mx-auto mb-5 pa-3">
    <v-card-title class="d-flex align-baseline">
      <p class="comment-title">댓글&nbsp;</p>
      <div class="d-flex align-center">
        <v-icon
          class="mr-1"
          icon="mdi-comment-text-outline"
          size="x-small"
        ></v-icon>
        {{ comments_count }}
      </div>
    </v-card-title>
    <v-card-text>
      <comment-editor :threadId="props.threadId" @comment-created="addComments">
      </comment-editor>

      <v-divider class="my-3"></v-divider>

      <div
        v-if="commentState.isLoading"
        class="d-flex flex-column text-h6 justify-center align-center text-disabled"
        style="height: 150px"
      >
        <v-icon class="mdi-spin" icon="mdi-loading" size="50"> </v-icon>
      </div>
      <div
        v-else-if="commentState.error"
        class="d-flex align-center justify-center text-h6 text-center text-disabled"
        style="height: 150px"
      >
        댓글을 불러오는 데 실패했습니다. <br />
        나중에 다시 시도하거나 관리자에게 문의 바랍니다.
      </div>
      <div
        v-else-if="!comments?.length"
        class="d-flex align-center justify-center text-h6 text-center text-disabled"
        style="height: 150px"
      >
        아직 댓글이 없습니다. <br />
        첫 번째 댓글을 남겨보세요!
      </div>

      <div v-else>
        <div v-for="comment in comments" :key="comment">
          <comment-card
            :comment="comment"
            :threadId="props.threadId"
            @updated="updateComments"
            @deleted="deleteComment"
            @reply-created="addComments"
          >
          </comment-card>
          <comment-card
            v-for="reply in comment.replies"
            :key="reply"
            :comment="reply"
            @updated="updateComments"
            @deleted="deleteComment"
          >
          </comment-card>
          <v-divider class="my-2"></v-divider>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import WriterInfo from "@/components/WriterInfo.vue";
import TextEditor from "@/components/TextEditor.vue";
import CustomBtn from "@/components/CustomBtn.vue";
import CommentEditor from "@/components/CommentEditor.vue";
import CommentCard from "@/components/CommentCard.vue";

import { ref, reactive, computed, defineProps, onBeforeMount } from "vue";
import router, { pages } from "@/router";
import { useSystemStore, useModalStore } from "@/store";
import {
  modalPresets,
  modalResponses,
  modalActions,
} from "@/store/modal.store";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";
import {
  countActiveComments,
  createToggle,
  formatDateRelative,
  parseJSON,
} from "@/modules/utility";
import { useDebounceFn } from "@vueuse/core";
import { storeToRefs } from "pinia";

// Pinia storage
const systemStore = useSystemStore();
const { currentUser, loggedIn } = storeToRefs(systemStore);
const modalStore = useModalStore();

// Data
const boardTitle = ref("");
const thread = reactive({
  title: "",
  content: null,
  date: "",
});
const writer = reactive({
  id: null,
  name: null,
});
const isUsersThread = computed(() => systemStore.currentUser.id == writer.id);
const views = ref(0);
const likes = reactive({
  state: null,
  value: null,
});
const bookmarks = reactive({
  state: null,
  value: null,
});

const commentState = reactive({
  isLoading: true,
  error: false,
});
const comments = reactive([]);
const comments_count = computed(() => countActiveComments(comments));

// Props
const props = defineProps({
  boardId: String,
  threadId: String,
});

// Hooks
onBeforeMount(() => {
  const api = new apiRequest();

  api
    .push(API.GetThread, { id: Number(props.threadId) }, [
      { user: ["id", "name"] },
      { board: "title" },
      "id",
      "title",
      "content",
      "occupation",
      "date_created",
      "date_updated",
      "views",
      "likes",
    ])
    .push(
      API.GetThreadActions,
      {
        user_id: Number(systemStore.currentUser.id),
        thread_id: Number(props.threadId),
      },
      ["is_like", "is_favorite"]
    )
    .send()
    .then(parseResponse)
    .then((response) => {
      const threadData = response[API.GetThread];

      boardTitle.value = threadData.board.title;

      thread.title = threadData.title;
      thread.content = parseJSON(threadData.content);
      thread.date += formatDateRelative(threadData.date_created, {
        max_unit: "days",
        date_updated: threadData.date_updated,
      });
      Object.assign(writer, threadData.user);

      views.value = threadData.views;
      const actions = response[API.GetThreadActions];
      likes.state = createToggle(actions?.is_like ?? false);
      likes.value = threadData.likes;
      if (likes.state.value) likes.value -= 1;
      bookmarks.state = createToggle(actions?.is_favorite ?? false);
      // TODO
      bookmarks.value = 0;
      // if (bookmarks.state.value) bookmarks.value -= 1;

      if (systemStore.readThread(props.threadId)) views.value += 1;
    })
    .catch(() => router.replace({ name: pages.ServerError }));

  api
    .execute(API.GetComments, { thread_id: Number(props.threadId) }, [
      "id",
      { user: ["id", "name"] },
      "date_created",
      "date_updated",
      "content",
      "is_deleted",
      {
        replies: [
          "id",
          { user: ["id", "name"] },
          "date_created",
          "date_updated",
          "content",
          "is_deleted",
          { parent_comment: "id" },
        ],
      },
      { parent_comment: "id" },
    ])
    .then(parseResponse)
    .then((response) => {
      comments.push(
        ...response[API.GetComments].filter(
          (comment) => !comment.parent_comment
        )
      );
    })
    .catch(() => (commentState.error = true))
    .finally(() => (commentState.isLoading = false));
});

// Methods
const deleteThread = async () => {
  const response = await modalStore.openModal(
    "게시글을 삭제합니다.\n삭제된 글은 복구할 수 없습니다.",
    null,
    {
      actions: [modalActions.Delete, modalActions.SafeCancel],
    }
  );
  if (response === modalResponses.Cancel) return;

  new apiRequest()
    .execute(API.DeleteThread, { id: Number(props.threadId) })
    .then(parseResponse)
    .then(async (response) => {
      if (!response[API.DeleteThread]) throw new Error();
      await modalStore.openModal("게시글이 삭제되었습니다.", null, {
        actions: modalPresets.OK,
      });
      router.push({
        name: pages.ThreadList,
        params: { boardId: props.boardId },
        replace: true,
      });
    })
    .catch(modalStore.showErrorMessage);
};
const updateLike = useDebounceFn(() => {
  new apiRequest()
    .execute(API.UpdateThreadActions, {
      user_id: Number(systemStore.currentUser.id),
      thread_id: Number(props.threadId),
      is_cancel: !likes.state?.value,
      option: "like",
    })
    .then(parseResponse)
    .then((response) => {
      if (!response[API.UpdateThreadActions]) throw new Error();
    })
    .catch(modalStore.showErrorMessage);
}, 250);
const toggleLike = () => {
  if (!loggedIn.value) {
    modalStore.showNeedLoginMessage();
    return;
  }

  likes.state?.toggle();
  updateLike();
};
const updateBookmark = useDebounceFn(() => {
  new apiRequest()
    .execute(API.UpdateThreadActions, {
      user_id: Number(systemStore.currentUser.id),
      thread_id: Number(props.threadId),
      is_cancel: !bookmarks.state?.value,
      option: "favorite",
    })
    .then(parseResponse)
    .then((response) => {
      if (!response[API.UpdateThreadActions]) throw new Error();
    })
    .catch(modalStore.showErrorMessage);
}, 250);
const toggleBookmark = () => {
  if (!loggedIn.value) {
    modalStore.showNeedLoginMessage();
    return;
  }

  bookmarks.state?.toggle();
  updateBookmark();
};
const addComments = (newComment) => {
  if (!newComment.parent_comment) {
    comments.push(newComment);
    return;
  }

  comments
    .find((comment) => comment.id == newComment.parent_comment)
    .replies.push(newComment);
};
const updateComments = (commentData) => {
  for (const comment of comments) {
    if (comment.id == commentData.id) {
      comment.content = commentData.content;
      comment.date_updated = new Date();
      return;
    }
    for (const reply of comment.replies) {
      if (reply.id == commentData.id) {
        reply.content = commentData.content;
        reply.date_updated = new Date();
        return;
      }
    }
  }
};
const deleteComment = (id) => {
  for (const comment of comments) {
    if (comment.id == id) {
      comment.is_deleted = true;
      return;
    }
    for (const reply of comment.replies)
      if (reply.id == id) {
        reply.is_deleted = true;
        return;
      }
  }
};
</script>

<style scoped>
.select-board {
  flex: 0 0;
}
.title {
  font-size: 1.6em;
}

.board-name {
  font-size: 0.6em;
  color: gray;
}
.actions-btn {
  position: absolute;
  padding: 0;
  top: 0.5em;
  right: 1em;
}

.thread-action-counter {
  text-align: center;
  font-size: 0.8em;
  margin-left: 0.5em;
}

.comment-title {
  font-size: 1.2em;
}
.comment-counter {
  font-size: 1em;
  padding-left: 0.2em;
}
</style>
