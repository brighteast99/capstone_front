import { computed } from "vue";
import { defineStore } from "pinia";
import router from "@/router";

export const useInterface = defineStore("interface", () => {
  const displayUI = computed(() => {
    const UILESS_PAGES = ["Login", "FindUID", "FindPW", "Register"];
    return !UILESS_PAGES.includes(router.currentRoute.value.name);
  });

  return { displayUI };
});
