import { reactive, computed } from "vue";
import { defineStore } from "pinia";

export const useSystemStore = defineStore(
  "system",
  () => {
    const currentUser = reactive({
      id: null,
      name: null,
      email: null,
    });

    const loggedIn = computed(() => currentUser.id != null);

    const logIn = (id) => {
      currentUser.id = id;
    };

    const logOut = () => {
      currentUser.id = null;
    };

    return { currentUser, loggedIn, logIn, logOut };
  },
  { persist: true }
);
