<template>
  <teleport to="#modal">
    <v-dialog
      :model-value="displayModal"
      :persistent="options.persistent"
      scrim="black"
      @update:model-value="
        onUpdateMV($event);
        displayModal = $event;
      "
    >
      <v-card v-click-outside="onClickOutside">
        <v-card-title v-if="data.title" class="modal-title">
          {{ data.title }}
        </v-card-title>

        <span class="modal-content">
          {{ data.content }}
        </span>

        <v-card-actions ref="actions" class="modal-actions">
          <custom-btn
            v-for="action in options.actions"
            class="modal-action"
            :key="action"
            :color="action.color ?? undefined"
            @click="
              deactivate();
              modalStore.closeModal(action.response ?? action.label);
            "
          >
            {{ action.label }}
          </custom-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </teleport>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";

import { storeToRefs } from "pinia";
import { useModalStore } from "@/store";
import { modalResponses } from "@/store/modal.store";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import { ref, onBeforeUnmount } from "vue";

// Component
const actions = ref();

// Pinia storage
const modalStore = useModalStore();
const {
  displayModal,
  modalData: data,
  modalOptions: options,
} = storeToRefs(modalStore);

// Data
const { activate, deactivate } = useFocusTrap(actions, { immediate: true });

// Hook
onBeforeUnmount(() => {
  console.log("beforeUnmount");
  deactivate();
});

// Methods
const onUpdateMV = (mv) => {
  if (mv) activate();
  else {
    onClickOutside();
  }
};
const onClickOutside = () => {
  if (options.value.persistent) return;

  deactivate();
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
