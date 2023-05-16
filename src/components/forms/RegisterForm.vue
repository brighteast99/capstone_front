<template>
  <v-form ref="form" style="width: 100%" @submit.prevent="submit">
    <v-text-field
      v-model="formData.name"
      label="닉네임 (한글, 영문, 숫자 2~12자)"
      :rules="rules.name"
      clearable
    >
    </v-text-field>

    <v-row>
      <v-text-field
        label="아이디 (영문, 숫자 8~16자)"
        v-model="formData.id"
        :rules="rules.id"
        :loading="timers.id != null"
        clearable
      ></v-text-field>
    </v-row>

    <v-text-field
      label="비밀번호 (영문, 숫자, 특수문자 포함 8~20자)"
      type="password"
      v-model="formData.pw"
      :rules="rules.pw"
      clearable
    ></v-text-field>
    <v-text-field
      label="비밀번호 확인"
      type="password"
      v-model="formData.pwCheck"
      :rules="rules.pwCheck"
      clearable
    ></v-text-field>

    <v-row>
      <v-text-field
        label="이메일"
        v-model="formData.email"
        :rules="rules.email"
        clearable
      >
      </v-text-field>
      <!-- <v-btn class="form-btn" style="max-width: fit-content"> 인증 </v-btn> -->
    </v-row>
    <v-checkbox
      v-model="formData.termsAgreed"
      :rules="rules.termsAgreed"
      color="primary"
      density="compact"
    >
      <template v-slot:label>
        <custom-btn class="px-0" weight="normal">
          이용약관 및 개인정보처리방침
          <v-dialog activator="parent" max-width="600px">
            <v-expansion-panels
              v-model="panels"
              class="mx-auto"
              multiple
              variant="accordion"
            >
              <v-expansion-panel title="이용약관">
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
        에 동의합니다 (필수)
      </template>
    </v-checkbox>

    <v-btn
      type="submit"
      :disabled="!canSubmit || submitting"
      :loading="submitting"
    >
      {{ canSubmit ? "회원가입" : "항목을 모두 작성해야 해요" }}
    </v-btn>
  </v-form>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";

import { ref, reactive, watch } from "vue";
import Validator from "@/modules/validator";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";
import { useModalStore } from "@/store";
import { modalPresets } from "@/store/modal.store";
import router from "@/router";
import { pages } from "@/router";

// Component
const form = ref(null);

// Pinia storage
const modalStore = useModalStore();

// Data
const formData = reactive({
  name: "",
  id: "",
  pw: "",
  pwCheck: "",
  email: "",
  termsAgreed: false,
});
const rules = {
  name: [(v) => (validity.name = Validator.validateName(v))],
  id: [
    (v) => (validity.id = Validator.validateID(v)),
    async (v) => (validity.id = await uniqueID(v)),
  ],
  pw: [(v) => (validity.pw = Validator.validatePW(v))],
  pwCheck: [
    (v) =>
      (validity.pwCheck =
        v === formData.pw || "비밀번호 확인이 일치하지 않아요"),
  ],
  /**
   * TODO 이메일 중복체크 추가
   */
  email: [(v) => (validity.email = Validator.validateEmail(v))],
  termsAgreed: [(v) => (validity.termsAgreed = v || "필수 항목이에요")],
};
const timers = reactive({ id: null, email: null });
let validity = reactive({
  name: "",
  id: "",
  pw: "",
  pwCheck: "",
  email: "",
  termsAgreed: "",
});
const canSubmit = ref(false);
const submitting = ref(false);

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

// Watch
watch(validity, async () => {
  canSubmit.value = await Object.values(validity).reduce(
    (accum, value) => accum && typeof value == "boolean",
    true
  );
});

// Methods
const uniqueID = async () => {
  return new Promise((resolve) => {
    clearTimeout(timers.id);

    timers.id = setTimeout(() => {
      apiRequest(API.CheckExistingID, { my_id: formData.id })
        .then(parseResponse)
        .then((response) => {
          /**
           * TODO API 고쳐지면 기준값 반전
           */
          if (!response[API.CheckExistingID])
            resolve("이미 사용중인 아이디예요");
          else resolve(true);
        })
        .catch(() => {
          resolve("오류가 발생했어요");
        })
        .finally(() => {
          timers.id = null;
        });
    }, 250);
  });
};

const submit = () => {
  submitting.value = true;
  form.value
    ?.validate()
    .then((result) => {
      if (!result.valid) return;

      apiRequest(
        API.SignUp,
        {
          name: formData.name,
          my_id: formData.id,
          password: formData.pw,
          email: formData.email,
        },
        "id"
      )
        .then(async () => {
          await modalStore.openModal(
            "회원가입에 성공했습니다.\n로그인 화면으로 이동합니다.",
            null,
            { actions: modalPresets.OK, persistent: true }
          );
          router.push({ name: pages.Login });
        })
        .catch(async () => {
          await modalStore.openModal(
            "오류가 발생했습니다.\n잠시 뒤에 다시 시도하거나 관리자에게 문의해주세요.",
            null,
            { actions: modalPresets.OK, persistent: true }
          );
        });
    })
    .finally(() => (submitting.value = false));
};
</script>

<style scoped>
.v-text-field {
  flex-grow: 1;
  margin-bottom: 1rem;
}

.v-btn {
  width: 100%;
}

.form-btn {
  flex: 0 0;
  width: fit-content;
  margin: 0 0 16px 12px;
  align-self: flex-start;
}
</style>
