<template>
  <!-- Finding form -->
  <template v-if="stepper.isCurrent('input-email')">
    <v-form style="width: 100%" @submit.prevent="submit">
      <v-text-field label="이메일" v-model="formStates.email" autofocus>
      </v-text-field>

      <v-btn
        type="submit"
        :disabled="!formStates.valid || isLoading"
        :loading="isLoading"
        block
        color="primary"
      >
        {{ formStates.valid ? "아이디 찾기" : "유효한 이메일을 입력해주세요" }}
      </v-btn>
    </v-form>
  </template>

  <!-- Result view -->
  <template v-if="stepper.isCurrent('result')">
    <v-card class="result-card">
      <v-card-text class="result-card-text">
        <custom-btn
          class="copy-btn"
          size="x-small"
          @click="
            copy(formStates.my_id);
            tooltipMessage = tooltipMessageAlt;
          "
        >
          <v-icon icon="mdi-content-copy"> </v-icon>
          <v-tooltip activator="parent"> {{ tooltipMessage }} </v-tooltip>
        </custom-btn>
        {{ my_id }}
      </v-card-text>

      <v-card-actions>
        <v-btn
          variant="flat"
          style="flex: 1"
          @click="router.push({ name: pages.Login })"
        >
          로그인하러 가기
        </v-btn>
        <v-btn
          variant="outlined"
          style="flex: 1"
          @click="router.push({ name: pages.FindPW })"
        >
          비밀번호 찾기
        </v-btn>
      </v-card-actions>
    </v-card>
  </template>
</template>

<script setup>
import CustomBtn from "../CustomBtn.vue";

import { reactive, ref, computed, defineEmits } from "vue";
import { API, useAPI, constructQuery } from "@/modules/Services/useAPI";
import { validEmail } from "@/modules/validator";
import { useModalStore } from "@/store";
import { modalPresets } from "@/store/modal.store";
import router, { pages } from "@/router";
import {
  useStepper,
  watchOnce,
  useClipboard,
  refAutoReset,
} from "@vueuse/core";

// Pinia Storage
const modalStore = useModalStore();

// Data
const formStates = reactive({
  email: "",
  valid: computed(() => validEmail(formStates.email)),
});
const my_id = ref(null);
const tooltipMessage = refAutoReset("아이디 복사", 1000);
const tooltipMessageAlt = "복사 완료!";
const stepper = useStepper(["input-email", "result"]);
const { copy } = useClipboard({ legacy: true });

// Emits
const emits = defineEmits(["completed"]);

// Watches
watchOnce(my_id, () => {
  emits("completed", true);
});

// Methods
const { isLoading, execute } = new useAPI({
  onSuccess: async (res) => {
    my_id.value = res.data[API.SearchUserForMyID];

    if (!my_id.value)
      await modalStore.openModal(
        "가입 정보가 없습니다.\n이메일 주소를 확인해주세요.",
        null,
        { actions: modalPresets.OK }
      );
    else stepper.goToNext();
  },
  onError: async () => await modalStore.showErrorMessage(),
});
const submit = () => {
  execute(
    constructQuery({
      name: API.SearchUserForMyID,
      args: {
        email: formStates.email,
      },
    })
  );
};
</script>

<style scoped>
.v-text-field {
  margin-bottom: 1rem;
}

.result-card {
  width: 100%;
  float: none;
}

.result-card-text {
  padding: 2em 1em 2em 1em;

  text-align: center;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
  position: relative;
}

.copy-btn {
  position: absolute;
  padding: 0;
  top: 0.5em;
  right: 0.5em;
}
</style>
