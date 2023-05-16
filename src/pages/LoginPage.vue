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
              v-model="formData.id"
              label="아이디"
              :rules="rules.id"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              v-model="formData.pw"
              label="비밀번호"
              type="password"
              :rules="rules.pw"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-btn
              block
              type="submit"
              color="primary"
              :disabled="loggingIn"
              :loading="loggingIn"
            >
              로그인
            </v-btn>
          </v-row>
          <v-row>
            <v-checkbox
              label="로그인 유지(미구현)"
              color="primary"
              hide-details
              density="compact"
            ></v-checkbox>
          </v-row>
        </v-form>

        <!-- Help area -->
        <v-row class="mt-3" style="font-size: 0.9em">
          <custom-btn
            class="pl-0 pr-1"
            weight="bold"
            :to="{ name: pages.FindUID }"
          >
            아이디
          </custom-btn>
          <v-col>
            <p class="text-disabled">/</p>
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
            <p class="text-disabled">를 잊어버렸어요</p>
          </v-col>

          <v-spacer></v-spacer>

          <v-col>
            <custom-btn
              class="pr-0"
              weight="bold"
              :to="{ name: pages.Register }"
            >
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

import { ref, reactive } from "vue";
import { useSystemStore, useModalStore } from "@/store";
import { modalPresets } from "@/store/modal.store";
import LogoGroup from "@/components/LogoGroup.vue";
import router from "@/router";
import { pages } from "@/router";
import validator from "@/modules/validator";

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
const formData = reactive({
  id: "",
  pw: "",
});
const rules = {
  id: [(v) => validator.validateID(v)],
  pw: [(v) => validator.validatePW(v)],
};
const loggingIn = ref(false);

// Methods
const login = () => {
  loggingIn.value = true;
  loginForm.value
    .validate()
    .then((result) => {
      if (!result.valid) return loginFailed();

      systemStore
        .login({ my_id: formData.id, password: formData.pw })
        .then((result) => {
          if (result) router.push({ name: pages.Main });
        })
        .catch(() => loginFailed());
    })
    .finally(() => (loggingIn.value = false));
};

const loginFailed = async () => {
  modalStore.openModal("아이디 또는 비밀번호가 올바르지 않습니다.", null, {
    actions: modalPresets.OK,
  });
};
</script>

<style scoped>
.v-text-field {
  margin-bottom: 1rem;
}
</style>
