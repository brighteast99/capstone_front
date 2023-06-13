<template>
  <v-badge
    dot
    :color="
      props.owner && newApplications.length && !props.readonly
        ? 'error'
        : 'transparent'
    "
  >
    <v-btn
      class="rounded-pill"
      size="small"
      variant="tonal"
      :color="props.recruitment.is_closed ? 'warning' : 'secondary'"
      :disabled="props.disabled"
    >
      {{
        `${props.recruitment.occupation.name} ${props.recruitment.current_cnt}/${props.recruitment.max_cnt}`
      }}
      <v-tooltip
        v-if="props.owner"
        :disabled="props.disabled || props.readonly"
        activator="parent"
        location="top"
      >
        {{
          newApplications.length
            ? `${newApplications.length} 명의 지원자가 대기중입니다`
            : "아직 지원자가 없습니다"
        }}
      </v-tooltip>
    </v-btn>
  </v-badge>
</template>

<script setup>
import { computed, defineProps } from "vue";

const newApplications = computed(() =>
  props.recruitment.applyforrecruitment_set.filter(
    (apply) => apply.result == "APPLY"
  )
);

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
