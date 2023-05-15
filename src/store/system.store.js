import { reactive, computed } from "vue";
import { defineStore } from "pinia";

export const useSystem = defineStore(
  "system",
  () => {
    const _currentUser = reactive({
      id: null,
    });

    const currentUser = computed(() => _currentUser);
    const loggedIn = computed(() => _currentUser.id != null);

    const logIn = (id) => {
      _currentUser.id = id;
    };

    const logOut = () => {
      _currentUser.id = null;
    };

    return { currentUser, loggedIn, logIn, logOut };
  },
  { persist: true }
);
