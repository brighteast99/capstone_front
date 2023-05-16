import { computed } from "vue";
import { defineStore } from "pinia";
import router from "@/router";
import { pages } from "@/router";

export const useInterfaceStore = defineStore("interface", () => {
  const displayUI = computed(() => {
    const UILESS_PAGES = [
      pages.Login,
      pages.FindUID,
      pages.FindPW,
      pages.Register,
    ];
    return !UILESS_PAGES.includes(router.currentRoute.value.name);
  });

  return { displayUI };
});
