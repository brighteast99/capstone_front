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
      my_id: "",
      password: "",
    });

    const loggedIn = computed(() => currentUser.id != null);

    const login = (loginData) => {
      return new Promise((resolve, reject) => {
        new apiRequest()
          .execute(API.SignIn, loginData, ["id", "name", "email"])
          .then(parseResponse)
          .then((response) => {
            const userData = response[API.SignIn];

            if (!userData) resolve(false);
            else {
              Object.assign(currentUser, userData);
              currentUser.my_id = loginData.my_id;
              currentUser.password = loginData.password;
              currentUser.id = Number(currentUser.id);
              resolve(true);
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    };

    const logOut = () => {
      currentUser.id = null;
      currentUser.name = null;
      currentUser.email = null;
      currentUser.my_id = "";
      currentUser.password = "";

      if (router.currentRoute.value.meta.requireLogin)
        router.replace({ name: pages.Main });
    };

    const verify = () => {
      if (currentUser.id != null)
        new apiRequest()
          .execute(
            API.SignIn,
            { my_id: currentUser.my_id, password: currentUser.password },
            "id"
          )
          .then(parseResponse)
          .then((response) => {
            const userData = response[API.SignIn];
            if (!userData) logOut();
            if (userData.id != currentUser.id) logOut();
          })
          .catch(() => logOut());
    };

    return { currentUser, loggedIn, login, logOut, verify };
  },
  { persist: true }
);
