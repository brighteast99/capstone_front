<template>
  <!-- Finding form -->
  <template v-if="isCurrent('input-email')">
    <v-form style="width: 100%" @submit.prevent="findUser">
      <v-text-field label="이메일" v-model="formStates.email" autofocus>
      </v-text-field>

      <v-btn
        type="submit"
        :disabled="!formStates.valid"
        :loading="isLoading"
        block
        color="primary"
      >
        {{ formStates.valid ? "아이디 찾기" : "유효한 이메일을 입력해주세요" }}
      </v-btn>
    </v-form>
  </template>

  <!-- Result view -->
  <template v-if="isCurrent('result')">
    <v-card class="result-card">
      <v-card-text class="result-card-text">
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
import { reactive, ref, computed, defineEmits } from "vue";
import { API, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { validEmail } from "@/modules/validator";
import { useModalStore } from "@/store";
import { modalPresets } from "@/store/modal.store";
import router, { pages } from "@/router";
import { useStepper, whenever } from "@vueuse/core";

// Pinia Storage
const modalStore = useModalStore();

// Data
const formStates = reactive({
  email: "",
  valid: computed(() => validEmail(formStates.email)),
});
const my_id = ref();
const { isCurrent, isLast, goToNext } = useStepper(["input-email", "result"]);

// Emits
const emits = defineEmits(["completed"]);

// Watch
whenever(isLast, () => emits("completed", true));

// Methods
const { isLoading, execute: _findUser } = new useAPI();
const findUser = () => {
  _findUser(
    constructQuery({
      name: API.SearchUserForMyID,
      args: {
        email: formStates.email,
      },
    })
  )
    .then(({ data: response }) => {
      my_id.value = response.value.data[API.SearchUserForMyID];

      if (!my_id.value)
        modalStore.openModal(
          "가입 정보가 없습니다.\n이메일 주소를 확인해주세요.",
          null,
          { actions: modalPresets.OK }
        );
      else goToNext();
    })
    .catch(modalStore.showErrorMessage);
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
</style>
