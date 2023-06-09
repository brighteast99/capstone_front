<template>
  <v-form style="display: flex; height: 80px" @submit.prevent="registerComment">
    <v-textarea
      :disabled="!loggedIn"
      v-model="content"
      color="primary"
      rows="2"
      no-resize
      placeholder="이용규칙을 위반한 댓글은 경고 없이 삭제될 수 있습니다."
    ></v-textarea>
    <v-btn
      :disabled="!loggedIn"
      type="submit"
      class="rounded-0 rounded-te"
      variant="flat"
      color="primary"
      height="100%"
    >
      {{ isEditMode ? "수정" : "등록" }}
    </v-btn>
  </v-form>
</template>
<script setup>
import { API, apiRequest, parseResponse } from "@/modules/Services/API";

import { ref, computed, defineProps, defineEmits, onMounted } from "vue";
import { useModalStore, useSystemStore } from "@/store";
import { escapeString, formatDateRelative } from "@/modules/utility";
import { modalPresets } from "@/store/modal.store";
import { storeToRefs } from "pinia";

// Pinia storage
const systemStore = useSystemStore();
const { loggedIn } = storeToRefs(systemStore);
const modalStore = useModalStore();

// Data
const content = ref("");
const isEditMode = computed(() => props.id != null);

// Props
const props = defineProps({
  id: {
    Type: Number | String,
  },
  threadId: {
    Type: Number | String,
  },
  content: String,
  parent_comment: {
    Type: Number | String,
  },
});
const emits = defineEmits(["commentCreated", "commentUpdated", "notChanged"]);

// Hook
onMounted(() => {
  content.value = props.content ?? "";
});

// Methods
const registerComment = () => {
  if (!content.value.length) {
    modalStore.openModal("내용이 필요합니다", null, {
      actions: modalPresets.OK,
    });
    return;
  }

  if (props.content === content.value) {
    emits("notChanged");
    return;
  }

  const apiName = isEditMode.value ? API.UpdateComment : API.CreateComment;
  const escapedContent = escapeString(content.value);
  const commentData = {
    content: escapedContent,
  };
  if (isEditMode.value) commentData.id = Number(props.id);
  else {
    commentData.writer_id = Number(systemStore.currentUser.id);
    commentData.thread_id = Number(props.threadId);
    if (props.parent_comment)
      commentData.parent_comment_id = Number(props.parent_comment);
  }

  new apiRequest()
    .execute(apiName, commentData, ["id", "date_created"])
    .then(parseResponse)
    .then((response) => {
      let newComment = response[apiName];
      newComment.user = {
        id: systemStore.currentUser.id,
        name: systemStore.currentUser.name,
      };
      newComment.date = formatDateRelative(newComment.date_created, {
        max_unit: "days",
      });
      newComment.content = content.value;
      newComment.replies = [];
      newComment.parent_comment = props.parent_comment;

      if (isEditMode.value)
        emits("commentUpdated", { id: props.id, content: content.value });
      else emits("commentCreated", newComment);
      content.value = "";
    })
    .catch((err) => {
      console.error(err);
      modalStore.showErrorMessage;
    });
};
</script>
<style scoped></style>
