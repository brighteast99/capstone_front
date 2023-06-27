<template>
  <v-card class="background">
    <v-container style="max-width: 480px">
      <v-row>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <v-avatar size="128">
            <v-icon icon="mdi-account-circle" size="128" color="primary">
            </v-icon>
          </v-avatar>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>

      <v-row>
        <v-col>
          <v-text-field
            v-model="formData.name.value"
            label="닉네임"
            variant="underlined"
            color="primary"
            density="compact"
            hide-details
            :error="
              formData.name.validity.display && !formData.name.validity.value
            "
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
                    :color="
                      Validator.validityColor(formData.name.validity.length)
                    "
                    :icon="
                      Validator.validityIcon(formData.name.validity.length)
                    "
                  ></v-icon>
                </template>
                2~12자 길이
              </custom-btn>
              <custom-btn default-color="white">
                <template v-slot:prepend>
                  <v-icon
                    class="mr-3"
                    :icon="
                      Validator.validityIcon(
                        formData.name.validity.KorEngNumOnly
                      )
                    "
                    :color="
                      Validator.validityColor(
                        formData.name.validity.KorEngNumOnly
                      )
                    "
                  ></v-icon>
                </template>
                한글, 영문, 숫자만
              </custom-btn>
            </v-tooltip></v-text-field
          >
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <custom-dropdown
            class="px-0"
            v-model="formData.occupation"
            :items="occupations"
          ></custom-dropdown>
        </v-col>
      </v-row>

      <v-row>
        <v-col class="position-relative">
          <v-textarea
            v-model="formData.introduction"
            label="소개글 (100자 이내))"
            variant="underlined"
            color="primary"
            rows="5"
            no-resize
            hide-details
            :rules="[() => validIntroduction]"
          >
          </v-textarea>
          <span
            class="text-disabled"
            :class="{ 'text-error': !validIntroduction }"
            style="position: absolute; bottom: -0.7em; right: 1.2em"
          >
            {{ `${formData.introduction.length} / 100` }}
          </span>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          포트폴리오 링크
          <v-list class="border rounded-sm" density="compact">
            <v-list-item
              density="compact"
              v-for="link in formData.links"
              :key="link"
            >
              <v-text-field
                v-model="link.link"
                variant="underlined"
                color="primary"
                density="compact"
              ></v-text-field>
              <template v-slot:append>
                <custom-btn color="error" @click="removeLink(link)">
                  <v-icon icon="mdi-minus"></v-icon>
                </custom-btn>
              </template>
            </v-list-item>
            <v-list-item
              class="text-center px-3"
              @click="formData.links.push({ link: '' })"
            >
              <v-icon icon="mdi-plus"></v-icon>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <v-row class="pt-5">
        <custom-btn class="px-0" size="small" @click="changePW = !changePW">
          비밀번호 변경
          <template v-slot:append>
            <v-icon
              :icon="changePW ? 'mdi-chevron-down' : 'mdi-chevron-up'"
              size="small"
            ></v-icon>
          </template>
        </custom-btn>
        <v-expand-transition>
          <v-container v-if="changePW" class="pa-0 pt-3">
            <v-row>
              <v-col>
                <v-text-field
                  label="변경할 비밀번호"
                  v-model="formData.pw.value"
                  variant="underlined"
                  color="primary"
                  density="compact"
                  hide-details
                  :error="
                    formData.pw.validity.display && !formData.pw.validity.value
                  "
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
                    <div v-if="formData.pw.validity.dontChange">
                      비밀번호를 변경하지 않을 경우 생략
                    </div>
                    <div v-else>
                      <custom-btn default-color="white">
                        <template v-slot:prepend>
                          <v-icon
                            class="mr-3"
                            :icon="
                              Validator.validityIcon(
                                formData.pw.validity.length
                              )
                            "
                            :color="
                              Validator.validityColor(
                                formData.pw.validity.length
                              )
                            "
                          ></v-icon>
                        </template>
                        8~20자 길이
                      </custom-btn>
                      <custom-btn default-color="white">
                        <template v-slot:prepend>
                          <v-icon
                            class="mr-3"
                            :icon="
                              Validator.validityIcon(
                                formData.pw.validity.noOther
                              )
                            "
                            :color="
                              Validator.validityColor(
                                formData.pw.validity.noOther
                              )
                            "
                          ></v-icon>
                        </template>
                        영문, 숫자, 특수문자만
                      </custom-btn>
                      <custom-btn default-color="white">
                        <template v-slot:prepend>
                          <v-icon
                            class="mr-3"
                            :icon="
                              Validator.validityIcon(
                                formData.pw.validity.containEng
                              )
                            "
                            :color="
                              Validator.validityColor(
                                formData.pw.validity.containEng
                              )
                            "
                          ></v-icon>
                        </template>
                        영문 포함(대문자 또는 소문자)
                      </custom-btn>
                      <custom-btn default-color="white">
                        <template v-slot:prepend>
                          <v-icon
                            class="mr-3"
                            :icon="
                              Validator.validityIcon(
                                formData.pw.validity.containNum
                              )
                            "
                            :color="
                              Validator.validityColor(
                                formData.pw.validity.containNum
                              )
                            "
                          ></v-icon>
                        </template>
                        숫자 포함
                      </custom-btn>
                      <custom-btn default-color="white">
                        <template v-slot:prepend>
                          <v-icon
                            class="mr-3"
                            :icon="
                              Validator.validityIcon(
                                formData.pw.validity.containSC
                              )
                            "
                            :color="
                              Validator.validityColor(
                                formData.pw.validity.containSC
                              )
                            "
                          ></v-icon>
                        </template>
                        ! @ # $ % & * 중 하나 이상 포함
                      </custom-btn>
                    </div>
                  </v-tooltip>
                </v-text-field>
              </v-col>
            </v-row>

            <v-expand-transition>
              <v-row v-if="!formData.pw.validity.dontChange">
                <v-col>
                  <v-text-field
                    label="변경할 비밀번호 확인"
                    v-model="formData.pwConfirm.value"
                    variant="underlined"
                    color="primary"
                    density="compact"
                    hide-details
                    :error="
                      formData.pwConfirm.validity.display &&
                      !formData.pwConfirm.validity.value
                    "
                    :type="
                      formData.pwConfirm.visibility.value ? 'text' : 'password'
                    "
                    :append-inner-icon="
                      formData.pwConfirm.visibility.value
                        ? 'mdi-eye-off'
                        : 'mdi-eye'
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
                      <div v-if="formData.pw.validity.dontChange">
                        비밀번호를 변경하지 않습니다
                      </div>
                      <div v-else>
                        <custom-btn default-color="white">
                          <template v-slot:prepend>
                            <v-icon
                              class="mr-3"
                              :icon="
                                Validator.validityIcon(
                                  formData.pwConfirm.validity.value
                                )
                              "
                              :color="
                                Validator.validityColor(
                                  formData.pwConfirm.validity.value
                                )
                              "
                            ></v-icon>
                          </template>
                          비밀번호 일치
                        </custom-btn>
                      </div>
                    </v-tooltip>
                  </v-text-field>
                </v-col>
              </v-row>
            </v-expand-transition>
          </v-container>
        </v-expand-transition>
      </v-row>

      <v-row>
        <v-col class="px-0 pt-10">
          <v-btn block variant="flat" color="primary" @click="submit">
            정보 수정
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";
import CustomDropdown from "@/components/CustomDropdown.vue";

import { reactive, ref, computed, onBeforeMount } from "vue";
import * as Validator from "@/modules/validator";
import { createToggle, escapeString } from "@/modules/utility";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";
import { useModalStore, useSystemStore } from "@/store";
import { modalPresets } from "@/store/modal.store";
import router, { pages } from "@/router";

// Pinia storage
const systemStore = useSystemStore();
const modalStore = useModalStore();

// Data
const formData = reactive({
  name: {
    value: systemStore.currentUser.name,
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
  occupation: "",
  introduction: "",
  links: [],
  pw: {
    value: "",
    tooltip: false,
    visibility: createToggle(false),
    validity: {
      display: false,
      dontChange: computed(() => formData.pw.value == ""),
      length: computed(() => Validator.lengthBetween(formData.pw.value, 8, 20)),
      containEng: computed(() => Validator.containEng(formData.pw.value)),
      containNum: computed(() => Validator.containNum(formData.pw.value)),
      containSC: computed(() => Validator.containSC(formData.pw.value)),
      noOther: computed(() => Validator.EngNumSCOnly(formData.pw.value)),
      value: computed(
        () =>
          formData.pw.validity.dontChange ||
          Validator.validPW(formData.pw.value)
      ),
    },
  },
  pwConfirm: {
    value: "",
    tooltip: false,
    visibility: createToggle(false),
    validity: {
      display: false,
      value: computed(
        () =>
          formData.pw.validity.dontChange ||
          formData.pw.value === formData.pwConfirm.value
      ),
    },
  },
});
const occupations = reactive([]);
const validIntroduction = computed(
  () => formData.introduction.length <= 100 || ""
);
let removedLinks = [];
const changePW = ref(false);
let portfolio_id = null;

// Hook
onBeforeMount(async () => {
  const api = new apiRequest();

  await api
    .push(API.GetUser, { id: Number(systemStore.currentUser.id) }, "occupation")
    .push(API.GetOccupations, null, "name")
    .send()
    .then(parseResponse)
    .then((response) => {
      const userData = response[API.GetUser];

      occupations.push(
        ...response[API.GetOccupations]
          .map((occupation) => occupation.name)
          .sort((a, b) => a.localeCompare(b))
      );
      formData.occupation = userData.occupation || occupations[0];
    });

  await api
    .execute(
      API.GetPortfolio,
      { user_id: Number(systemStore.currentUser.id) },
      ["id", "introduction"]
    )
    .then(parseResponse)
    .then((response) => {
      portfolio_id = response[API.GetPortfolio].id;
      formData.introduction = response[API.GetPortfolio].introduction;
    });

  if (portfolio_id)
    api
      .execute(API.GetLinks, { portfolio_id: Number(portfolio_id) }, [
        "id",
        "link",
      ])
      .then(parseResponse)
      .then((response) => formData.links.push(...response[API.GetLinks]));
});

// Method
const removeLink = (link) => {
  formData.links.splice(formData.links.indexOf(link), 1);
  if (link.id) removedLinks.push(link);
};

const submit = () => {
  if (!formData.name.validity.value)
    return modalStore.openModal("유효하지 않은 닉네임입니다", null, {
      actions: modalPresets.OK,
    });

  if (!validIntroduction.value)
    return modalStore.openModal("소개글은 100자 이내여야 합니다.", null, {
      actions: modalPresets.OK,
    });

  if (!formData.pw.validity.value || !formData.pwConfirm.validity.value)
    return modalStore.openModal(
      "변경할 비밀번호 또는 비밀번호 확인이 유효하지 않습니다",
      null,
      {
        actions: modalPresets.OK,
      }
    );

  const api = new apiRequest();

  api.push(API.EditUser, {
    id: Number(systemStore.currentUser.id),
    name: formData.name.value,
    occupation: formData.occupation,
  });

  if (!formData.pw.validity.dontChange) {
    api.push(API.ModifyPassword, {
      id: Number(systemStore.currentUser.id),
      password: formData.pw.value,
    });
  }

  if (portfolio_id) {
    api.push(API.UpdatePortfolio, {
      id: Number(portfolio_id),
      introduction: escapeString(formData.introduction),
      skill: ".",
    });

    for (const link of formData.links) {
      if (link.id) continue;
      api.push(
        API.CreateLink,
        {
          portfolio_id: Number(portfolio_id),
          link: escapeString(link.link),
        },
        "id"
      );
    }
    for (const link of removedLinks) {
      api.push(API.DeleteLink, {
        id: Number(link.id),
      });
    }
    api.send().then(() =>
      router.push({
        name: pages.UserInfo,
        params: { userId: systemStore.currentUser.id },
      })
    );
  } else {
    api.push(
      API.CreatePortfolio,
      {
        user_id: Number(systemStore.currentUser.id),
        introduction: escapeString(formData.introduction),
        skill: ".",
      },
      "id"
    );

    api
      .send()
      .then(parseResponse)
      .then(async (response) => {
        if (formData.links.length) {
          for (const link of formData.links) {
            if (link.id) continue;
            api.push(
              API.CreateLink,
              {
                portfolio_id: Number(response[API.CreatePortfolio].id),
                link: escapeString(link.link),
              },
              "id"
            );
          }

          await api.send();
        }
        router.push({
          name: pages.UserInfo,
          params: { userId: systemStore.currentUser.id },
        });
      });
  }
};
</script>

<style scoped>
.background {
  max-width: 720px;
  margin: 40px auto 40px auto;
  position: relative;
}
</style>
