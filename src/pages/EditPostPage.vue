<template>
  <v-card class="card">
    <v-card-title class="pa-5 pb-0 d-flex align-center">
      <custom-dropdown class="select-board mt-n5 mb-4" :items="boards">
      </custom-dropdown>
      <v-text-field
        class="mt-n7 mb-4"
        v-model="postData.title"
        placeholder="글 제목"
        variant="underlined"
        color="primary"
        autofocus
        hide-details
        density="compact"
        @update:focused="if (!event) postData.title = postData.title.trim();"
      ></v-text-field>
    </v-card-title>

    <v-card-text class="py-0">
      <text-editor v-model="postData.content" :edit-mode="true" />
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

// Data
let intendedLeaving = false;
const isNewPost = computed(() => router.currentRoute.value.meta.newPost);
const isEdited = computed(
  () => JSON.stringify(postData_backup) !== JSON.stringify(postData)
);
const canLeave = computed(() => !systemStore.loggedIn || !isEdited.value);
const postData = reactive({
  title: "",
  content: null,
  occupation: ["만능인재ㅋㅋ", "잉여"],
});
const postData_backup = {
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
  occupation: [],
};

// Props
const props = defineProps({
  boardId: String,
  postId: String,
});

// Fetch data before route enter
onBeforeMount(() => {
  if (!isNewPost.value) {
    new apiRequest()
      .execute(API.GetPost, { id: Number(props.postId) }, [
        { user: "id" },
        "title",
        "content",
        "occupation",
      ])
      .then(parseResponse)
      .then(async (response) => {
        const data = response[API.GetPost];
        data.occupation = data.occupation.split(", ");

        console.log("파싱 시작");
        console.log(data.content);
        data.content = JSON.parse(data.content);
        console.log("파싱 종료");

        Object.assign(postData, data);
        Object.assign(postData_backup, postData);
      })
      .catch(async (err) => {
        console.log(err);
        await modalStore.showErrorMessage();
        // intendedLeaving = true;
        // router.replace({
        //   name: pages.PostList,
        //   params: { boardId: props.boardId },
        // });
      });
  }

  window.addEventListener("beforeunload", beforeunloadEvent);
  window.addEventListener("unload", unloadEvent);
});

// Navigation guards
onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeunloadEvent);
  window.removeEventListener("unload", unloadEvent);
});
onBeforeRouteLeave(async (to, from, next) => {
  if (intendedLeaving || canLeave.value) return next();

  const response = await modalStore.openModal(
    `페이지를 벗어나시겠습니까?\n${
      isNewPost.value ? "작성" : "수정"
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

  if (response === modalResponses.Yes) return next();
  else return next(false);
});
onBeforeRouteUpdate(async (to, from, next) => {
  if (intendedLeaving || canLeave.value) return true;

  const response = await modalStore.openModal(
    `페이지를 새로고침하시겠습니까?\n${
      isNewPost.value ? "작성" : "수정"
    }중인 내용은 저장되지 않습니다.`,
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
  );
  if (response === modalResponses.Yes) return next();
  else return next(false);
});

// Methods
const cancel = async () => {
  if (!canLeave.value) {
    const operation = isNewPost.value ? "작성" : "수정";
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
  if (props.postId)
    router.push({
      name: pages.ViewPost,
      params: router.currentRoute.value.params,
    });
  else router.back();
};
const post = async () => {
  const operation = isNewPost.value ? "등록" : "수정";

  // If no content in new post
  if (isNewPost.value && !isEdited.value)
    return await modalStore.openModal("제목과 내용이 필요합니다.", null, {
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
  let id;
  if (isEdited.value) {
    const apiName = isNewPost.value ? API.CreatePost : API.EditPost;

    let data = {
      title: postData.title,
      content: postData.content,
      occupation: postData.occupation,
    };
    if (isNewPost.value) data.writer_id = systemStore.currentUser.id;
    else data.id = Number(props.postId);

    await new apiRequest()
      .execute(apiName, data, "id")
      .then(parseResponse)
      .then((response) => {
        id = response[apiName].id;
      })
      .catch(async () => {
        error = true;
        await modalStore.showErrorMessage();
      });
  }

  if (!error) {
    intendedLeaving = true;
    router.replace({
      name: pages.ViewPost,
      params: {
        boardId: props.boardId,
        postId: isNewPost.value ? id : props.postId,
      },
      meta: { leaving: true },
    });
  }
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
.card {
  margin: 40px auto 20px auto;
  padding: 12px;
  min-width: fit-content;
}
.select-board {
  flex: 0 0;
}
</style>
