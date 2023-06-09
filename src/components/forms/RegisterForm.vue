<template>
  <v-form style="width: 100%" @submit.prevent="register">
    <v-text-field
      v-model="formData.name.value"
      label="닉네임"
      autofocus
      :error="formData.name.validity.display && !formData.name.validity.value"
      @update:focused="formData.name.tooltip = $event"
      @blur="formData.name.validity.display = true"
    >
      <v-tooltip
        activator="parent"
        v-model="formData.name.tooltip"
        :open-on-hover="false"
        style="color: unset"
      >
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :color="Validator.validityColor(formData.name.validity.length)"
              :icon="Validator.validityIcon(formData.name.validity.length)"
            ></v-icon>
          </template>
          2~12자 길이
        </custom-btn>
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="
                Validator.validityIcon(formData.name.validity.KorEngNumOnly)
              "
              :color="
                Validator.validityColor(formData.name.validity.KorEngNumOnly)
              "
            ></v-icon>
          </template>
          한글, 영문, 숫자만
        </custom-btn>
      </v-tooltip>
    </v-text-field>

    <v-text-field
      label="아이디"
      v-model="formData.my_id.value"
      :loading="formData.my_id.validity.unique === undefined"
      :error="formData.my_id.validity.display && !formData.my_id.validity.value"
      @update:model-value="checkIdUniqueness()"
      @update:focused="formData.my_id.tooltip = $event"
      @blur="formData.my_id.validity.display = true"
    >
      <v-tooltip
        activator="parent"
        v-model="formData.my_id.tooltip"
        :open-on-hover="false"
        style="color: unset"
      >
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="Validator.validityIcon(formData.my_id.validity.length)"
              :color="Validator.validityColor(formData.my_id.validity.length)"
            ></v-icon>
          </template>
          8~16자 길이
        </custom-btn>
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="Validator.validityIcon(formData.my_id.validity.EngNumOnly)"
              :color="
                Validator.validityColor(formData.my_id.validity.EngNumOnly)
              "
            ></v-icon>
          </template>
          영문, 숫자만
        </custom-btn>
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :class="{
                'mdi-spin': checkingID,
              }"
              :icon="
                checkingID
                  ? 'mdi-loading'
                  : Validator.validityIcon(formData.my_id.validity.unique)
              "
              :color="
                checkingID
                  ? 'white'
                  : Validator.validityColor(formData.my_id.validity.unique)
              "
            ></v-icon>
          </template>
          {{
            failedCheckingID
              ? "중복 확인 실패"
              : checkingID
              ? "확인중"
              : !checkedID
              ? "중복 확인 필요"
              : formData.my_id.validity.unique
              ? "사용 가능"
              : "이미 사용중인 아이디"
          }}
        </custom-btn>
      </v-tooltip>
    </v-text-field>

    <v-text-field
      label="비밀번호"
      v-model="formData.pw.value"
      :error="formData.pw.validity.display && !formData.pw.validity.value"
      :type="formData.pw.visibility.value ? 'text' : 'password'"
      :append-inner-icon="
        formData.pw.visibility.value ? 'mdi-eye-off' : 'mdi-eye'
      "
      @click:append-inner="formData.pw.visibility.toggle()"
      @update:focused="formData.pw.tooltip = $event"
      @blur="formData.pw.validity.display = true"
    >
      <v-tooltip
        activator="parent"
        v-model="formData.pw.tooltip"
        :open-on-hover="false"
        style="color: unset"
      >
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="Validator.validityIcon(formData.pw.validity.length)"
              :color="Validator.validityColor(formData.pw.validity.length)"
            ></v-icon>
          </template>
          8~20자 길이
        </custom-btn>
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="Validator.validityIcon(formData.pw.validity.noOther)"
              :color="Validator.validityColor(formData.pw.validity.noOther)"
            ></v-icon>
          </template>
          영문, 숫자, 특수문자만
        </custom-btn>
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="Validator.validityIcon(formData.pw.validity.containEng)"
              :color="Validator.validityColor(formData.pw.validity.containEng)"
            ></v-icon>
          </template>
          영문 포함(대문자 또는 소문자)
        </custom-btn>
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="Validator.validityIcon(formData.pw.validity.containNum)"
              :color="Validator.validityColor(formData.pw.validity.containNum)"
            ></v-icon>
          </template>
          숫자 포함
        </custom-btn>
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="Validator.validityIcon(formData.pw.validity.containSC)"
              :color="Validator.validityColor(formData.pw.validity.containSC)"
            ></v-icon>
          </template>
          ! @ # $ % & * 중 하나 이상 포함
        </custom-btn>
      </v-tooltip>
    </v-text-field>

    <v-text-field
      label="비밀번호 확인"
      v-model="formData.pwConfirm.value"
      :error="
        formData.pwConfirm.validity.display &&
        !formData.pwConfirm.validity.value
      "
      :type="formData.pwConfirm.visibility.value ? 'text' : 'password'"
      :append-inner-icon="
        formData.pwConfirm.visibility.value ? 'mdi-eye-off' : 'mdi-eye'
      "
      @click:append-inner="formData.pwConfirm.visibility.toggle()"
      @update:focused="formData.pwConfirm.tooltip = $event"
      @blur="formData.pwConfirm.validity.display = true"
    >
      <v-tooltip
        activator="parent"
        v-model="formData.pwConfirm.tooltip"
        :open-on-hover="false"
        style="color: unset"
      >
        <custom-btn default-color="white">
          <template v-slot:prepend>
            <v-icon
              class="mr-3"
              :icon="Validator.validityIcon(formData.pwConfirm.validity.value)"
              :color="
                Validator.validityColor(formData.pwConfirm.validity.value)
              "
            ></v-icon>
          </template>
          비밀번호 일치
        </custom-btn>
      </v-tooltip>
    </v-text-field>

    <v-tooltip
      v-model="formData.email.tooltip"
      right
      :open-on-hover="false"
      style="color: unset"
    >
      <template v-slot:activator="{ props }">
        <v-combobox
          label="이메일"
          v-bind="props"
          v-model="formData.email.value"
          :items="formData.email.suggestions"
          :loading="formData.email.validity.unique === undefined"
          :error="
            formData.email.validity.display && !formData.email.validity.value
          "
          @update:model-value="chechEmailUniqueness()"
          @focus="formData.email.tooltip = true"
          @blur="
            formData.email.tooltip = false;
            formData.email.validity.display = true;
          "
        >
        </v-combobox>
      </template>

      <custom-btn default-color="white">
        <template v-slot:prepend>
          <v-icon
            class="mr-3"
            :icon="Validator.validityIcon(formData.email.validity.format)"
            :color="Validator.validityColor(formData.email.validity.format)"
          ></v-icon>
        </template>
        이메일 형식 (example@example.com)
      </custom-btn>
      <custom-btn default-color="white">
        <template v-slot:prepend>
          <v-icon
            class="mr-3"
            :class="{
              'mdi-spin': checkingEmail,
            }"
            :icon="
              checkingEmail
                ? 'mdi-loading'
                : Validator.validityIcon(formData.email.validity.unique)
            "
            :color="
              checkingEmail
                ? 'white'
                : Validator.validityColor(formData.email.validity.unique)
            "
          ></v-icon>
        </template>
        {{
          failedCheckingEmail
            ? "중복 확인 실패"
            : checkingEmail
            ? "확인중"
            : !checkedEmail
            ? "중복 확인 필요"
            : formData.email.validity.unique
            ? "사용 가능"
            : "가입하지 않은 이메일"
        }}
      </custom-btn>
    </v-tooltip>

    <v-checkbox
      v-model="formData.termsAgreed.value"
      :error="
        !formData.termsAgreed.validity.value &&
        formData.termsAgreed.validity.display
      "
      color="primary"
      @click="formData.termsAgreed.validity.display = true"
    >
      <template v-slot:label>
        <custom-btn class="px-0" weight="normal">
          서비스 이용약관 및 개인정보처리방침
          <v-dialog activator="parent" max-width="600px">
            <v-expansion-panels
              v-model="panels"
              class="mx-auto"
              multiple
              variant="accordion"
            >
              <v-expansion-panel title="서비스 이용약관">
                <template v-slot:text>
                  <div class="overflow-y-auto" style="max-height: 300px">
                    {{ ipsum }}
                  </div>
                </template>
              </v-expansion-panel>
              <v-expansion-panel title="개인정보처리방침">
                <template v-slot:text>
                  <div class="overflow-y-auto" style="max-height: 300px">
                    {{ ipsum }}
                  </div>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-dialog>
        </custom-btn>
        에 동의합니다
      </template>
    </v-checkbox>

    <div @click="register">
      <v-btn
        block
        :disabled="checkingID || checkingEmail || !canSubmit"
        :loading="submitting"
      >
        {{
          canSubmit
            ? checkingID || checkingEmail
              ? "정보를 확인하고 있어요"
              : "회원가입"
            : "항목을 모두 작성해야 해요"
        }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";

import { reactive, computed } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import * as Validator from "@/modules/validator";
import { useModalStore } from "@/store";
import {
  modalActions,
  modalResponses,
  modalPresets,
} from "@/store/modal.store";
import router, { pages } from "@/router";
import { useDebounceFn } from "@vueuse/core";
import { createToggle } from "@/modules/utility";
import { API, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";

// Pinia storage
const modalStore = useModalStore();

// Data
const formData = reactive({
  name: {
    value: "",
    tooltip: false,
    validity: {
      display: false,
      length: computed(() =>
        Validator.lengthBetween(formData.name.value, 2, 12)
      ),
      KorEngNumOnly: computed(() =>
        Validator.KorEngNumOnly(formData.name.value)
      ),
      value: computed(() => Validator.validName(formData.name.value)),
    },
  },
  my_id: {
    value: "",
    tooltip: false,
    validity: {
      display: false,
      length: computed(() =>
        Validator.lengthBetween(formData.my_id.value, 8, 16)
      ),
      EngNumOnly: computed(() => Validator.EngNumOnly(formData.my_id.value)),
      unique: null,
      value: computed(
        () =>
          Validator.validMyID(formData.my_id.value) &&
          formData.my_id.validity.unique
      ),
    },
  },
  pw: {
    value: "",
    tooltip: false,
    visibility: createToggle(false),
    validity: {
      display: false,
      length: computed(() => Validator.lengthBetween(formData.pw.value, 8, 20)),
      containEng: computed(() => Validator.containEng(formData.pw.value)),
      containNum: computed(() => Validator.containNum(formData.pw.value)),
      containSC: computed(() => Validator.containSC(formData.pw.value)),
      noOther: computed(() => Validator.EngNumSCOnly(formData.pw.value)),
      value: computed(() => Validator.validPW(formData.pw.value)),
    },
  },
  pwConfirm: {
    value: "",
    tooltip: false,
    visibility: createToggle(false),
    validity: {
      display: false,
      value: computed(() => formData.pw.value === formData.pwConfirm.value),
    },
  },
  email: {
    value: "",
    suggestions: computed(() => {
      const value = formData.email.value;

      if (!value?.trim()) return [];

      const local = value.includes("@") ? value.match(/^[^@]+/) : value;
      const domains = [
        "@korea.ac.kr",
        "@naver.com",
        "@gmail.com",
        "@daum.net",
        "@hanmail.net",
        "@nate.com",
      ];

      return domains.map((domain) => local + domain);
    }),
    tooltip: false,
    validity: {
      display: false,
      format: computed(() => Validator.validEmail(formData.email.value)),
      unique: null,
      value: computed(
        () =>
          Validator.validEmail(formData.email.value) &&
          formData.email.validity.unique
      ),
    },
  },
  termsAgreed: {
    value: false,
    validity: {
      display: false,
      value: computed(() => formData.termsAgreed.value),
    },
  },
});
const canSubmit = computed(() =>
  Object.values(formData).every((field) => field.validity.value != false)
);

/**
 * TODO 실제 약관으로 변경
 */
const ipsum =
  "무엇인지 아무 사람들의 어머니, 비둘기, 하늘에는 있습니다. 된 이름자를 그러나 있습니다. 이름자를 차 위에 새워 때 마디씩 있습니다. 멀리 잠, 너무나 한 오면 까닭입니다. 잠, 묻힌 별을 하나에 비둘기, 이름을 그리워 듯합니다. 풀이 벌레는 별이 책상을 가득 어머니, 가난한 까닭입니다." +
  "별빛이 무덤 우는 하나에 강아지, 그러나 시와 봅니다. 하나 프랑시스 패, 북간도에 시와 이름과 헤는 버리었습니다. 가난한 내일 이름과, 멀듯이, 쉬이 노루, 있습니다. 어머니, 아름다운 다 하나에 옥 가난한 말 남은 있습니다. 이웃 우는 아침이 봅니다. 릴케 애기 한 나는 하나에 나는 슬퍼하는 아직 봅니다." +
  "쉬이 노루, 이제 봅니다. 써 지나가는 계절이 까닭이요, 버리었습니다. 차 프랑시스 이웃 거외다. 슬퍼하는 많은 별 소학교 헤는 봅니다. 같이 별들을 마디씩 이름을 많은 계십니다. 나는 이름을 밤이 아이들의 아스라히 겨울이 있습니다." +
  "별빛이 무덤 우는 하나에 강아지, 그러나 시와 봅니다. 하나 프랑시스 패, 북간도에 시와 이름과 헤는 버리었습니다. 가난한 내일 이름과, 멀듯이, 쉬이 노루, 있습니다. 어머니, 아름다운 다 하나에 옥 가난한 말 남은 있습니다. 이웃 우는 아침이 봅니다. 릴케 애기 한 나는 하나에 나는 슬퍼하는 아직 봅니다." +
  "쉬이 노루, 이제 봅니다. 써 지나가는 계절이 까닭이요, 버리었습니다. 차 프랑시스 이웃 거외다. 슬퍼하는 많은 별 소학교 헤는 봅니다. 같이 별들을 마디씩 이름을 많은 계십니다. 나는 이름을 밤이 아이들의 아스라히 겨울이 있습니다.";
const panels = reactive([0, 1]);

// Navigation guards
onBeforeRouteLeave(async (to, from, next) => {
  if (completed) return next();
  if (Object.values(formData).every((field) => !field.value.length))
    return next();

  const response = await modalStore.openModal(
    "회원가입을 중단하시겠습니까?\n입력한 내용은 사라집니다.",
    null,
    {
      actions: [
        {
          label: "예",
          response: modalResponses.Yes,
          color: "error",
        },
        modalActions.No,
      ],
    }
  );

  return next(response === modalResponses.Yes);
});

// Methods
const {
  isLoading: checkingID,
  isFinished: checkedID,
  error: failedCheckingID,
  execute: checkID,
} = useAPI();
const checkIdUniqueness = useDebounceFn(() => {
  checkID(
    constructQuery({
      name: API.CheckExistingID,
      args: {
        my_id: formData.my_id.value,
      },
    })
  )
    .then(
      ({ data: response }) =>
        (formData.my_id.validity.unique =
          !response.value.data[API.CheckExistingID])
    )
    .catch(() => (formData.my_id.validity.unique = null));
}, 250);
const {
  isLoading: checkingEmail,
  isFinished: checkedEmail,
  error: failedCheckingEmail,
  execute: checkEmail,
} = useAPI();
const chechEmailUniqueness = useDebounceFn(() => {
  checkEmail(
    constructQuery({
      name: API.CheckExistingEmail,
      args: {
        email: formData.email.value,
      },
    })
  )
    .then(
      ({ data: response }) =>
        (formData.email.validity.unique =
          !response.value.data[API.CheckExistingEmail])
    )
    .catch(() => (formData.email.validity.unique = null));
}, 250);
const {
  isLoading: submitting,
  isFinished: completed,
  execute: submitForm,
} = useAPI();
const register = () => {
  submitForm(
    constructQuery({
      name: API.SignUp,
      args: {
        name: formData.name.value,
        my_id: formData.my_id.value,
        password: formData.pw.value,
        email: formData.email.value,
      },
      fields: "id",
    })
  )
    .then(({ data: response }) => {
      if (!response.value.data[API.SignUp]) throw new Error();
      else
        modalStore
          .openModal(
            "회원가입에 성공했습니다.\n로그인 화면으로 이동합니다.",
            null,
            { actions: modalPresets.OK }
          )
          .then(() => router.push({ name: pages.Login }));
    })
    .catch(modalStore.showErrorMessage);
};
</script>

<style scoped>
.v-text-field {
  margin-bottom: 1rem;
}

.test-good {
  box-shadow: 0 0 5px 3px #ff7171;
}

.test-error {
  box-shadow: 0 0 10px 2px #ff7171;
}
</style>
