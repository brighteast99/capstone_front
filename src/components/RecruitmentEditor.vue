<template>
  <div class="selector-wrapper">
    <div class="occupation-list-area">
      <v-text-field
        class="search"
        v-model="keyword"
        variant="underlined"
        hide-details
        density="compact"
        color="primary"
      >
        <template v-slot:prepend-inner>
          <v-icon
            icon="mdi-magnify"
            size="small"
            style="align-self: center"
          ></v-icon>
        </template>
      </v-text-field>

      <div class="occupation-list">
        <error-block
          v-if="isLoading || error"
          :loading="isLoading"
          height="100%"
        >
          직군을 불러오지 못했습니다. <br />
          나중에 다시 시도하거나 관리자에게 문의 바랍니다.
        </error-block>
        <div v-else>
          <custom-btn
            v-for="occupation in filtered"
            :key="occupation"
            :color="excluded(occupation.id) ? 'error' : 'primary'"
            :active="included(occupation.id) || excluded(occupation.id)"
            @click="toggleOccupation(occupation)"
          >
            {{ occupation.name }}
          </custom-btn>
        </div>
      </div>
    </div>

    <div class="recruits-area">
      <div class="recruits-list-header">
        <div class="recruits-list-header-item w-75">직군</div>
        <div v-if="props.existing" class="recruits-list-header-item w-25">
          승인 현황
        </div>
        <div class="recruits-list-header-item w-25">모집 인원</div>
        <div v-if="props.existing" class="recruits-list-header-item w-25">
          모집 상태
        </div>
        <div class="recruits-list-header-item w-50">모집 관리</div>
      </div>

      <div class="recruits-list">
        <error-block v-if="!allRecruits.length" height="100%">
          아직 모집 직군을 설정하지 않았습니다.<br />
          좌측 목록에서 원하는 직군을 추가해보세요.
        </error-block>
        <div v-else>
          <div
            v-for="recruit in recruitsToDisplay"
            :key="recruit"
            class="recruits-list-row"
            :class="{ excluded: recruit.excluded }"
          >
            <div class="w-75">{{ recruit.occupation.name }}</div>
            <div v-if="props.existing" class="text-center w-25">
              {{ recruit.current_cnt }}
            </div>
            <div class="text-center w-25 d-flex justify-center">
              <custom-btn
                :disabled="
                  recruit.excluded ||
                  recruit.is_closed ||
                  recruit.max_cnt == 1 ||
                  recruit.max_cnt == recruit.current_cnt
                "
                @click="modifyRecruitCount(recruit, -1)"
              >
                <v-icon icon="mdi-minus" size="small"></v-icon>
                <v-tooltip
                  location="left"
                  :disabled="
                    recruit.excluded ||
                    recruit.is_closed ||
                    recruit.max_cnt > recruit.current_cnt
                  "
                  activator="parent"
                >
                  이미 참여한 인원보다 적게 설정할 수 없습니다
                </v-tooltip>
              </custom-btn>

              <span
                :class="{ 'text-disabled': recruit.is_closed }"
                style="flex: 1 0"
              >
                {{ recruit.excluded ? 0 : recruit.max_cnt }}
              </span>

              <custom-btn
                :disabled="
                  recruit.excluded ||
                  recruit.is_closed ||
                  recruit.max_cnt == MAX_RECRUIT
                "
                @click="modifyRecruitCount(recruit, 1)"
              >
                <v-icon icon="mdi-plus" size="small"></v-icon>
                <v-tooltip
                  :disabled="
                    recruit.excluded ||
                    recruit.is_closed ||
                    recruit.max_cnt < MAX_RECRUIT
                  "
                  activator="parent"
                >
                  {{ `직군별 최대 ${MAX_RECRUIT}명까지 모집 가능합니다` }}
                </v-tooltip>
              </custom-btn>
            </div>
            <div v-if="props.existing" class="text-center w-25">
              <v-chip
                density="compact"
                :color="
                  recruit.excluded
                    ? 'error'
                    : recruit.is_closed
                    ? 'warning'
                    : 'secondary'
                "
              >
                {{
                  recruit.excluded
                    ? "취소됨"
                    : recruit.is_closed
                    ? "마감됨"
                    : "모집중"
                }}
              </v-chip>
            </div>
            <div class="w-50 d-flex justify-center">
              <custom-btn
                v-if="props.existing && !recruit.excluded"
                @click="recruit.is_closed = !recruit.is_closed"
              >
                {{ recruit.is_closed ? "모집 재개" : "모집 마감" }}
              </custom-btn>
              <custom-btn
                :color="recruit.excluded ? 'primary' : 'error'"
                @click="tryToggleRecruitment(recruit)"
              >
                {{ recruit.excluded ? "되돌리기" : "모집 취소" }}
              </custom-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";
import ErrorBlock from "./ErrorBlock.vue";

import {
  ref,
  reactive,
  defineProps,
  defineEmits,
  onBeforeMount,
  watch,
} from "vue";
import { useArrayFilter, useSorted } from "@vueuse/core";
import { API, useAPI, parseResponse } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { useModalStore } from "@/store";
import {
  modalActions,
  modalPresets,
  modalResponses,
} from "@/store/modal.store";

// Pinia storage
const modalStore = useModalStore();

// Data
const keyword = ref("");
const occupationList = reactive([]);
const filtered = useArrayFilter(occupationList, (item) => {
  if (!keyword.value.length) return true;
  return item.name.includes(keyword.value);
});
const allRecruits = reactive([]);
const exceptStopped = useArrayFilter(
  allRecruits,
  (recruit) => !recruit.is_stopped || recruit.revert
);
const recruitsToDisplay = useSorted(exceptStopped, (a, b) =>
  a.occupation.name.localeCompare(b.occupation.name)
);
const MAX_RECRUIT = 10;

// Props & Emits
const props = defineProps({
  modelValue: {
    Type: [
      {
        id: Number | String,
        occupation: {
          id: Number | String,
          name: String,
        },
        current_cnt: Number | String,
        max_cnt: Number | String,
        is_closed: Boolean,
        is_stopped: Boolean,
      },
    ],
    default: [],
  },
  existing: {
    Type: Boolean,
    default: true,
  },
});
const emits = defineEmits(["update:modelValue"]);

// Hooks
onBeforeMount(() => {
  fetchOccupations();
});

// Watches
watch(allRecruits, (value) => emits("update:modelValue", value));
watch(
  () => props.modelValue,
  (value) => {
    if (JSON.stringify(allRecruits) !== JSON.stringify(value))
      allRecruits.splice(0, allRecruits.length, ...value);
  },
  { immediate: true }
);

// Methods
const { isLoading, error, execute } = useAPI();
const fetchOccupations = () => {
  execute(
    constructQuery({
      name: API.GetOccupations,
      args: null,
      fields: ["id", "name"],
    })
  )
    .then(parseResponse)
    .then((response) => {
      occupationList.push(
        ...response[API.GetOccupations].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    })
    .catch(() => (error.value = true));
};

const included = (id) => {
  return allRecruits.some(
    (recruit) =>
      recruit.occupation.id == id &&
      (!recruit.is_stopped || recruit.revert) &&
      !recruit.excluded
  );
};
const excluded = (id) => {
  return allRecruits.some(
    (recruit) => recruit.occupation.id == id && recruit.excluded
  );
};

const toggleOccupation = (occupation) => {
  const target = allRecruits.find(
    (recruit) => recruit.occupation.id == occupation.id
  );
  if (included(occupation.id)) {
    // New recruitment
    if (target.id == null) exclude(target);
    // Reverted or existing recruitment
    else tryToggleRecruitment(target);
  } else {
    // New recruitment
    if (!target) include(occupation);
    // Withdrawn or excluded recruitment
    else tryToggleRecruitment(target);
  }
};

const tryToggleRecruitment = async (recruit) => {
  if (included(recruit.occupation.id)) {
    // New or reverted recruitment
    if (recruit.max_cnt > 1 || (recruit.id != null && !recruit.is_stopped)) {
      let message = `${recruit.occupation.name}\n직군의 모집을 취소합니다`;
      if (recruit.current_cnt)
        message += "\n주의: 이미 참여한 인원까지 모두 취소처리됩니다.";
      const response = await modalStore.openModal(message, null, {
        actions: [
          {
            label: "모집 취소",
            response: modalResponses.OK,
            color: "error",
          },
          modalActions.SafeCancel,
        ],
      });

      if (response == modalResponses.Cancel) return;
    }
    exclude(recruit);
  } else {
    if (recruit.excluded) {
      const response = await modalStore.openModal(
        `${recruit.occupation.name}\n직군을 모집 대상에 다시 포함합니다.`,
        null,
        {
          actions: modalPresets.OKCancel,
        }
      );
      if (response == modalResponses.Cancel) return;
    }
    include(recruit.occupation);
  }
};

const include = (occupation) => {
  if (included(occupation.id)) return;

  const target = allRecruits.find(
    (recruit) => recruit.occupation.id == occupation.id
  );
  // New recruitment
  if (!target) {
    allRecruits.push({
      occupation: occupation,
      current_cnt: 0,
      max_cnt: 1,
      is_closed: false,
      is_stopped: false,
    });
  }
  // Withdrawn or active recruitment
  else {
    // Withdrawn recruitment
    if (target.is_stopped) {
      target.revert = true;
      target.is_closed = false;
      target.max_cnt = 1;
    }
    // Active recruitment
    else {
      delete target.excluded;
      target.is_closed = target.max_cnt == target.current_cnt;
    }
  }
};
const exclude = (recruit) => {
  if (!included(recruit.occupation.id)) return;

  //  Existing recruitment
  if (recruit.id != null) {
    // Withdrawn recruitment
    if (recruit.is_stopped) {
      delete recruit.revert;
      recruit.is_closed = true;
    }
    // Active recruitment
    else recruit.excluded = true;
  }
  // New recruitment
  else allRecruits.splice(allRecruits.indexOf(recruit), 1);
};

const modifyRecruitCount = (recruit, variance) => {
  recruit.max_cnt = recruit.max_cnt + variance;

  if (recruit.max_cnt < recruit.current_cnt) {
    modalStore
      .openModal("", null, {
        actions: modalPresets.OK,
      })
      .then(() => (recruit.max_cnt = recruit.current_cnt));
  }

  if (recruit.max_cnt == recruit.current_cnt) return (recruit.is_closed = true);
  if (recruit.max_cnt == recruit.current_cnt + variance)
    return (recruit.is_closed = false);
};
</script>

<style scoped>
.selector-wrapper {
  display: flex;
  height: 20dvh;
  min-height: 10rem;
  border: 1px solid lightgray;
  border-radius: 3px;
}
.occupation-list-area {
  display: flex;
  flex-direction: column;
  border-right: lightgray 1px solid;
  width: 20%;
  height: 100%;
  padding: 0 8px 0 8px;
}

.search {
  display: block;
  margin-bottom: 0.5em;
  flex: 0 0;
}

.occupation-list {
  overflow-y: scroll;
  flex: 1 1;
}

.recruits-area {
  width: 80%;
  height: 100%;
}

.recruits-list-header {
  display: flex;
  height: 15%;
  border-bottom: lightgray 1px solid;
  padding: 0 8px 0 8px;
  align-items: center;
}

.recruits-list-header-item {
  text-align: center;
  color: gray;
}
.recruits-list-header-item:not(:nth-child(1)) {
  border-left: lightgray 1px solid;
}
.recruits-list {
  overflow-y: scroll;
  width: 100%;
  height: 83%;
  padding: 0 8px 0 8px;
}
.recruits-list-row {
  display: flex;
  align-items: center;
  padding: 0.5em 0 0.5em 0;
}
.recruits-list-row.excluded {
  background-color: #f0f0f0;
}
.recruits-list-row.excluded div:not(:nth-last-child(1)) {
  text-decoration: line-through;
  color: gray;
}
.recruits-list-row:not(:nth-last-child(1)) {
  border-bottom: lightgray 1px solid;
}
</style>
