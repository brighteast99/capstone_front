<template>
  <v-defaults-provider :defaults="defaults">
    <v-row class="h-screen">
      <v-container style="max-width: 400px">
        <!-- Site Logo -->
        <v-row>
          <logo-group icon-size="96" font-size="1.3em"></logo-group>
        </v-row>

        <!-- Form area -->
        <v-form style="width: 100%" @submit.prevent="login">
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
              ref="submitBtn"
              type="submit"
              color="primary"
              :disabled="isLoading"
              :loading="isLoading"
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
import { onLongPress } from "@vueuse/core";
import { API, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";

const submitBtn = ref();

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

// Pinia storage
const systemStore = useSystemStore();
systemStore;
const modalStore = useModalStore();

// Data
const loginData = reactive({
  my_id: "",
  password: "",
});
// const keepLogin = ref(false);
const skipValidityCheck = ref(false);

// Methods
onLongPress(submitBtn, () => (skipValidityCheck.value = true), {
  delay: 1000,
});
const { isLoading, execute } = useAPI();
const login = () => {
  if (
    !skipValidityCheck.value &&
    (!validMyID(loginData.my_id) || !validPW(loginData.password))
  )
    return loginFailed();

  execute(
    constructQuery({
      name: API.SignIn,
      args: loginData,
      fields: ["id", "name", "email", "is_staff"],
    })
  )
    .then(({ data: response }) => {
      if (!response.value.data[API.SignIn]) loginFailed();
      else {
        systemStore.login({ ...loginData, ...response.value.data[API.SignIn] });
        router.push(
          router.currentRoute.value.query.redirect ?? {
            name: pages.Main,
            replace: true,
          }
        );
      }
    })
    .catch(modalStore.showErrorMessage)
    .finally(() => (skipValidityCheck.value = false));
};
const loginFailed = () => {
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
