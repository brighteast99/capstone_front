<template>
  <div class="d-flex align-center" style="font-size: 1em">
    <v-avatar
      class="profile"
      :class="{ disabled: props.disabled }"
      :size="props.small ? 30 : 40"
      @click="if (!props.disabled) router.push(routeTo);"
    >
      <v-icon
        icon="mdi-account-circle"
        :size="props.small ? 38 : 48"
        :color="props.disabled ? 'disabled' : 'primary'"
      >
      </v-icon>
    </v-avatar>
    <div
      v-if="!props.disabled"
      :class="props.small ? 'info-small' : 'info-normal'"
    >
      <custom-btn
        class="pr-0 pl-2"
        :size="props.small ? 14 : 'medium'"
        :weight="500"
        default-color="black"
        :to="routeTo"
      >
        {{ props.writer?.name }}
      </custom-btn>
      <div class="d-flex align-center">
        <p class="pl-2">{{ date }}</p>
        <span v-if="props.views" class="px-2 text-disabled">•</span>
        <v-icon
          v-if="props.views"
          icon="mdi-eye"
          color="disabled"
          size="small"
        ></v-icon>
        <span class="text-disabled pl-1">{{ props.views }}</span>
      </div>
    </div>
    <p v-else class="text-disabled pl-2" style="font-size: 0.8em">알 수 없음</p>
  </div>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";

import { computed, defineProps } from "vue";
import router, { pages } from "@/router";

const routeTo = computed(() => {
  return { name: pages.UserInfo, params: { userId: props.writer?.id } };
});

const props = defineProps({
  writer: {
    Type: {
      id: Number,
      name: String,
    },
  },
  date: String,
  views: Number,
  disabled: {
    Type: Boolean,
    default: false,
  },
  small: {
    Type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.profile:not(.disabled) {
  cursor: pointer;
  transition: all 0.2s;
}

.profile:hover:not(.disabled) {
  box-shadow: 0 0 0 4px lightgray;
}

.profile:active:not(.disabled) {
  box-shadow: 0 0 0 2px rgb(168, 168, 168);
  transition: all 0.1s;
}
.info-normal {
  font-size: 0.7em;
  line-height: 135%;
  font-weight: 300;
  color: black;
}
.info-small {
  font-size: 0.65em;
  font-weight: 300;
  line-height: 130%;
}
</style>
