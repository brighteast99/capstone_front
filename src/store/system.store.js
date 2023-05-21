import { reactive, computed } from "vue";
import { defineStore } from "pinia";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";
import router, { pages } from "@/router";

export const useSystemStore = defineStore(
  "system",
  () => {
    const currentUser = reactive({
      id: null,
      name: null,
      email: null,
    });

    const loggedIn = computed(() => currentUser.id != null);

    const login = (loginInfo) => {
      return new Promise((resolve, reject) => {
        apiRequest(API.SignIn, loginInfo, ["id", "name", "email"])
          .then(parseResponse)
          .then((response) => {
            const loginData = response[API.SignIn];

            if (loginData == null) resolve(false);
            else {
              Object.assign(currentUser, loginData);
              currentUser.id = Number(currentUser.id);
              resolve(true);
            }
          })
          .catch((err) => reject(err));
      });
    };

    const logOut = () => {
      currentUser.id = null;
      currentUser.name = null;
      currentUser.email = null;

      if (pages[router.currentRoute.value.name].needLogin)
        router.replace({ name: pages.Main.name });
    };

    return { currentUser, loggedIn, login, logOut };
  },
  { persist: true }
);
