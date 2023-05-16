<template>
  <v-dialog v-model="state.display" :persistent="options.persistent">
    <v-card v-click-outside="onClickOutside">
      <v-card-title v-if="data.title" class="modal-title">
        {{ data.title }}
      </v-card-title>

      <v-card-text class="modal-content">
        {{ data.content }}
      </v-card-text>

      <v-card-actions class="modal-actions">
        <custom-btn
          v-for="action in options.actions"
          :key="action"
          :color="action.color ?? undefined"
          class="response-btn"
          @click="modalStore.closeModal(action.response ?? action.label)"
        >
          {{ action.label }}
        </custom-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";

import { storeToRefs } from "pinia";
import { useModalStore } from "@/store";
import { modalResponses } from "@/store/modal.store";

// Pinia storage
const modalStore = useModalStore();
const {
  modalState: state,
  modalData: data,
  modalOptions: options,
} = storeToRefs(modalStore);

// Methods
const onClickOutside = () => {
  if (options.persistent) return;

  modalStore.closeModal(modalResponses.Cancel);
};
</script>

<style scoped>
.v-card {
  min-width: 25dvw;
  max-width: 80dvw;
  margin: auto;
}

.modal-title {
  text-align: center;
}

.modal-content {
  white-space: pre;
  text-align: center;
}

.modal-actions {
  padding: 0;
  justify-content: center;
}

.response-btn {
  width: 20%;
}
</style>
