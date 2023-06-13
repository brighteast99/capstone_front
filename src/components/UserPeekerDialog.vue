<template>
  <v-dialog v-model="mv" scrim="black">
    <div
      class="container"
      :class="{
        expanded: !!selectedUser && expanded,
        filtered: useGroupView,
      }"
      v-click-outside="
        () => {
          if (mv) mv = false;
        }
      "
    >
      <v-card v-if="useGroupView" class="filters">
        <v-card-title class="text"> 모집 구분 </v-card-title>
        <v-card-text style="flex-grow: 1">
          <custom-btn
            class="filterItem"
            :class="{ selected: !currentGroup }"
            :active="!currentGroup"
            size="medium"
            @click="currentGroup = null"
          >
            {{
              "전체 보기" +
              (newApplications[0] ? ` (${newApplications[0]})` : "")
            }}
          </custom-btn>
          <custom-btn
            v-for="(group, i) in props.groups"
            class="filterItem"
            :class="{ selected: currentGroup == group.id }"
            :key="group.id"
            :active="currentGroup == group.id"
            size="medium"
            @click="currentGroup = group.id"
          >
            {{
              group.occupation.name +
              (newApplications[i + 1] ? ` (${newApplications[i + 1]})` : "")
            }}
          </custom-btn>
        </v-card-text>
        <v-card-actions style="min-height: unset">
          <v-switch
            v-model="includeEvaluated"
            density="compact"
            color="primary"
            hide-details
            label="확인한 지원 포함"
          >
          </v-switch>
        </v-card-actions>
      </v-card>

      <v-card
        class="list"
        :class="{
          expanded: !!selectedUser || expanded,
          'complete-expanded': expanded,
          filtered: useGroupView,
        }"
      >
        <v-card-title class="modal-title">
          {{ useGroupView ? "지원 현황" : "관심을 표시한 유저" }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text
          class="pt-2 px-1 modal-content"
          style="background-color: #fafafa"
        >
          <error-block v-if="!list.length">
            <span style="font-size: 0.8em">
              {{
                `아직 ${
                  useGroupView ? "지원자" : "관심 등록한 유저"
                }가 없습니다.`
              }}
            </span>
          </error-block>
          <div v-else>
            <div v-for="item in list" :key="item" class="d-flex flex-column">
              <v-card class="ma-1 pa-2" elevation="2">
                <v-expand-transition>
                  <v-card-title
                    v-if="currentGroup == 0"
                    class="py-0"
                    style="font-size: 1em; min-height: unset"
                  >
                    {{ item.occupation }}
                  </v-card-title>
                </v-expand-transition>

                <v-card-text class="px-1 py-2">
                  <div class="d-flex align-center w-100">
                    <writer-info
                      :writer="item[user]"
                      :date="item.date"
                      :small="true"
                    ></writer-info>
                    <v-spacer></v-spacer>
                    <v-btn
                      size="small"
                      :color="
                        selectedUser == item[user].id ? 'error' : 'primary'
                      "
                      variant="outlined"
                      :active="selectedUser == item[user].id"
                      @click="toggleUser(item[user].id)"
                    >
                      {{
                        selectedUser == item[user].id
                          ? "프로필 닫기"
                          : "프로필 보기"
                      }}
                    </v-btn>
                  </div>
                </v-card-text>
                <v-card-actions
                  v-if="item?.result"
                  class="d-flex align-center justify-center pt-3 pb-0"
                  style="min-height: unset"
                >
                  <div
                    v-if="item.result == 'APPLY'"
                    class="d-flex w-100 align-center justify-center"
                  >
                    <v-spacer></v-spacer>
                    <custom-btn
                      color="secondary"
                      variant="flat"
                      width="50%"
                      @click="evaluateApplication(item, true)"
                    >
                      수락
                    </custom-btn>
                    <v-spacer></v-spacer>
                    <custom-btn
                      color="error"
                      variant="flat"
                      width="50%"
                      :active="tobeDeleted == item.id"
                      @click="
                        if (tobeDeleted == item.id) tobeDeleted = null;
                        else tobeDeleted = item.id;
                      "
                    >
                      거절
                    </custom-btn>
                    <v-spacer></v-spacer>
                  </div>
                  <error-block v-else height="24">
                    <span v-if="item.result == 'CANCEL'" class="text-disabled">
                      지원 취소
                    </span>
                    <span
                      v-else-if="item.result == 'PASS'"
                      class="text-primary"
                    >
                      참여중
                    </span>
                    <span v-else-if="item.result == 'FAIL'" class="text-error">
                      거절함
                    </span>
                  </error-block>
                </v-card-actions>
              </v-card>
              <v-expand-transition>
                <v-card
                  v-if="useGroupView && tobeDeleted == item.id"
                  class="mx-1"
                >
                  <v-card-text class="pb-0">
                    <v-text-field
                      v-model="memo"
                      label="거절 사유(선택)"
                      color="primary"
                      variant="underlined"
                      density="compact"
                      hide-details
                    >
                    </v-text-field>
                  </v-card-text>
                  <v-card-actions style="min-height: unset">
                    <v-btn
                      block
                      color="error"
                      size="small"
                      @click="evaluateApplication(item, false)"
                    >
                      거절 확인
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-expand-transition>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="modal-actions">
          <custom-btn
            class="modal-action pt-3"
            color="error"
            @click="mv = false"
          >
            닫기
          </custom-btn>
        </v-card-actions>
      </v-card>
      <v-expand-x-transition>
        <v-card
          v-if="expanded && !!selectedUser"
          class="profile-viewer rounded-s-0"
        >
          <div class="profile-viewer-inner">
            <user-info-page :userId="selectedUser"></user-info-page>
          </div>
        </v-card>
      </v-expand-x-transition>
    </div>
  </v-dialog>
</template>

<script setup>
import WriterInfo from "./WriterInfo.vue";
import CustomBtn from "./CustomBtn.vue";
import UserInfoPage from "@/pages/UserInfoPage.vue";
import ErrorBlock from "./ErrorBlock.vue";

import { ref, computed, defineProps, defineEmits } from "vue";
import { useVModel } from "@vueuse/core";
import { watch } from "vue";
import { apiRequest, parseResponse } from "@/modules/Services/API";
import { API } from "@/modules/Services/API";
import { useModalStore } from "@/store/modal.store";

// Pinia storage
const modalStore = useModalStore();

// Data
const mv = useVModel(props, "modelValue", emits);
const expanded = ref(false);
const useGroupView = computed(() => props.groups != null);
const user = computed(() => (useGroupView.value ? "applicant" : "user"));
const currentGroup = ref();
const includeEvaluated = ref(false);
const list = computed(() => {
  if (!useGroupView.value) return props.users;

  let selectedGroup;
  if (!currentGroup.value)
    selectedGroup = props.groups
      .map((group) =>
        group.applyforrecruitment_set.map((application) => {
          application.occupation = group.occupation.name;
          return application;
        })
      )
      .flat();
  else
    selectedGroup = props.groups.find(
      (group) => group.id == currentGroup.value
    ).applyforrecruitment_set;

  if (includeEvaluated.value) return selectedGroup;
  else
    return selectedGroup.filter((application) => application.result == "APPLY");
});
const newApplications = computed(() => {
  const newForEachGroups = props.groups.map(
    (group) =>
      group.applyforrecruitment_set.filter(
        (application) => application.result == "APPLY"
      ).length
  );
  const total = newForEachGroups.reduce((accum, current) => accum + current);
  return [total, ...newForEachGroups];
});

const selectedUser = ref();
const tobeDeleted = ref();

// Props & Emits
const props = defineProps({
  modelValue: {
    Type: Boolean,
    default: false,
  },
  users: {
    Type: [
      {
        id: Number | String,
        user: { id: Number | String, name: String },
        date: String,
        result: String,
        recruitment: {
          id: Number | String,
          occupation: { id: Number | String, name: String },
        },
      },
    ],
    default: [],
  },
  groups: {
    Type: [
      {
        id: Number | String,
        occupation: { name: String },
        applyforrecruitment_set: [
          {
            id: Number | String,
            applicant: {
              id: Number | String,
              name: String,
            },
            result: String,
            date_created: Date | String,
          },
        ],
      },
    ],
  },
  selectedGroup: {
    Type: Number | String,
    default: null,
  },
});
const emits = defineEmits(["update:modelValue"]);

// Watches
watch(mv, (value) => {
  if (value && useGroupView.value) {
    currentGroup.value = props.selectedGroup ?? props.groups[0].id;
    selectedUser.value = list.value[0]?.[user.value].id;
  }
});
watch(
  currentGroup,
  () => (selectedUser.value = list.value[0]?.[user.value].id),
  { immediate: true }
);
watch(
  selectedUser,
  (value) => {
    setTimeout(
      () => (expanded.value = !!value),
      value ? (useGroupView.value ? 0 : 150) : 300
    );
  },
  { immediate: true }
);

// Methods
const toggleUser = (id) => {
  if (selectedUser.value == id) selectedUser.value = null;
  else selectedUser.value = id;
};
const evaluateApplication = (application, result) => {
  const evalResult = result ? "pass" : "fail";

  new apiRequest()
    .execute(API.EvalApplication, {
      id: Number(application.id),
      result: evalResult,
    })
    .then(parseResponse)
    .then((result) => {
      if (result[API.EvalApplication]) {
        application.result = evalResult.toUpperCase();
        tobeDeleted.value = null;
      } else throw new Error();
    })
    .catch(modalStore.showErrorMessage);
};
</script>

<style scoped>
.container {
  display: flex;
  justify-items: center;
  width: 288px;
  margin: auto;
  transition: all 0.3s;
}
.container.filtered:not(.expanded) {
  width: 480px;
  max-width: 1024px;
}
.container.expanded:not(.filtered) {
  width: 80dvw;
  max-width: 1024px;
}
.container.filtered.expanded {
  width: 90dvw;
  max-width: 1024px;
}

.filters {
  display: flex;
  flex-direction: column;
  width: 12rem;
  min-width: 12rem;
  height: 60dvh;
  transition: all 0.2s;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.filterItem {
  transition: all 0.2s;
  margin: 0.5em 0 0.5em 0;
}
.selected {
  margin-left: 5px;
}

.list {
  width: 18rem;
  min-width: 18rem;
  height: 20rem;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
}

.list.expanded {
  transition: all 0.3s;
  height: 60dvh;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.list.filtered {
  height: 60dvh;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.profile-viewer {
  transition: all 0.3s;
  height: 60dvh;
  padding: 0.5em 1em 0.5em 1em;
  background-color: #fafafa;
  flex-grow: 1;
}
.profile-viewer-inner {
  height: 100%;
  padding: 0 0 0.5em 0;
  overflow: scroll;
}

.modal-title {
  text-align: center;
}

.modal-content {
  flex: 1 0;
  overflow: scroll;
}

.modal-actions {
  padding: 0 3em 1em 3em;
  min-height: unset;
  bottom: 0;
}

.modal-action {
  flex: 1 1;
  width: 20%;
}
</style>
