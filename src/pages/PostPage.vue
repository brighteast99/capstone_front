<template>
  <v-card class="mt-10 mx-auto mb-5 pa-3">
    <template v-if="editing">
      <v-card-title class="pa-5 pb-0">
        <v-text-field
          v-if="editing"
          class="mt-n7 mb-4"
          placeholder="글 제목"
          variant="underlined"
          color="primary"
          autofocus
          hide-details
          v-model="postData.title"
        ></v-text-field>
      </v-card-title>

      <keep-alive>
        <v-card-text class="py-0">
          <text-editor v-model="postData.content" :editable="true" />
        </v-card-text>
      </keep-alive>

      <v-card-actions>
        <v-spacer></v-spacer>
        <custom-btn class="mr-3" color="error" @click="cancel">
          취소
        </custom-btn>
        <v-btn variant="flat" color="primary" @click="post">
          {{ props.postId ? "수정" : "등록" }}
        </v-btn>
      </v-card-actions>
    </template>

    <template v-else>
      <v-card-title>
        <div class="d-flex flex-column">
          <span class="title">{{ postData.title }}</span>
          <p class="info-area">
            <span>
              작성자:
              <custom-btn
                class="writer-btn"
                :to="{
                  name: 'UserInfo',
                  params: { userId: postData.writer.id },
                }"
              >
                {{ postData.writer.name }}
              </custom-btn>
            </span>
            <span>{{ `작성일: ${date}` }} </span>
            <span v-if="postData.modifyDate">
              {{ `최종 수정일: ${modifyDate}` }}
            </span>
          </p>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <keep-alive>
        <v-card-text class="pa-0">
          <text-editor v-model="postData.content" :editable="false" />
        </v-card-text>
      </keep-alive>

      <v-card-actions v-if="usersPost">
        <v-spacer> </v-spacer>
        <custom-btn @click="startEdit">수정</custom-btn>
        <custom-btn color="error" @click="deletePost">삭제</custom-btn>
      </v-card-actions>
    </template>
  </v-card>

  <v-card v-if="!editing" class="mx-auto mb-5 pa-3">
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
  watchEffect,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import router from "@/router";
import { useDevelopStore, useSystem, useTextEditor } from "@/store";

// Pinia storage
const systemStore = useSystem();
const editorStore = useTextEditor();
const developStore = useDevelopStore();

// Components
const commentForm = ref(null);

// Data
let leaveConfirmed = false;
const edited = computed(() => {
  return (
    postData_backup.title !== postData.title ||
    JSON.stringify(postData_backup.content) !== JSON.stringify(postData.content)
  );
});
const canLeave = computed(() => {
  if (!systemStore.loggedIn || !editing.value || leaveConfirmed) return true;
  return !edited.value;
});
const usersPost = computed(
  () => systemStore.currentUser.id === postData.writer.id
);
const editing = ref(false);
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
const postData = reactive({
  writer: {},
  title: "",
  date: null,
  modifyDate: null,
  content: undefined,
});
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
  editing: Boolean,
});

// Watches
watchEffect(() => {
  if (!systemStore.loggedIn && editing.value) {
    /**
     * TODO: 권한 없음 경고
     */
    confirm("권한이 없습니다.");
    router.push({ name: "Main" });
  }
});

// Hooks
onMounted(() => {
  if (props.postId) {
    /**
     * TODO 서버에서 게시글 불러오기
     */
    Object.assign(postData, developStore.postData);
  } else {
    Object.assign(postData.writer, systemStore.currentUser);
  }
  editing.value = props.editing;
  window.addEventListener("beforeunload", beforeunloadEvent);
  window.addEventListener("unload", unloadEvent);
});
onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeunloadEvent);
  window.removeEventListener("unload", unloadEvent);
});
onBeforeRouteLeave(() => {
  if (!canLeave.value)
    return confirmDialog(
      `페이지를 벗어나시겠습니까? ${
        props.postId ? "수정" : "작성"
      }중인 내용은 저장되지 않습니다`
    );
});
onBeforeRouteUpdate(() => {
  if (!canLeave.value)
    return confirmDialog(
      `페이지를 새로고침하시겠습니까? ${
        props.postId ? "수정" : "작성"
      }중인 내용은 저장되지 않습니다`
    );
});

// Methods
const startEdit = () => {
  postData_backup.title = postData.title;
  Object.assign(postData_backup.content, postData.content);
  editing.value = true;
};
const deletePost = () => {
  if (
    !confirmDialog(
      "게시물을 정말 삭제하시겠습니까? 삭제된 게시물은 복구할 수 없습니다."
    )
  )
    return;

  /**
   * TODO: 게시물 삭제
   */
  router.push({ name: "PostListPage", params: { boardId: props.boardId } });
};
const cancel = () => {
  /**
   * TODO: 커스텀 Dialog로
   */
  if (!canLeave.value) {
    leaveConfirmed = confirmDialog(
      `${props.postId ? "수정" : "작성"}을 취소하시겠습니까? ${
        props.postId ? "수정" : "작성"
      }중인 내용은 저장되지 않습니다`
    );

    if (!leaveConfirmed) return;
  }

  if (props.postId) {
    editing.value = false;
    Object.assign(postData, postData_backup);
    leaveConfirmed = false;
  } else router.back();
};
const post = () => {
  /**
   *
   * TODO: 커스텀 Dialog로
   */
  if (!confirmDialog(`게시글을 ${props.postId ? "수정" : "등록"}하시겠습니까?`))
    return;

  if (edited.value) {
    postData[props.postId ? "modifyDate" : "date"] = Date.now();
    /**
     * TODO 게시물 서버 저장
     */
    Object.assign(developStore.postData, postData);
  } else if (!props.postId) {
    /**
     * TODO: 커스텀 Dialog로
     */
    confirm("내용을 입력해주세요");
    return;
  }

  const postId = 1234; //서버에서 받아온 postId;
  if (!props.postId) {
    router.replace({
      name: "PostPage",
      params: { boardId: props.boardId, postId: postId },
      props: { editing: false },
    });
  }
  editing.value = false;
};

const registerComment = () => {
  /**
   * TODO
   */
};

const confirmDialog = (message) => {
  return confirm(message);
};
const unloadEvent = () => {
  editorStore.clearImages();
};
const beforeunloadEvent = (event) => {
  if (canLeave.value) return;

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

.writer-btn {
  display: inline-block;
  padding: 0;
}

.info-area > span {
  margin-right: 10px;
}

.comment-title {
  font-size: 1.2em;
}
</style>
