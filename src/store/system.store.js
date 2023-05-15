import { ref, reactive } from "vue";
import { defineStore } from "pinia";

export const useSystem = defineStore(
  "system",
  () => {
    const loggedIn = ref(false);
    const currentUser = reactive({
      id: "test",
      name: "홍길동",
      email: "example@example.com",
    });

    const displayUI = (currentPageName) => {
      const UILESS_PAGES = ["Login", "FindUID", "FindPW", "Register"];
      console.log(currentPageName);
      return !UILESS_PAGES.includes(currentPageName);
    };

    const login = () => {
      loggedIn.value = true;
    };

    const logout = () => {
      loggedIn.value = false;
    };

    return { loggedIn, currentUser, displayUI, login, logout };
  },
  { persist: true }
);
