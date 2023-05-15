<template>
  <v-dialog v-model="modalStore.modalState.display" persistent>
    <v-card v-click-outside="onClickOutside">
      <v-card-title v-if="modalStore.modalData.title"> </v-card-title>

      <v-card-text class="text-center">
        {{ modalStore.modalData.content }}
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions style="justify-content: center">
        <custom-btn
          v-for="action in modalStore.modalOptions.actions"
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
import { useModal, modalResponses } from "@/store/modal.store";
import CustomBtn from "./CustomBtn.vue";

const modalStore = useModal();

const onClickOutside = () => {
  if (modalStore.modalOptions.persistent) return;

  modalStore.closeModal(modalResponses.Cancel);
};
</script>

<style scoped>
.v-card {
  min-width: 30dvw;
  max-width: 80dvw;
  margin: auto;
}

.response-btn {
  width: 20%;
}
</style>
