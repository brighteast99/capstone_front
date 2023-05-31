<template>
  <v-defaults-provider :defaults="defaults">
    <v-row class="h-screen">
      <v-container style="max-width: 400px">
        <!-- Site Logo -->
        <v-row>
          <logo-group icon-size="96" font-size="1.3em"></logo-group>
        </v-row>

        <!-- Form area -->
        <v-form ref="loginForm" style="width: 100%" @submit.prevent="login">
          <v-row>
            <v-text-field
              v-model="loginData.my_id"
              label="아이디"
              :error="false"
              autofocus
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              v-model="loginData.password"
              label="비밀번호"
              type="password"
              :error="false"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-btn
              block
              type="submit"
              color="primary"
              :disabled="loggingIn"
              :loading="loggingIn"
              :onmousedown="adminLogin.init"
            >
              로그인
            </v-btn>
          </v-row>
          <!-- <v-row>
            <v-checkbox
              v-model="loginData.keepLogin"
              label="로그인 유지"
              color="primary"
              hide-details
              density="compact"
            >
            </v-checkbox>
          </v-row> -->
        </v-form>

        <!-- Help area -->
        <v-row class="mt-3" style="font-size: 0.9em">
          <v-col>
            <custom-btn
              class="pl-0 pr-1"
              weight="bold"
              :to="{ name: pages.FindUID }"
            >
              아이디
            </custom-btn>
          </v-col>
          <v-col>
            <span class="text-disabled">/</span>
          </v-col>
          <v-col>
            <custom-btn
              class="pl-1 pr-0"
              weight="bold"
              :to="{ name: pages.FindPW }"
            >
              비밀번호
            </custom-btn>
          </v-col>
          <v-col>
            <span class="text-disabled">가 기억나지 않아요</span>
          </v-col>

          <v-spacer></v-spacer>

          <v-col>
            <custom-btn
              class="pr-0"
              weight="bold"
              :to="{ name: pages.Register }"
            >
              아직 계정이 없어요
            </custom-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-defaults-provider>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";

import { ref, reactive } from "vue";
import { useSystemStore, useModalStore } from "@/store";
import { modalPresets } from "@/store/modal.store";
import LogoGroup from "@/components/LogoGroup.vue";
import router, { pages } from "@/router";
import { validMyID, validPW } from "@/modules/validator";

// Styles
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
    hideDetails: "true",
  },
};

// Component
const loginForm = ref(null);

// Pinia storage
const systemStore = useSystemStore();
const modalStore = useModalStore();

// Data
const loginData = reactive({
  my_id: "",
  password: "",
});
// const keepLogin = ref(false);
const loggingIn = ref(false);
const adminLogin = reactive({
  value: false,
  timer: null,
  init: () => {
    adminLogin.clear();
    adminLogin.timer = setTimeout(() => {
      adminLogin.value = true;
    }, 1000);
  },
  clear: () => {
    clearTimeout(adminLogin.timer);
    adminLogin.timer = null;
    adminLogin.value = false;
  },
});

// Methods
const login = async () => {
  loggingIn.value = true;
  if (
    !adminLogin.value &&
    (!validMyID(loginData.my_id) || !validPW(loginData.password))
  ) {
    await loginFailed();
    loggingIn.value = false;
    return;
  }

  systemStore
    .login(loginData)
    .then(async (result) => {
      if (result) router.push({ name: pages.Main });
      else await loginFailed();
    })
    .catch(async () => modalStore.showErrorMessage())
    .finally(() => {
      loggingIn.value = false;
      adminLogin.clear();
    });
};

const loginFailed = async () => {
  await modalStore.openModal(
    "아이디 또는 비밀번호가 올바르지 않습니다.",
    null,
    {
      actions: modalPresets.OK,
    }
  );
};
</script>

<style scoped>
.v-text-field {
  margin-bottom: 1rem;
}
</style>
