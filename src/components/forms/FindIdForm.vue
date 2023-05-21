<template>
  <!-- Finding form -->
  <template v-if="!states.found">
    <v-form style="width: 100%" @submit.prevent="submit">
      <v-text-field label="이메일" v-model="states.email" autofocus>
      </v-text-field>

      <v-btn
        type="submit"
        :disabled="!states.valid || states.loading"
        :loading="states.loading"
        block
        color="primary"
      >
        {{ states.valid ? "아이디 찾기" : "이메일을 입력해주세요" }}
      </v-btn>
    </v-form>
  </template>

  <!-- Result view -->
  <template v-else>
    <v-card class="result-card">
      <v-card-text class="result-card-text">
        <custom-btn class="copy-btn" size="x-small" @click="copyID">
          <v-icon icon="mdi-content-copy"> </v-icon>
          <v-tooltip activator="parent">
            {{ tooltipTimer == null ? "클립보드에 복사" : "복사되었습니다!" }}
          </v-tooltip>
        </custom-btn>

        <span class="result-text">{{ states.my_id }}</span>
      </v-card-text>

      <v-card-actions>
        <v-btn
          variant="flat"
          style="flex: 1"
          @click="router.push({ name: pages.Login.name })"
        >
          로그인하러 가기
        </v-btn>
        <v-btn
          variant="outlined"
          style="flex: 1"
          @click="router.push({ name: pages.FindPW.name })"
        >
          비밀번호 찾기
        </v-btn>
      </v-card-actions>
    </v-card>
  </template>
</template>

<script setup>
import CustomBtn from "../CustomBtn.vue";

import { reactive, ref, computed, defineEmits, watchEffect } from "vue";
import { parseResponse } from "@/modules/Services/API";
import { apiRequest, API } from "@/modules/Services/API";
import { validEmail } from "@/modules/validator";
import { useModalStore } from "@/store";
import { modalPresets } from "@/store/modal.store";
import router, { pages } from "@/router";

// Pinia Storage
const modalStore = useModalStore();

// Data
const states = reactive({
  email: "",
  loading: false,
  valid: computed(() => validEmail(states.email)),
  my_id: null,
  found: computed(() => states.my_id != null),
});
const tooltipTimer = ref(null);

// Emits
const emits = defineEmits(["completed"]);

// Watches
watchEffect(() => emits("completed", states.found));

// Methods
const submit = () => {
  states.loading = true;
  apiRequest(API.SearchUserForMyID, { email: states.email })
    .then(parseResponse)
    .then(async (response) => {
      states.my_id = response[API.SearchUserForMyID];

      if (!states.found)
        await modalStore.openModal(
          "가입 정보가 없습니다.\n이메일 주소를 확인해주세요.",
          null,
          { actions: modalPresets.OK }
        );
    })
    .catch(
      async () =>
        await modalStore.openModal(
          "오류가 발생했습니다.\n나중에 다시 시도하거나 관리자에게 문의해주세요.",
          null,
          { actions: modalPresets.OK }
        )
    )
    .finally(() => (states.loading = false));
};

const copyID = () => {
  navigator.clipboard.writeText(states.my_id);
  tooltipTimer.value = setTimeout(() => {
    tooltipTimer.value = null;
  }, 1000);
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
