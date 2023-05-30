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
        new apiRequest()
          .push(API.SignIn, loginInfo, ["id", "name", "email"])
          .send()
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
          .catch((err) => {
            console.log("login catch");
            reject(err);
          });
      });
    };

    const logOut = () => {
      currentUser.id = null;
      currentUser.name = null;
      currentUser.email = null;

      if (router.currentRoute.value.meta.requireLogin)
        router.replace({ name: pages.Main });
    };

    return { currentUser, loggedIn, login, logOut };
  },
  { persist: true }
);
