<template>
  <div class="dropdown">
    <div class="prepend-icon">
      <slot name="prepend"> </slot>
    </div>
    <div class="dropdown-inner">
      <button
        class="dropdown-inner-content"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
      >
        <div class="prepend-inner-icon" style="color: grey">
          <slot name="prepend-inner"> </slot>
        </div>

        <p class="dropdown-selected">
          {{ props.modelValue }}
        </p>

        <custom-btn
          class="pr-0 pl-0"
          variant="plain"
          size="12"
          :color="dropdownOpened ? activeColor : 'black'"
          :active="dropdownOpened || isHover"
          style="align-self: center"
        >
          <v-icon
            :icon="dropdownOpened ? 'mdi-chevron-down' : 'mdi-chevron-up'"
            size="14"
          ></v-icon>
        </custom-btn>

        <v-menu
          activator="parent"
          v-model="dropdownOpened"
          scroll-strategy="none"
          :open-on-hover="false"
          @update:model-value="emits('update:dropdownState', $event)"
        >
          <v-sheet
            class="dropdown-wrapper"
            v-click-outside="
              () => {
                dropdownOpened = false;
                emits('update:dropdownState', false);
              }
            "
          >
            <v-expand-transition>
              <div v-if="!top" class="more-icon">
                <v-icon icon="mdi-chevron-up" size="14"> </v-icon>
              </div>
            </v-expand-transition>

            <div class="dropdown-list">
              <div
                v-intersect="(isInterSecting) => (top = isInterSecting)"
                style="height: 1px"
              ></div>

              <custom-btn
                v-for="item in items"
                :key="item"
                :active="props.modelValue == item"
                class="my-2"
                style="width: 100%"
                :weight="props.modelValue == item ? 'bold' : 'normal'"
                @click="emits('update:modelValue', item)"
              >
                {{ item }}
              </custom-btn>

              <div
                v-intersect="(isInterSecting) => (bottom = isInterSecting)"
                style="height: 1px"
              ></div>
            </div>

            <v-expand-transition>
              <div v-if="!bottom" class="more-icon">
                <v-icon icon="mdi-chevron-down" size="14"> </v-icon>
              </div>
            </v-expand-transition>
          </v-sheet>
        </v-menu>
      </button>

      <div style="position: relative">
        <transition name="expand-x">
          <v-sheet
            v-if="dropdownOpened"
            class="underline"
            :color="activeColor"
            height="2"
            border="false"
            position="absolute"
            style="z-index: 1"
          ></v-sheet>
        </transition>
        <v-sheet
          class="underline"
          :style="{ backgroundColor: isHover ? 'black' : 'grey' }"
          height="1"
          border="false"
          position="absolute"
        ></v-sheet>
      </div>
    </div>
  </div>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";

import { ref, computed, defineProps, defineEmits } from "vue";
import { themes } from "@/plugins/vuetify.config";

const activeColor = computed(
  () => themes.customTheme.colors[props.activeColor] ?? props.activeColor
);

const isHover = ref(false);
const dropdownOpened = ref(false);
const top = ref(true);
const bottom = ref(false);

const props = defineProps({
  items: Array,
  modelValue: Number,
  activeColor: {
    Type: String,
    default: "primary",
  },
});
const emits = defineEmits(["update:modelValue", "update:dropdownState"]);
</script>

<style scoped>
.dropdown {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  padding: 0 0.5rem 0 0.5rem;
}
.dropdown-inner {
  width: 100%;
  min-width: 5em;
  display: flex;
  flex-direction: column;
}
.dropdown-inner-content {
  width: 100%;
  min-width: 5em;
  display: flex;
  flex-direction: row;
  align-items: first baseline;
}
.prepend-icon {
  padding-left: 4px;
  transition: all 0.1s;
}
.prepend-inner-icon {
  transition: all 0.1s;
}
.dropdown-selected {
  min-width: 30px;
  font-size: 0.8em;
  margin: 0 auto 0 auto;
}
.dropdown-wrapper {
  overflow-y: hide;
}
::-webkit-scrollbar {
  display: none;
}
.more-icon {
  text-align: center;
  line-height: 1;
}
.dropdown-list {
  overflow-y: auto;
  max-height: 15dvh;
}
.underline {
  width: 100%;
  transition: all 0.1s;
}
.expand-x-enter-active,
.expand-x-leave-active {
  transition: all 0.1s;
}
.expand-x-enter-from,
.expand-x-leave-to {
  transform: scaleX(0);
}
</style>
