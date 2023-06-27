<template>
  <div class="dropdown">
    <div class="prepend-icon">
      <slot name="prepend"> </slot>
    </div>
    <div class="dropdown-inner">
      <button class="dropdown-inner-content" v-element-hover="toggleHover">
        <div class="prepend-inner-icon" style="color: grey">
          <slot name="prepend-inner"> </slot>
        </div>

        <p
          class="dropdown-selected px-2 d-block"
          style="
            display: block;
            width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          "
        >
          {{
            !selectedItem ? "" : selectedItem[props.itemTitle] ?? selectedItem
          }}
        </p>

        <custom-btn
          class="pr-0 pl-0"
          variant="plain"
          size="12"
          :color="dropdownState ? activeColor : 'black'"
          :active="dropdownState || isHover"
          style="align-self: center"
        >
          <v-icon
            :icon="dropdownState ? 'mdi-chevron-down' : 'mdi-chevron-up'"
            size="14"
          ></v-icon>
        </custom-btn>

        <v-menu
          activator="parent"
          location="bottom center"
          v-model="dropdownState"
          scroll-strategy="none"
          offset="6"
          :open-on-hover="false"
          :close-on-content-click="false"
          @update:model-value="if ($event) scrollToSelected();"
        >
          <v-sheet class="px-2">
            <v-expand-transition>
              <div v-if="!top" class="more-icon">
                <v-icon icon="mdi-chevron-up" size="14"> </v-icon>
              </div>
            </v-expand-transition>

            <div ref="list" class="dropdown-list">
              <div ref="listInner">
                <custom-btn
                  v-for="item in items"
                  :key="item"
                  :active="selectedItem == item"
                  class="my-2"
                  style="width: 100%"
                  :weight="selectedItem == item ? 'bold' : 'normal'"
                  @click="
                    selectedItem = item;
                    dropdownState = false;
                  "
                >
                  {{ item[props.itemTitle] ?? item }}
                </custom-btn>
                <div
                  v-if="!props.items?.length"
                  class="my-2"
                  style="height: 24px"
                ></div>
              </div>
            </div>

            <v-expand-transition>
              <div v-if="overflows && !bottom" class="more-icon">
                <v-icon icon="mdi-chevron-down" size="14"> </v-icon>
              </div>
            </v-expand-transition>
          </v-sheet>
        </v-menu>
      </button>

      <div style="position: relative">
        <transition name="expand-x">
          <v-sheet
            v-if="dropdownState"
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
import { vElementHover } from "@vueuse/components";
import {
  useScroll,
  useElementSize,
  toRefs,
  until,
  refWithControl,
} from "@vueuse/core";
import { createToggle } from "@/modules/utility";
import { themes } from "@/plugins/vuetify.config";
import { watchEffect } from "vue";

// Components
const list = ref();
const listInner = ref();

// Data
const activeColor = computed(
  () => themes.customTheme.colors[props.activeColor] ?? props.activeColor
);
const { value: isHover, toggle: toggleHover } = createToggle(false);
const dropdownState = refWithControl(false, {
  onChanged: (value) => emits("update:dropdownState", value),
});
const selectedItem = refWithControl(null, {
  onChanged: (value) => {
    if (!value) return;
    emits("update:modelValue", value[props.itemValue] ?? value);
    emits("update:selectedItem", value);
  },
});
const { height } = useElementSize(list);
const { height: innerHeight } = useElementSize(listInner);
const overflows = computed(() => {
  if (!height.value) return false;
  return innerHeight.value > height.value;
});
const { y, arrivedState } = useScroll(list);
const { top, bottom } = toRefs(arrivedState);

// Props & Emits
const props = defineProps({
  items: Array,
  modelValue: {
    Type: Number | String,
    default: null,
  },

  activeColor: {
    Type: String,
    default: "primary",
  },
  itemTitle: {
    Type: String,
    default: "title",
  },
  itemValue: {
    Type: String,
    default: "value",
  },
});
const emits = defineEmits([
  "update:modelValue",
  "update:dropdownState",
  "update:selectedItem",
]);

// Watch
watchEffect(() => {
  selectedItem.value = props.items?.find((item) => {
    return props.modelValue == (item[props.itemValue] ?? item);
  });
});

// Methods
const scrollToSelected = async () => {
  // Wait until list is rendered
  await until(height).toBeTruthy();
  y.value =
    8 + 32 * props.items?.indexOf(selectedItem.value) - (height.value / 2 - 12);
};
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
  padding: 0 1em 0 1em;
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
