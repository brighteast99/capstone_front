<template>
  <v-defaults-provider :defaults="defaults">
    <v-row class="h-screen">
      <v-container style="max-width: 400px">
        <!-- Site Logo -->
        <v-row>
          <logo-group icon-size="96" font-size="1.3em"></logo-group>
        </v-row>
        <v-row> 테스트중. 로그인 버튼 누르면 바로 로그인됨 </v-row>

        <!-- Form area -->
        <v-form ref="loginForm" style="width: 100%" @submit.prevent="login">
          <v-row>
            <v-text-field
              v-model="uid"
              label="아이디"
              :rules="idRules"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              v-model="pw"
              label="비밀번호"
              type="password"
              :rules="pwRules"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-btn block type="submit" color="primary">로그인</v-btn>
          </v-row>
          <v-row>
            <v-checkbox
              label="로그인 유지"
              color="primary"
              hide-details
              density="compact"
            ></v-checkbox>
          </v-row>
        </v-form>

        <!-- Help area -->
        <v-row class="mt-3" style="font-size: 0.9em">
          <custom-btn class="pl-0 pr-1" weight="bold" :to="{ name: 'FindUID' }">
            아이디
          </custom-btn>
          <v-col>
            <p class="text-disabled">/</p>
          </v-col>
          <v-col>
            <custom-btn
              class="pl-1 pr-0"
              weight="bold"
              :to="{ name: 'FindPW' }"
            >
              비밀번호
            </custom-btn>
          </v-col>
          <v-col>
            <p class="text-disabled">를 잊어버렸어요</p>
          </v-col>

          <v-spacer></v-spacer>

          <v-col>
            <custom-btn class="pr-0" weight="bold" :to="{ name: 'Register' }">
              계정이 없어요
            </custom-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-defaults-provider>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";

import { ref } from "vue";
import { useSystemStore } from "@/store";
import LogoGroup from "@/components/LogoGroup.vue";
import router from "@/router";

// Style
const defaults = {
  VRow: {
    justify: "center",
    align: "center",
    noGutters: true,
  },
  VCol: {
    cols: "auto",
  },
  VTextField: {
    variant: "solo",
    density: "compact",
    hideDetails: "auto",
  },
};

// Data
const systemStore = useSystemStore();

const loginForm = ref(null);

const uid = ref("");
const pw = ref("");

/**
 * TODO 아이디 비밀번호 규칙 구현
 */
const idRules = [];
const pwRules = [];

// Methods
const login = async () => {
  const valid = (await loginForm.value.validate()).valid;
  if (!valid) return;

  /**
   * TODO 로그인 구현
   */
  systemStore.logIn(1);
  router.push({ name: "Main" });
};
</script>

<style scoped>
.v-text-field {
  margin-bottom: 1rem;
}
</style>
