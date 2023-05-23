<template>
  <v-dialog
    v-model="state.display"
    :persistent="options.persistent"
    :scrim="options.persistent ? 'black' : 'transparent'"
    @update:model-value="if (!$event) onClickOutside();"
  >
    <v-card v-click-outside="onClickOutside">
      <v-card-title v-if="data.title" class="modal-title">
        {{ data.title }}
      </v-card-title>

      <span class="modal-content">
        {{ data.content }}
      </span>

      <v-card-actions class="modal-actions">
        <custom-btn
          class="modal-action"
          v-for="action in options.actions"
          :key="action"
          :color="action.color ?? undefined"
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
  if (options.value.persistent) return;

  modalStore.closeModal(modalResponses.Cancel);
};
</script>

<style scoped>
.v-card {
  min-width: 20rem;
  margin: auto;
}

.modal-title {
  text-align: center;
}

.modal-content {
  white-space: pre;
  text-align: center;
  padding: 2em 1em 1.5em 1em;
}

.modal-actions {
  padding: 0 3em 0 3em;
}

.modal-action {
  flex: 1 1;
  width: 20%;
}
</style>
