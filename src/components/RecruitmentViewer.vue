<template>
  <div class="position-relative">
    <v-hover>
      <template v-slot:default="{ isHovering, props: hoverProps }">
        <error-block
          v-if="application"
          v-bind="hoverProps"
          height="30"
          color="primary"
          class="position-absolute"
        >
          <v-fade-transition leave-absolute>
            <span v-if="!isHovering || application?.result == 'PASS'">{{
              applyInfoMessage
            }}</span>
            <custom-btn
              v-if="isHovering && application?.result == 'APPLY'"
              class="d-inline-block"
              color="error_variant"
              default-color="error"
              size="large"
              @click="if (!props.readonly) cancelApplication(application.id);"
            >
              지원 취소
            </custom-btn>
          </v-fade-transition>
        </error-block>
      </template>
    </v-hover>

    <error-block
      v-if="error || !props.recruitments?.length"
      :loading="props.loading"
      height="30"
    >
      {{ errorMessage }}
    </error-block>
    <div v-else class="d-flex px-4" style="gap: 1em">
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
          }
        "
      >
        <!-- :disabled="!!appliedForTheThread || !!participatingInTheThread" -->
      </recruitment-chip>
    </div>
  </div>
</template>

<script setup>
import RecruitmentChip from "@/components/RecruitmentChip.vue";
import ErrorBlock from "@/components/ErrorBlock.vue";
import CustomBtn from "@/components/CustomBtn.vue";

import { ref, computed, defineProps, defineEmits, watch } from "vue";
import { useSystemStore, useModalStore } from "@/store";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";
import { modalPresets, modalResponses } from "@/store/modal.store";

// Pinia storage
const systemStore = useSystemStore();
const modalStore = useModalStore();

const application = ref();
const applyInfoMessage = computed(() => {
  switch (application.value?.result) {
    case "PASS":
      return `${application.value.occupation}(으)로 참여하고 있습니다.`;
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
    Type: Array,
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
          return apply;
        })
      )
      .flat();

    application.value = apply_set.find(
      (apply) =>
        apply.applicant.id == systemStore.currentUser.id &&
        (apply.result == "APPLY" || apply.result == "PASS")
    );
  },
  { deep: true }
);

// Method
const applyForRecruitment = (recruitment) => {
  if (props.owner) return;
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
          application.value = {
            id: response[API.Apply].id,
            occupation: recruitment.occupation.name,
            result: "APPLY",
          };
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

          application.value = null;
          modalStore.openModal("지원 취소되었습니다.", null, {
            actions: modalPresets.OK,
          });
        })
        .catch(modalStore.showErrorMessage);
    });
};
</script>
