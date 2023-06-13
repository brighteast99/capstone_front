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
  <!-- Thread -->

  <v-card ref="threadArea" class="mx-auto mb-5">
    <!-- Title & Info -->
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

      <dot-menu v-if="isUsersThread || currentUser.is_staff">
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
      </dot-menu>
    </v-card-title>

    <!-- Content -->
    <v-card-text class="py-0 px-3">
      <text-editor v-model="thread.content" :edit-mode="false" />
      <recruitment-viewer
        :loading="loadingRecruitments"
        :error="failedLoadingRecruitments"
        :recruitments="recruitments"
        :owner="isUsersThread"
        @chip:click="recruitInfoClicked($event)"
      ></recruitment-viewer>
    </v-card-text>

    <v-card-actions class="pa-5">
      <!-- Likes -->
      <custom-btn
        color="error"
        :active="likes.state?.value"
        prepend-icon="mdi-heart"
        @click="toggleLike"
      >
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
      </custom-btn>
      <!-- Favorites -->
      <custom-btn
        color="warning"
        :active="favorites.state?.value || (isUsersThread && favorites.value)"
        prepend-icon="mdi-star"
        @click="toggleFavorite"
      >
        <div class="d-flex">
          <span class="thread-action-counter ml-1">관심</span>
          <v-slide-y-reverse-transition hide-on-leave>
            <p
              v-if="!isUsersThread && favorites.state?.value"
              class="thread-action-counter"
            >
              {{ favorites.value + favorites.state?.value }}
            </p>
          </v-slide-y-reverse-transition>
          <v-slide-y-transition hide-on-leave>
            <p
              v-if="isUsersThread || !favorites.state?.value"
              class="thread-action-counter"
            >
              {{ favorites.value }}
            </p>
          </v-slide-y-transition>
        </div>
        <v-tooltip v-if="isUsersThread" activator="parent">
          관심 등록 현황 보기
        </v-tooltip>
      </custom-btn>
      <v-spacer></v-spacer>
      <custom-btn
        v-if="threadHeight > netWindowHeight * 2"
        size="small"
        @click="scrollY"
      >
        맨 위로
      </custom-btn>
    </v-card-actions>
  </v-card>

  <!-- Comments -->
  <v-card ref="commentArea" class="mx-auto mb-5 pa-3">
    <v-card-title class="d-flex align-center">
      <p class="comment-title">댓글</p>

      <v-icon
        end
        class="mr-1"
        icon="mdi-comment-text-outline"
        size="x-small"
      ></v-icon>
      {{ countActiveComment }}

      <custom-btn size="small" @click="toggleComment()">
        <span class="align-baseline">{{
          displayComment ? "접기" : "펼치기"
        }}</span>
      </custom-btn>
    </v-card-title>

    <v-card-text v-if="loggedIn">
      <comment-editor :threadId="threadId" @comment-created="addComments">
      </comment-editor>
    </v-card-text>

    <v-expand-transition>
      <v-card-text v-if="displayComment" class="py-0">
        <v-divider class="my-3"></v-divider>

        <error-block v-if="loadingComments" height="150">
          <v-icon class="mdi-spin" icon="mdi-loading" size="50"> </v-icon>
        </error-block>
        <error-block v-else-if="failedLoadingComments" height="150">
          댓글을 불러오지 못했습니다. <br />
          나중에 다시 시도하거나 관리자에게 문의 바랍니다.
        </error-block>
        <error-block v-else-if="!comments?.length" height="150">
          아직 댓글이 없습니다. <br />
          <span v-if="loggedIn">첫 번째 댓글을 남겨보세요!</span>
        </error-block>

        <div v-else>
          <div v-for="comment in comments" :key="comment">
            <comment-card
              :comment="comment"
              :threadId="threadId"
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
    </v-expand-transition>
    <v-expand-transition>
      <v-card-actions
        v-if="commentHeight > netWindowHeight * 2"
        class="pa-0"
        style="min-height: unset"
      >
        <v-spacer></v-spacer>
        <custom-btn size="small" @click="scrollY(threadBottom - navHeight)">
          맨 위로
        </custom-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-expand-transition>
  </v-card>

  <!-- Favorite user view -->
  <user-peeker-dialog
    v-if="isUsersThread"
    v-model="favorites.state"
    :users="favorites.users"
  ></user-peeker-dialog>

  <!-- Applicantion view -->
  <user-peeker-dialog
    v-if="isUsersThread"
    v-model="showApplicants"
    :groups="recruitments"
    :selected-group="selectedRecruitment"
  ></user-peeker-dialog>
</template>

<script setup>
import WriterInfo from "@/components/WriterInfo.vue";
import DotMenu from "@/components/DotMenu.vue";
import TextEditor from "@/components/TextEditor.vue";
import CustomBtn from "@/components/CustomBtn.vue";
import RecruitmentViewer from "@/components/RecruitmentViewer.vue";
import CommentEditor from "@/components/CommentEditor.vue";
import CommentCard from "@/components/CommentCard.vue";
import userPeekerDialog from "@/components/UserPeekerDialog.vue";
import ErrorBlock from "@/components/ErrorBlock.vue";

import {
  ref,
  reactive,
  computed,
  defineProps,
  watch,
  onBeforeMount,
} from "vue";
import {
  useDebounceFn,
  useElementBounding,
  useElementSize,
  useWindowSize,
} from "@vueuse/core";
import router, { pages } from "@/router";
import { storeToRefs } from "pinia";
import { useSystemStore, useModalStore } from "@/store";
import {
  modalPresets,
  modalResponses,
  modalActions,
} from "@/store/modal.store";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { API, apiRequest, parseResponse, useAPI } from "@/modules/Services/API";
import {
  countActiveComments,
  createToggle,
  formatDateRelative,
  parseJSON,
} from "@/modules/utility";

// Components
const threadArea = ref();
const commentArea = ref();

// Pinia storage
const systemStore = useSystemStore();
const { currentUser, loggedIn, navHeight } = storeToRefs(systemStore);
const modalStore = useModalStore();

// Data
const { height: threadHeight, bottom: threadBottom } =
  useElementBounding(threadArea);
const { height: commentHeight } = useElementSize(commentArea);
const { height: windowHeight } = useWindowSize();
const netWindowHeight = computed(() => windowHeight.value - 70);
const threadId = computed(
  () => router.currentRoute.value.params.threadId ?? props.threadId
);
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
  value: 0,
});
const favorites = reactive({
  state: false,
  value: 0,
  users: [],
});
const recruitments = computed(() =>
  fetchRecruitmentResponse.value?.data[API.GetRecruitments]
    .filter((recruitment) => !recruitment.is_stopped)
    .sort((a, b) => a.occupation.name.localeCompare(b.occupation.name))
);
const selectedRecruitment = ref();
const showApplicants = ref(false);
const comments = reactive([]);
const countActiveComment = computed(() => countActiveComments(comments));
const { value: displayComment, toggle: toggleComment } = createToggle(false);

// Props
const props = defineProps({
  boardId: String,
  threadId: String,
});

// Watch
watch(
  () => router.currentRoute.value.params,
  (params) => fetchData(params.threadId)
);

// Hooks
onBeforeMount(() => {
  fetchData();
});

// Methods
const {
  isLoading: loadingRecruitments,
  error: failedLoadingRecruitments,
  data: fetchRecruitmentResponse,
  execute: fetchRecruitments,
} = useAPI();
const {
  isLoading: loadingComments,
  error: failedLoadingComments,
  execute: fetchComments,
} = useAPI();
const fetchData = async () => {
  // Fetch thread data
  await new apiRequest()
    .push(API.GetThread, { id: Number(threadId.value) }, [
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
      "favorites",
    ])
    .push(
      API.GetThreadActions,
      {
        user_id: Number(systemStore.currentUser.id),
        thread_id: Number(threadId.value),
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
      thread.date = formatDateRelative(threadData.date_created, {
        max_unit: "days",
        date_updated: threadData.date_updated,
      });
      Object.assign(writer, threadData.user);

      views.value = threadData.views;
      const actions = response[API.GetThreadActions];
      likes.state = createToggle(actions?.is_like ?? false);
      likes.value = threadData.likes;
      if (likes.state.value) likes.value -= 1;
      favorites.value = threadData.favorites;
      if (!isUsersThread.value) {
        favorites.state = createToggle(actions?.is_favorite ?? false);
        if (favorites.state.value) favorites.value -= 1;
      } else favorites.state = false;
      favorites.users.splice(0, favorites.users.length);

      if (systemStore.readThread(threadId.value)) views.value += 1;
    });

  // Fetch users who favorites this thread if the current user is the writer of the thread
  if (writer.id == currentUser.value.id)
    new apiRequest()
      .execute(
        API.GetThread,
        { id: Number(threadId.value) },
        {
          actionforthread_set: [
            "is_favorite",
            { user: ["id", "name"] },
            "date_updated",
          ],
        }
      )
      .then(parseResponse)
      .then((response) => {
        favorites.users.push(
          ...response[API.GetThread].actionforthread_set
            .filter((data) => data.is_favorite)
            .map((data) => {
              return {
                user: { id: data.user.id, name: data.user.name },
                date: formatDateRelative(data.date_updated, {
                  max_unit: "days",
                }),
              };
            })
        );
      });

  // Fetch recruitments
  await fetchRecruitments(
    constructQuery({
      name: API.GetRecruitments,
      args: { thread_id: Number(threadId.value) },
      fields: [
        "id",
        { occupation: ["name"] },
        {
          applyforrecruitment_set: [
            "id",
            { applicant: ["id", "name"] },
            "result",
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

  comments.splice(0, comments.length);
  // Fetch comments
  fetchComments(
    constructQuery({
      name: API.GetComments,
      args: { thread_id: Number(threadId.value) },
      fields: [
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
      ],
    })
  )
    .then(({ data: response }) => {
      comments.push(
        ...response.value.data[API.GetComments].filter(
          (comment) => !comment.parent_comment
        )
      );
    })
    .finally(() => (displayComment.value = countActiveComment.value > 0));
};
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
    .execute(API.DeleteThread, { id: Number(threadId.value) })
    .then(parseResponse)
    .then((response) => {
      if (!response[API.DeleteThread])
        throw new Error("게시글을 삭제하지 못했습니다.");

      const withdrawRecruitments = new apiRequest();

      if (recruitments.value.length) {
        for (const recruitment of recruitments.value)
          withdrawRecruitments.push(API.WithdrawRecruitment, {
            recruitment_id: Number(recruitment.id),
          });

        withdrawRecruitments
          .send()
          .then(parseResponse)
          .then((response) => {
            if (response[API.WithdrawRecruitment]) throw new Error();
          })
          .catch(() => console.log("failed to withdraw recruitments"));
      }

      modalStore
        .openModal("게시글이 삭제되었습니다.", null, {
          actions: modalPresets.OK,
        })
        .then(
          router.push({
            name: pages.ThreadList,
            params: { boardId: props.boardId },
            replace: true,
          })
        );
    })
    .catch(modalStore.showErrorMessage);
};
const recruitInfoClicked = (recruitment) => {
  if (!isUsersThread?.value) return;
  selectedRecruitment.value = recruitment.id;
  showApplicants.value = true;
};

const updateLike = useDebounceFn(() => {
  new apiRequest()
    .execute(API.UpdateThreadActions, {
      user_id: Number(systemStore.currentUser.id),
      thread_id: Number(threadId.value),
      is_cancel: !likes.state?.value,
      option: "like",
    })
    .then(parseResponse)
    .then((response) => {
      if (!response[API.UpdateThreadActions])
        throw new Error("좋아요 표시에 실패했습니다.");
    })
    .catch(modalStore.showErrorMessage);
}, 250);
const toggleLike = async () => {
  if (!loggedIn.value) {
    const response = await modalStore.showNeedLoginMessage();

    if (response === "Login")
      router.push({
        name: pages.Login,
        query: { redirect: router.currentRoute.value.fullPath },
      });
    return;
  }

  likes.state?.toggle();
  updateLike();
};
const updateFavorite = useDebounceFn(() => {
  new apiRequest()
    .execute(API.UpdateThreadActions, {
      user_id: Number(systemStore.currentUser.id),
      thread_id: Number(threadId.value),
      is_cancel: !favorites.state?.value,
      option: "favorite",
    })
    .then(parseResponse)
    .then((response) => {
      if (!response[API.UpdateThreadActions])
        throw new Error("관심글 등록에 실패했습니다.");
    })
    .catch(modalStore.showErrorMessage);
}, 250);

const toggleFavorite = async () => {
  if (!loggedIn.value) {
    const response = await modalStore.showNeedLoginMessage();

    if (response === "Login")
      router.push({
        name: pages.Login,
        query: { redirect: router.currentRoute.value.fullPath },
      });
    return;
  }

  if (isUsersThread.value) favorites.state = true;
  else {
    favorites.state?.toggle();
    updateFavorite();
  }
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
const scrollY = (amount = 0) => {
  window.scrollTo({ top: window.scrollY + amount ?? 0, behavior: "smooth" });
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

.thread-action-counter {
  text-align: center;
  font-size: 0.8em;
  margin-left: 0.5em;
}

.comment-title {
  font-size: 1.2em;
}
</style>
