<template>
  <!-- Finding form -->
  <template v-if="states.id == null">
    <v-form style="width: 100%" @submit.prevent="findID">
      <v-text-field label="아이디" v-model="states.my_id.value" autofocus>
      </v-text-field>
      <v-text-field label="이메일" v-model="states.email.value"> </v-text-field>

      <v-btn
        type="submit"
        :disabled="!states.valid || states.loading"
        :loading="states.loading"
        block
        color="primary"
      >
        {{ !states.valid ? "정보를 정확히 입력해주세요" : "비밀번호 찾기" }}
      </v-btn>
    </v-form>
  </template>

  <!-- Setting new pw -->
  <template v-else-if="!states.modified">
    <v-form style="width: 100%" @submit.prevent="modifyPW">
      <v-text-field
        label="새 비밀번호"
        v-model="states.pw.value"
        autofocus
        :error="!states.pw.validity.value && states.pw.validity.display"
        :type="states.pw.visibility ? 'text' : 'password'"
        :append-inner-icon="states.pw.visibility ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="states.pw.visibility = !states.pw.visibility"
        @update:focused="states.pw.tooltip = $event"
        @blur="states.pw.validity.display = true"
      >
        <v-tooltip
          activator="parent"
          v-model="states.pw.tooltip"
          :open-on-hover="false"
          style="color: unset"
        >
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(states.pw.validity.length)"
                :color="validityColor(states.pw.validity.length)"
              ></v-icon>
            </template>
            8~20자 길이
          </custom-btn>
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(states.pw.validity.noOther)"
                :color="validityColor(states.pw.validity.noOther)"
              ></v-icon>
            </template>
            영문, 숫자, 특수문자만
          </custom-btn>
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(states.pw.validity.containEng)"
                :color="validityColor(states.pw.validity.containEng)"
              ></v-icon>
            </template>
            영문 포함(대문자 또는 소문자)
          </custom-btn>
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(states.pw.validity.containNum)"
                :color="validityColor(states.pw.validity.containNum)"
              ></v-icon>
            </template>
            숫자 포함
          </custom-btn>
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(states.pw.validity.containSC)"
                :color="validityColor(states.pw.validity.containSC)"
              ></v-icon>
            </template>
            ! @ # $ % & * 중 하나 이상 포함
          </custom-btn>
        </v-tooltip>
      </v-text-field>

      <v-text-field
        label="새 비밀번호 확인"
        v-model="states.pwConfirm.value"
        :error="
          !states.pwConfirm.validity.value && states.pwConfirm.validity.display
        "
        :type="states.pwConfirm.visibility ? 'text' : 'password'"
        :append-inner-icon="
          states.pwConfirm.visibility ? 'mdi-eye-off' : 'mdi-eye'
        "
        @click:append-inner="
          states.pwConfirm.visibility = !states.pwConfirm.visibility
        "
        @update:focused="states.pwConfirm.tooltip = $event"
        @blur="states.pwConfirm.validity.display = true"
      >
        <v-tooltip
          activator="parent"
          v-model="states.pwConfirm.tooltip"
          :open-on-hover="false"
          style="color: unset"
        >
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(states.pwConfirm.validity.value)"
                :color="validityColor(states.pwConfirm.validity.value)"
              ></v-icon>
            </template>
            비밀번호 일치
          </custom-btn>
        </v-tooltip>
      </v-text-field>

      <v-btn
        type="submit"
        :disabled="
          !states.pw.validity.value || !states.pwConfirm.validity.value
        "
        :loading="states.loading"
        block
        color="primary"
      >
        {{
          !states.pw.validity.value || !states.pwConfirm.validity.value
            ? "조건에 맞는 새 비밀번호를 입력해 주세요"
            : "비밀번호 재설정"
        }}
      </v-btn>
    </v-form>
  </template>

  <template v-else>
    <v-card class="result-card">
      <v-card-text class="result-card-text">
        <span class="result-text">비밀번호가 재설정되었습니다.</span>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="flat" block @click="router.push({ name: pages.Login })">
          로그인하러 가기
        </v-btn>
      </v-card-actions>
    </v-card>
  </template>
</template>

<script setup>
import CustomBtn from "../CustomBtn.vue";

import { reactive, computed, defineEmits, watchEffect } from "vue";
import {
  validMyID,
  validEmail,
  validPW,
  lengthBetween,
  containEng,
  containNum,
  containSC,
  EngNumSCOnly,
  validityIcon,
  validityColor,
} from "@/modules/validator";
import { useModalStore } from "@/store";
import { modalPresets } from "@/store/modal.store";
import { apiRequest, API } from "@/modules/Services/API";
import { parseResponse } from "@/modules/Services/API";
import router, { pages } from "@/router";

// Pinia storage
const modalStore = useModalStore();

// Data
const states = reactive({
  my_id: {
    value: "",
    validity: computed(() => validMyID(states.my_id.value)),
  },
  email: {
    value: "",
    validity: computed(() => validEmail(states.email.value)),
  },
  valid: computed(
    () => states.my_id.value?.trim()?.length > 0 && states.email.validity
  ),
  id: null,
  found: computed(() => states.id != null),
  pw: {
    value: "",
    tooltip: false,
    visibility: false,
    validity: {
      display: false,
      length: computed(() => lengthBetween(states.pw.value, 8, 20)),
      containEng: computed(() => containEng(states.pw.value)),
      containNum: computed(() => containNum(states.pw.value)),
      containSC: computed(() => containSC(states.pw.value)),
      noOther: computed(() => EngNumSCOnly(states.pw.value)),
      value: computed(() => validPW(states.pw.value)),
    },
  },
  pwConfirm: {
    value: "",
    tooltip: false,
    visibility: false,
    validity: {
      display: false,
      value: computed(() => states.pw.value === states.pwConfirm.value),
    },
  },
  loading: false,
  modified: false,
});

// Emit
const emits = defineEmits(["completed"]);

// Watch
watchEffect(() => {
  emits("completed", states.modified);
});

// Methods
const findID = async () => {
  states.loading = true;

  if (!states.my_id.validity || !states.email.validity) {
    await noMatch();
    states.loading = false;
    return;
  }

  apiRequest(
    API.SearchUserForPW,
    {
      my_id: states.my_id.value,
      email: states.email.value,
    },
    "id"
  )
    .then(parseResponse)
    .then(async (response) => {
      states.id = Number(response[API.SearchUserForPW].id);

      if (!states.found) await noMatch();
    })
    .catch(async () => await errorOccured())
    .finally(() => (states.loading = false));
};

const modifyPW = () => {
  states.loading = true;
  apiRequest(API.ModifyPassword, { id: states.id, password: states.pw.value })
    .then(parseResponse)
    .then(async (response) => {
      states.modified = response[API.ModifyPassword];

      if (!states.modified) await errorOccured();
    })
    .catch(async () => await errorOccured())
    .finally(() => (states.loading = false));
};

const noMatch = async () => {
  await modalStore.openModal("일치하는 회원 정보가 없습니다.", null, {
    actions: modalPresets.OK,
  });
};

const errorOccured = async () => {
  await modalStore.openModal(
    "오류가 발생했습니다.\n나중에 다시 시도하거나 관리자에게 문의 바랍니다.",
    null,
    { actions: modalPresets.OK }
  );
};
</script>

<style scoped>
.v-text-field {
  margin-bottom: 1rem;
}
.result-card-text {
  padding: 2em 1.5em 2em 1.5em;

  text-align: center;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  position: relative;
}
</style>
