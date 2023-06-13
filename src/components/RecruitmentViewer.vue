<template>
  <div
    v-if="applications.length && !application"
    class="pb-1 pl-5 d-flex align-center"
  >
    <v-icon icon="mdi-history" size="small" start></v-icon>
    <span>이 프로젝트에 지원한 기록이 있습니다.</span>
    <custom-btn @click.stop="showApplications = true">
      지원 내역 확인
    </custom-btn>
  </div>
  <div class="position-relative">
    <error-block
      v-if="error || !props.recruitments?.length"
      :loading="props.loading"
      height="30"
    >
      {{ errorMessage }}
    </error-block>
    <div v-else style="overflow: auto">
      <div class="d-flex px-4 py-1" style="gap: 1em">
        <recruitment-chip
          v-for="recruitment in props.recruitments"
          :key="recruitment"
          :owner="props.owner"
          :recruitment="recruitment"
          :disabled="application != null"
          :readonly="props.readonly"
          @click="
            if (!props.readonly) {
              applyForRecruitment(recruitment);
              emits('chip:click', {
                id: recruitment.id,
                name: recruitment.occupation.name,
              });
              if (props.owner) {
                selectedRecruitment = recruitment.id;
                showApplications = true;
              }
            }
          "
        >
        </recruitment-chip>
      </div>
    </div>

    <v-hover>
      <template v-slot:default="{ isHovering, props: hoverProps }">
        <error-block
          v-if="application"
          v-bind="hoverProps"
          height="30"
          color="primary"
          class="position-absolute"
          style="top: 0"
        >
          <v-fade-transition leave-absolute>
            <span v-if="!isHovering">
              {{ applyInfoMessage }}
            </span>
            <div v-else class="d-flex">
              <custom-btn
                size="large"
                @click.stop="
                  selectedRecruitment = null;
                  showApplications = true;
                "
              >
                {{ application?.result == "PASS" ? "팀원 현황" : "지원 기록" }}
              </custom-btn>
              <custom-btn
                v-if="application?.result == 'APPLY'"
                class="d-inline-block"
                color="error_variant"
                size="large"
                @click.stop="cancelApplication(application.id)"
              >
                지원 취소
              </custom-btn>
            </div>
          </v-fade-transition>
        </error-block>
      </template>
    </v-hover>
  </div>

  <!-- Applicantion detail view -->
  <user-peeker-dialog
    v-model="showApplications"
    :list="applications"
    :groups="groups"
    :selected-group="selectedRecruitment"
    :mode="mode"
  ></user-peeker-dialog>
</template>

<script setup>
import RecruitmentChip from "@/components/RecruitmentChip.vue";
import ErrorBlock from "@/components/ErrorBlock.vue";
import CustomBtn from "@/components/CustomBtn.vue";
import UserPeekerDialog from "@/components/UserPeekerDialog.vue";

import { ref, reactive, computed, defineProps, defineEmits, watch } from "vue";
import { useSystemStore, useModalStore } from "@/store";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";
import { modalPresets, modalResponses } from "@/store/modal.store";

// Pinia storage
const systemStore = useSystemStore();
const modalStore = useModalStore();

const applications = reactive([]);
const application = computed(() =>
  applications.find(
    (apply) => apply.result == "APPLY" || apply.result == "PASS"
  )
);
const applyInfoMessage = computed(() => {
  switch (application.value?.result) {
    case "PASS":
      return `${application.value.occupation}(으)로 참여했습니다.`;
    case "APPLY":
      return `${application.value.occupation}(으)로 지원했습니다.`;
    default:
      return "";
  }
});
const errorMessage = computed(() => {
  if (props.error)
    return "모집 정보를 불러오지 못했습니다.\n나중에 다시 시도하거나 관리자에게 문의 바랍니다.";
  if (!props.recruiments?.length) return "모집 정보가 없습니다";
  return "";
});
const showApplications = ref(false);
const selectedRecruitment = ref();
const groups = computed(() => {
  if (props.owner || application.value?.result == "PASS")
    return props.recruitments;
  else return null;
});
const mode = computed(() => {
  if (props.owner) return "EVALUATION";
  if (application.value?.result == "PASS") return "CREW";
  return "HISTORY";
});

const props = defineProps({
  loading: {
    Type: Boolean,
    default: true,
  },
  error: {
    Type: Boolean,
    defult: false,
  },
  owner: {
    Type: Boolean,
    default: false,
  },
  recruitments: {
    Type: [
      {
        id: Number | String,
        occupation: {
          name: String,
        },
        applyforrecruitment_set: Array,
      },
    ],
    default: [],
  },
  readonly: {
    Type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["chip:click"]);

watch(
  () => props.recruitments,
  (value) => {
    if (!value) return;

    const apply_set = value
      .map((recruitment) =>
        recruitment.applyforrecruitment_set.map((apply) => {
          apply.occupation = recruitment.occupation.name;
          apply.recruitment_id = recruitment.id;
          return apply;
        })
      )
      .flat()
      .filter(
        (application) => application.applicant.id == systemStore.currentUser.id
      )
      .sort((a, b) => b.date_created.localeCompare(a.date_created));

    applications.splice(0, applications.length, ...apply_set);
  },
  { deep: true }
);

// Method
const applyForRecruitment = (recruitment) => {
  if (props.owner) return;

  if (recruitment.is_closed)
    return modalStore.openModal(
      `${recruitment.occupation.name} 직군은 현재 구인이 마감되었습니다`,
      null,
      {
        actions: modalPresets.OK,
      }
    );

  modalStore
    .openModal(
      `${recruitment.occupation.name}(으)로 이 프로젝트에 지원합니다`,
      null,
      {
        actions: modalPresets.OKCancel,
      }
    )
    .then((response) => {
      if (response == modalResponses.Cancel) return;

      new apiRequest()
        .execute(
          API.Apply,
          {
            recruitment_id: Number(recruitment.id),
            applicant_id: Number(systemStore.currentUser.id),
          },
          "id"
        )
        .then(parseResponse)
        .then((response) => {
          if (!response[API.Apply]) throw new Error();
          applications.unshift({
            id: response[API.Apply].id,
            applicant: {
              id: systemStore.currentUser.id,
              name: systemStore.currentUser.name,
            },
            occupation: recruitment.occupation.name,
            recruitment_id: recruitment.id,
            result: "APPLY",
            date_created: new Date().toISOString(),
          });
          modalStore.openModal("지원이 접수되었습니다,", null, {
            actions: modalPresets.OK,
          });
        })
        .catch(modalStore.showErrorMessage);
    });
};
const cancelApplication = (id) => {
  modalStore
    .openModal("지원을 취소할까요?", null, {
      actions: [
        { label: "지원 취소", color: "error" },
        { label: "돌아가기", response: modalResponses.Cancel },
      ],
    })
    .then((response) => {
      if (response == modalResponses.Cancel) return;

      new apiRequest()
        .execute(API.CancelApplication, { id: Number(id) })
        .then(parseResponse)
        .then((response) => {
          if (!response[API.CancelApplication]) throw new Error();

          applications.splice(applications.indexOf(application.value), 1);
          modalStore.openModal("지원 취소되었습니다.", null, {
            actions: modalPresets.OK,
          });
        })
        .catch(modalStore.showErrorMessage);
    });
};
</script>
