import { computed } from "vue";
import { defineStore } from "pinia";
import router, { pages } from "@/router";

export const useInterfaceStore = defineStore("interface", () => {
  const displayUI = computed(() => {
    const UILESS_PAGES = [
      pages.Login.name,
      pages.FindUID.name,
      pages.FindPW.name,
      pages.Register.name,
    ];
    return !UILESS_PAGES.includes(router.currentRoute.value.name);
  });

  return { displayUI };
});
