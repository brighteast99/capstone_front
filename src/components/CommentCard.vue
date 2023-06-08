<template>
  <div class="d-flex align-center">
    <v-icon
      v-if="isReply"
      class="ml-5"
      icon="mdi-subdirectory-arrow-right"
      size="medium"
      color="grey"
    >
    </v-icon>
    <v-card class="w-100 pa-2" elevation="0" density="compact">
      <v-card-title class="d-flex">
        <writer-info
          :writer="props.comment.user"
          :date="date"
          :disabled="props.comment.is_deleted"
          :small="true"
        >
        </writer-info>
        <v-spacer></v-spacer>
        <div v-if="!props.comment.is_deleted" class="comment-actions">
          <custom-btn v-if="!isReply && loggedIn" @click="toggleReplyEditor()">
            대댓글
          </custom-btn>
          <custom-btn
            v-if="isUsersComment || currentUser.is_staff"
            :color="isEditing ? 'error' : 'primary'"
            @click="toggleEditMode()"
          >
            {{ isEditing ? "취소" : "수정" }}
          </custom-btn>
          <custom-btn
            v-if="isUsersComment || currentUser.is_staff"
            color="error"
            @click="deleteComment"
          >
            삭제
          </custom-btn>
        </div>
      </v-card-title>

      <v-card-text class="pt-2">
        <div
          v-if="props.comment.is_deleted"
          class="d-flex flex-column justify-center text-center text-disabled"
          style="height: 50px; font-size: 1.3em; background-color: #fafafa"
        >
          {{ `삭제된 ${isReply ? "대댓글" : "댓글"}입니다` }}
        </div>
        <comment-editor
          v-else-if="isEditing"
          :id="props.comment.id"
          :content="props.comment.content"
          @comment-updated="
            emits('updated', $event);
            toggleEditMode();
          "
          @not-changed="toggleEditMode()"
        ></comment-editor>
        <p v-else class="comment-content">
          {{ props.comment.content }}
        </p>
      </v-card-text>

      <v-card-actions class="py-0" style="min-height: unset; color: gray">
        <p v-if="replies_count > 0">
          {{ `${replies_count}개의 대댓글` }}
        </p>
      </v-card-actions>
    </v-card>
  </div>

  <v-expand-transition>
    <comment-editor
      v-if="displayReplyEditor"
      class="ml-8 mr-4 my-3"
      :threadId="props.threadId"
      :parent_comment="props.comment.id"
      @comment-created="
        emits('replyCreated', $event);
        toggleReplyEditor();
      "
    >
    </comment-editor>
  </v-expand-transition>
</template>
<script setup>
import CommentEditor from "./CommentEditor.vue";
import WriterInfo from "./WriterInfo.vue";
import CustomBtn from "./CustomBtn.vue";

import { computed, defineProps, defineEmits } from "vue";
import { useModalStore, useSystemStore } from "@/store";
import { modalActions, modalResponses } from "@/store/modal.store";
import { createToggle, formatDateRelative } from "@/modules/utility";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";
import { storeToRefs } from "pinia";

// Pinia storage
const systemStore = useSystemStore();
const { loggedIn, currentUser } = storeToRefs(systemStore);
const modalStore = useModalStore();

// Data
const date = computed(() =>
  formatDateRelative(props.comment?.date_created, {
    max_unit: "days",
    date_updated: props.comment?.date_updated,
  })
);
const { value: isEditing, toggle: toggleEditMode } = createToggle(false);
const isUsersComment = computed(
  () => props.comment.user?.id == systemStore.currentUser.id
);
const isReply = computed(() => props.comment.parent_comment != null);
const replies_count = computed(
  () => props.comment.replies?.filter((reply) => !reply.is_deleted)?.length
);
const { value: displayReplyEditor, toggle: toggleReplyEditor } =
  createToggle(false);

// Props & Emits
const props = defineProps({
  comment: {
    Type: {
      id: String | Number,
      user: {
        id: String | Number,
        name: String,
      },
      date_created: String,
      date_updated: String,
      content: String,
      replies: Array,
      parent_comment: String | Number,
    },
  },
  threadId: {
    Type: String | Number,
  },
});
const emits = defineEmits(["updated", "deleted", "replyCreated"]);

// Methods
const deleteComment = async () => {
  const response = await modalStore.openModal(
    "댓글을 삭제하시겠습니까?\n삭제한 댓글은 복구할 수 없습니다.",
    null,
    {
      actions: [modalActions.Delete, modalActions.SafeCancel],
    }
  );

  if (response === modalResponses.Cancel) return;

  new apiRequest()
    .execute(API.DeleteComment, { id: Number(props.comment.id) })
    .then(parseResponse)
    .then((response) => {
      if (!response[API.DeleteComment]) throw new Error();
      emits("deleted", props.comment.id);
    });
};
</script>
<style scoped>
.comment-actions {
  display: flex;
  font-size: 0.7em;
}

.comment-content {
  white-space: pre;
}
</style>
