<template>
  <v-badge
    dot
    :color="props.owner && newApplications.length ? 'error' : 'transparent'"
  >
    <v-btn
      class="rounded-pill"
      size="small"
      variant="tonal"
      :color="chipColor"
      :disabled="
        props.disabled || (!props.owner && props.recruitment.is_closed)
      "
    >
      {{
        `${props.recruitment.occupation.name} ${props.recruitment.current_cnt}/${props.recruitment.max_cnt}`
      }}
      <v-tooltip
        :disabled="props.disabled || props.readonly"
        activator="parent"
        location="top"
      >
        {{ tooltipMessage }}
      </v-tooltip>
    </v-btn>
  </v-badge>
</template>

<script setup>
import { computed, defineProps } from "vue";

const chipColor = computed(() => {
  if (props.recruitment.is_closed) {
    if (props.recruitment.current_cnt < props.recruitment.max_cnt)
      return "warning";
    else return "secondary_variant";
  }
  return "secondary";
});
const newApplications = computed(() =>
  props.recruitment.applyforrecruitment_set.filter(
    (apply) => apply.result == "APPLY"
  )
);
const tooltipMessage = computed(() => {
  if (props.owner) {
    if (props.recruitment.is_closed) {
      if (props.recruitment.current_cnt < props.recruitment.max_cnt)
        return "조기 마감한 모집입니다.";
      return "모집이 완료되었습니다!";
    }
    if (newApplications.value.length)
      return `${newApplications.value.length}명의 지원자가 대기중입니다`;
    else return "아직 지원자가 없습니다";
  } else {
    if (props.recruitment.is_closed) return "모집이 마감되었습니다";
    else return `${props.recruitment.occupation.name}로 지원하기`;
  }
});

const props = defineProps({
  owner: Boolean,
  recruitment: {
    Type: {
      id: Number | String,
      occupation: { id: Number | String, name: String },
      applyforrecruitment_set: {
        id: Number | String,
        applicant: {
          id: Number | String,
          name: String,
        },
        result: String,
      },
      current_cnt: Number | String,
      max_cnt: Number | String,
      is_closed: Boolean,
    },
  },
  disabled: Boolean,
  readonly: Boolean,
});
</script>
