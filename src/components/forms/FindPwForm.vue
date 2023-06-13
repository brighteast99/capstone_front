<template>
  <!-- Finding form -->
  <template v-if="isCurrent('input-account-info')">
    <v-form style="width: 100%" @submit.prevent="findUser()">
      <v-text-field label="아이디" v-model="accountData.my_id.value" autofocus>
      </v-text-field>

      <v-text-field label="이메일" v-model="accountData.email.value">
      </v-text-field>

      <v-btn
        type="submit"
        :disabled="!accountData.valid"
        :loading="isLoading"
        block
        color="primary"
      >
        {{
          !accountData.valid ? "정보를 정확히 입력해주세요" : "비밀번호 찾기"
        }}
      </v-btn>
    </v-form>
  </template>

  <!-- Setting new pw -->
  <template v-if="isCurrent('reset-password')">
    <v-form style="width: 100%" @submit.prevent="modifyPW()">
      <v-text-field
        label="새 비밀번호"
        v-model="newPwData.pw.value"
        autofocus
        :error="newPwData.pw.validity.display && !newPwData.pw.validity.value"
        :type="newPwData.pw.visibility.value ? 'text' : 'password'"
        :append-inner-icon="
          newPwData.pw.visibility.value ? 'mdi-eye-off' : 'mdi-eye'
        "
        @click:append-inner="newPwData.pw.visibility.toggle()"
        @update:focused="newPwData.pw.tooltip = $event"
        @blur="newPwData.pw.validity.display = true"
      >
        <v-tooltip
          activator="parent"
          v-model="newPwData.pw.tooltip"
          :open-on-hover="false"
          style="color: unset"
        >
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(newPwData.pw.validity.length)"
                :color="validityColor(newPwData.pw.validity.length)"
              ></v-icon>
            </template>
            8~20자 길이
          </custom-btn>
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(newPwData.pw.validity.noOther)"
                :color="validityColor(newPwData.pw.validity.noOther)"
              ></v-icon>
            </template>
            영문, 숫자, 특수문자만
          </custom-btn>
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(newPwData.pw.validity.containEng)"
                :color="validityColor(newPwData.pw.validity.containEng)"
              ></v-icon>
            </template>
            영문 포함(대문자 또는 소문자)
          </custom-btn>
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(newPwData.pw.validity.containNum)"
                :color="validityColor(newPwData.pw.validity.containNum)"
              ></v-icon>
            </template>
            숫자 포함
          </custom-btn>
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(newPwData.pw.validity.containSC)"
                :color="validityColor(newPwData.pw.validity.containSC)"
              ></v-icon>
            </template>
            ! @ # $ % & * 중 하나 이상 포함
          </custom-btn>
        </v-tooltip>
      </v-text-field>

      <v-text-field
        label="새 비밀번호 확인"
        v-model="newPwData.pwConfirm.value"
        :error="
          newPwData.pwConfirm.validity.display &&
          !newPwData.pwConfirm.validity.value
        "
        :type="newPwData.pwConfirm.visibility.value ? 'text' : 'password'"
        :append-inner-icon="
          newPwData.pwConfirm.visibility.value ? 'mdi-eye-off' : 'mdi-eye'
        "
        @click:append-inner="newPwData.pwConfirm.visibility.toggle()"
        @update:focused="newPwData.pwConfirm.tooltip = $event"
        @blur="newPwData.pwConfirm.validity.display = true"
      >
        <v-tooltip
          activator="parent"
          v-model="newPwData.pwConfirm.tooltip"
          :open-on-hover="false"
          style="color: unset"
        >
          <custom-btn default-color="white">
            <template v-slot:prepend>
              <v-icon
                class="mr-3"
                :icon="validityIcon(newPwData.pwConfirm.validity.value)"
                :color="validityColor(newPwData.pwConfirm.validity.value)"
              ></v-icon>
            </template>
            비밀번호 일치
          </custom-btn>
        </v-tooltip>
      </v-text-field>

      <v-btn
        type="submit"
        :disabled="!newPwData.valid"
        :loading="isLoading"
        block
        color="primary"
      >
        {{
          !newPwData.pw.valid
            ? "조건에 맞는 새 비밀번호를 입력해 주세요"
            : "비밀번호 재설정"
        }}
      </v-btn>
    </v-form>
  </template>

  <template v-if="isCurrent('result')">
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

import { reactive, ref, computed, defineEmits } from "vue";
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
import { API, parseResponse, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";
import router, { pages } from "@/router";
import { useStepper, whenever } from "@vueuse/core";
import { createToggle } from "@/modules/utility";

// Pinia storage
const modalStore = useModalStore();

// Data
const accountData = reactive({
  my_id: {
    value: "",
    validity: computed(() => validMyID(accountData.my_id.value)),
  },
  email: {
    value: "",
    validity: computed(() => validEmail(accountData.email.value)),
  },
  valid: computed(
    () => accountData.my_id.validity && accountData.email.validity
  ),
});
const id = ref();
const newPwData = reactive({
  pw: {
    value: "",
    tooltip: false,
    visibility: createToggle(false),
    validity: {
      display: false,
      length: computed(() => lengthBetween(newPwData.pw.value, 8, 20)),
      containEng: computed(() => containEng(newPwData.pw.value)),
      containNum: computed(() => containNum(newPwData.pw.value)),
      containSC: computed(() => containSC(newPwData.pw.value)),
      noOther: computed(() => EngNumSCOnly(newPwData.pw.value)),
      value: computed(() => validPW(newPwData.pw.value)),
    },
  },
  pwConfirm: {
    value: "",
    tooltip: false,
    visibility: createToggle(false),
    validity: {
      display: false,
      value: computed(() => newPwData.pw.value === newPwData.pwConfirm.value),
    },
  },
  valid: computed(
    () => newPwData.pw.validity.value && newPwData.pwConfirm.validity.value
  ),
});

const { isCurrent, isLast, goToNext } = useStepper([
  "input-account-info",
  "reset-password",
  "result",
]);

// Emit
const emits = defineEmits(["completed"]);

// Watch
whenever(isLast, () => emits("completed", true));

// Methods

const { isLoading, execute } = new useAPI();
const findUser = () => {
  execute(
    constructQuery({
      name: API.SearchUserForPW,
      args: {
        my_id: accountData.my_id.value,
        email: accountData.email.value,
      },
      fields: "id",
    })
  )
    .then(parseResponse)
    .then((response) => {
      id.value = Number(response[API.SearchUserForPW]?.id);

      if (!id.value)
        modalStore.openModal("일치하는 회원 정보가 없습니다.", null, {
          actions: modalPresets.OK,
        });
      else goToNext();
    })
    .catch(modalStore.showErrorMessage);
};

const modifyPW = () => {
  execute(
    constructQuery({
      name: API.ModifyPassword,
      args: {
        id: id.value,
        password: newPwData.pw.value,
      },
    })
  )
    .then(parseResponse)
    .then((response) => {
      if (!response[API.ModifyPassword]) throw new Error();
      else goToNext();
    })
    .catch(modalStore.showErrorMessage);
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
