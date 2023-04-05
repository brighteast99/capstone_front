<template>
  <v-form ref="registerForm" style="width: 100%" @submit.prevent="submit">
    <v-text-field label="닉네임" :rules="idRules"> </v-text-field>

    <v-row>
      <v-col cols="9">
        <v-text-field
          class="mr-3"
          label="아이디"
          :rules="idRules"
        ></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-btn class="mb-4"> 중복확인 </v-btn>
      </v-col>
    </v-row>

    <v-text-field
      label="비밀번호"
      type="password"
      :rules="pwRules"
    ></v-text-field>
    <v-text-field
      label="비밀번호 확인"
      type="password"
      :rules="pwRules"
    ></v-text-field>

    <v-row>
      <v-col cols="9">
        <v-text-field class="mr-3" label="이메일"> </v-text-field>
      </v-col>
      <v-col cols="3">
        <v-btn class="mb-4" width="100%"> 인증 </v-btn>
      </v-col>
    </v-row>
    <v-checkbox v-model="agreed" color="primary" density="compact" hide-details>
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

    <v-btn type="submit"> 회원가입 </v-btn>
  </v-form>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";

import { ref } from "vue";

// Data
const registerForm = ref(null);

const agreed = ref(false);

/**
 * TODO 아이디 비밀번호 규칙 구현
 */
const idRules = [];
const pwRules = [];

const ipsum =
  "무엇인지 아무 사람들의 어머니, 비둘기, 하늘에는 있습니다. 된 이름자를 그러나 있습니다. 이름자를 차 위에 새워 때 마디씩 있습니다. 멀리 잠, 너무나 한 오면 까닭입니다. 잠, 묻힌 별을 하나에 비둘기, 이름을 그리워 듯합니다. 풀이 벌레는 별이 책상을 가득 어머니, 가난한 까닭입니다." +
  "별빛이 무덤 우는 하나에 강아지, 그러나 시와 봅니다. 하나 프랑시스 패, 북간도에 시와 이름과 헤는 버리었습니다. 가난한 내일 이름과, 멀듯이, 쉬이 노루, 있습니다. 어머니, 아름다운 다 하나에 옥 가난한 말 남은 있습니다. 이웃 우는 아침이 봅니다. 릴케 애기 한 나는 하나에 나는 슬퍼하는 아직 봅니다." +
  "쉬이 노루, 이제 봅니다. 써 지나가는 계절이 까닭이요, 버리었습니다. 차 프랑시스 이웃 거외다. 슬퍼하는 많은 별 소학교 헤는 봅니다. 같이 별들을 마디씩 이름을 많은 계십니다. 나는 이름을 밤이 아이들의 아스라히 겨울이 있습니다." +
  "별빛이 무덤 우는 하나에 강아지, 그러나 시와 봅니다. 하나 프랑시스 패, 북간도에 시와 이름과 헤는 버리었습니다. 가난한 내일 이름과, 멀듯이, 쉬이 노루, 있습니다. 어머니, 아름다운 다 하나에 옥 가난한 말 남은 있습니다. 이웃 우는 아침이 봅니다. 릴케 애기 한 나는 하나에 나는 슬퍼하는 아직 봅니다." +
  "쉬이 노루, 이제 봅니다. 써 지나가는 계절이 까닭이요, 버리었습니다. 차 프랑시스 이웃 거외다. 슬퍼하는 많은 별 소학교 헤는 봅니다. 같이 별들을 마디씩 이름을 많은 계십니다. 나는 이름을 밤이 아이들의 아스라히 겨울이 있습니다.";
const panels = ref([0, 1]);

// Methods
const submit = async () => {
  const valid = (await registerForm.value.validate()).valid;
  if (!valid) return;

  /**
   * TODO 회원가입 구현
   */
};
</script>

<style scoped>
.v-text-field {
  margin-bottom: 1rem;
}

.v-btn {
  width: 100%;
}
</style>
