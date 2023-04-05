import { ref, reactive } from "vue";
import { defineStore } from "pinia";

export const useSystem = defineStore(
  "system",
  () => {
    const displayUI = ref(true);
    const loggedIn = ref(false);
    const currentUser = reactive({
      id: "test",
      name: "홍길동",
      email: "example@example.com",
    });

    const hideUI = () => {
      displayUI.value = false;
    };
    const showUI = () => {
      displayUI.value = true;
    };

    const login = () => {
      loggedIn.value = true;
    };

    const logout = () => {
      loggedIn.value = false;
    };

    return { displayUI, loggedIn, currentUser, hideUI, showUI, login, logout };
  },
  { persist: true }
);
