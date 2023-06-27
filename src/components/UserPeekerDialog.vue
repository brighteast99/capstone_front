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
              `전체 보기 ${newApplications[0] ? `(${newApplications[0]})` : ""}`
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
              `${group.occupation.name} ${
                newApplications[i + 1] ? `(${newApplications[i + 1]})` : ""
              }`
            }}
          </custom-btn>
        </v-card-text>
        <v-card-actions style="min-height: unset">
          <v-switch
            v-if="props.mode == 'EVALUATION'"
            v-model="includeEvaluated"
            density="compact"
            color="primary"
            hide-details
          >
            <template v-slot:label>
              <span style="font-size: 0.85em"> 취소 ・ 거절 포함 </span>
            </template>
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
          {{ titleText }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text
          class="pt-2 px-1 modal-content"
          style="background-color: #fafafa"
        >
          <error-block v-if="!displayList.length">
            <span style="font-size: 0.8em">
              {{ emptyText }}
            </span>
          </error-block>
          <div v-else>
            <div
              v-for="item in displayList"
              :key="item"
              class="d-flex flex-column"
            >
              <v-card
                class="ma-1 pa-2"
                elevation="2"
                :style="{
                  backgroundColor:
                    item.result == null ||
                    item.result == 'PASS' ||
                    item.result == 'APPLY'
                      ? 'white'
                      : '#f0f0f0',
                }"
              >
                <v-card-text class="px-1 py-2">
                  <div class="d-flex align-center w-100">
                    <writer-info
                      :writer="item[user]"
                      :date="item.date_created"
                      :small="true"
                      :showMySelf="props.mode != 'HISTORY'"
                    ></writer-info>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="props.mode != 'HISTORY'"
                      size="x-small"
                      :color="
                        selectedUser == item[user].id ? 'error' : 'primary'
                      "
                      variant="outlined"
                      :active="selectedUser == item[user].id"
                      style="font-size: 0.8em"
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
                <v-expand-transition>
                  <v-card-actions
                    v-if="props.mode == 'FAVORITES'"
                    class="d-flex align-center justify-center pt-3 pb-0"
                    style="min-height: unset"
                  >
                    <custom-btn size="medium"> 참여 제의 </custom-btn>
                  </v-card-actions>
                  <v-card-actions
                    v-else-if="
                      (props.mode != 'CREW' || !currentGroup) && item?.result
                    "
                    class="d-flex align-center justify-center pt-3 pb-0"
                    style="min-height: unset"
                  >
                    <error-block height="24">
                      <div v-if="props.mode != 'CREW'">
                        <div v-if="item.result == 'APPLY'">
                          <div v-if="props.mode == 'EVALUATION'" class="d-flex">
                            <custom-btn
                              color="secondary"
                              width="50%"
                              @click="evaluateApplication(item, true)"
                            >
                              수락
                            </custom-btn>
                            <v-spacer></v-spacer>
                            <custom-btn
                              color="error"
                              width="50%"
                              :active="tobeDeleted == item.id"
                              @click="
                                if (tobeDeleted == item.id) tobeDeleted = null;
                                else tobeDeleted = item.id;
                              "
                            >
                              거절
                            </custom-btn>
                          </div>
                          <span v-else class="text-secondary"> 지원 접수 </span>
                        </div>
                        <span
                          v-if="item.result == 'CANCEL'"
                          class="text-disabled"
                        >
                          지원 취소
                        </span>
                        <span
                          v-else-if="item.result == 'PASS'"
                          class="text-primary"
                        >
                          참여중
                        </span>
                        <span
                          v-else-if="item.result == 'FAIL'"
                          class="text-error"
                        >
                          {{ props.mode == "EVALUATION" ? "거절함" : "거절됨" }}
                          <span
                            v-if="item?.memo"
                            style="font-size: 0.7em; cursor: pointer"
                          >
                            <v-icon
                              icon="mdi-email-alert-outline"
                              size="small"
                            ></v-icon>
                            <v-menu activator="parent" location="right">
                              <v-card
                                class="text-center"
                                density="compact"
                                style="width: 15rem"
                              >
                                <v-card-title class="py-2">
                                  거절 사유
                                </v-card-title>
                                <v-divider></v-divider>
                                <v-card-text
                                  style="background-color: #fcfcfc"
                                  :class="{ 'text-disabled': !item.memo }"
                                >
                                  {{ item?.memo }}
                                </v-card-text>
                              </v-card>
                            </v-menu>
                          </span>
                        </span>
                      </div>
                      <span
                        v-if="props.mode != 'FAVORITES' && currentGroup == null"
                        :style="{
                          fontSize: props.mode == 'CREW' ? '0.9em' : '0.7em',
                        }"
                        :class="{
                          'text-black': props.mode == 'CREW',
                        }"
                      >
                        {{
                          props.mode == "CREW"
                            ? item.occupation
                            : ` (${item.occupation})`
                        }}
                      </span>
                    </error-block>
                  </v-card-actions>
                </v-expand-transition>
              </v-card>

              <v-expand-transition>
                <v-card
                  v-if="props.mode == 'EVALUATION' && tobeDeleted == item.id"
                  class="mx-1"
                >
                  <v-card-text class="pb-0 position-relative">
                    <v-textarea
                      v-model="memo"
                      label="거절 사유(100자 이내, 생략 가능)"
                      color="primary"
                      variant="underlined"
                      density="compact"
                      hide-details
                      noResize
                      rows="6"
                      :rules="[() => validMemo]"
                    >
                    </v-textarea>
                    <span
                      class="text-disabled"
                      :class="{ 'text-error': !validMemo }"
                      style="position: absolute; bottom: 0; right: 1.2em"
                    >
                      {{ `${memo.length} / 100` }}
                    </span>
                  </v-card-text>
                  <v-card-actions style="min-height: unset">
                    <v-btn
                      block
                      color="error"
                      size="small"
                      @click="if (validMemo) evaluateApplication(item, false);"
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
import { escapeString } from "@/modules/utility";

// Pinia storage
const modalStore = useModalStore();

// Data
const mv = useVModel(props, "modelValue", emits);
const expanded = ref(false);
const useGroupView = computed(() => props.groups != null);
const titleText = computed(() => {
  switch (props.mode) {
    case "FAVORITES":
      return "관심을 표시한 유저";
    case "EVALUATION":
      return "지원자 현황";
    case "HISTORY":
      return "나의 지원 기록";
    case "CREW":
      return "팀원 현황";
    default:
      return "";
  }
});
const emptyText = computed(() => {
  switch (props.mode) {
    case "FAVORITES":
      return "아직 관심을 표시한 유저가 없습니다";
    case "EVAULATION":
      return "아직 지원자가 없습니다";
    case "HISTORY":
      return "지원한 적 없는 프로젝트입니다";
    case "CREW":
      return "아직 팀원이 없습니다";
    default:
      return "";
  }
});
const user = computed(() => (props.mode == "FAVORITES" ? "user" : "applicant"));
const currentGroup = ref();
const includeEvaluated = ref(false);
const displayList = computed(() => {
  if (!useGroupView.value) return props.list;

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

  return selectedGroup.filter((application) => {
    if (includeEvaluated.value) return true;
    else {
      switch (props.mode) {
        case "EVALUATION":
          return application.result == "APPLY" || application.result == "PASS";
        case "HISTORY":
          return true;
        case "CREW":
          return application.result == "PASS";
        default:
          return true;
      }
    }
  });
});
const newApplications = computed(() => {
  const newForEachGroups = props.groups.map(
    (group) =>
      group.applyforrecruitment_set.filter((application) => {
        if (includeEvaluated.value) return true;
        else {
          switch (props.mode) {
            case "EVALUATION":
              return (
                application.result == "APPLY" || application.result == "PASS"
              );
            case "CREW":
              return application.result == "PASS";
            default:
              return true;
          }
        }
      }).length
  );
  const total = newForEachGroups.reduce((accum, current) => accum + current);
  return [total, ...newForEachGroups];
});

const selectedUser = ref();
const tobeDeleted = ref();
const memo = ref("");
const validMemo = computed(() => memo.value.length <= 100 || "");

// Props & Emits
const props = defineProps({
  modelValue: {
    Type: Boolean,
    default: false,
  },
  list: {
    Type: [
      {
        id: Number | String,
        user: { id: Number | String, name: String },
        date_created: Date | String,
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
  mode: String,
});
const emits = defineEmits(["update:modelValue"]);

// Watches
watch(mv, (value) => {
  if (value && props.mode != "HISTORY")
    selectedUser.value = displayList.value[0]?.[user.value].id;
});
watch(
  currentGroup,
  () => {
    if (props.mode != "HISTORY")
      selectedUser.value = displayList.value[0]?.[user.value].id;
  },
  { immediate: true }
);
watch(
  includeEvaluated,
  () => {
    if (props.mode != "HISTORY")
      selectedUser.value = displayList.value[0]?.[user.value].id;
  },
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

  let data = {
    id: Number(application.id),
    result: evalResult,
  };
  if (!result && memo.value) data.memo = escapeString(memo.value);

  new apiRequest()
    .execute(API.EvalApplication, data)
    .then(parseResponse)
    .then((result) => {
      if (result[API.EvalApplication]) {
        application.result = evalResult.toUpperCase();
        application.meno = memo.value;
        tobeDeleted.value = null;
        memo.value = "";
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
  transition: all 0.3s;
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
  height: 30rem;
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
  overflow-x: scroll;
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
