import { ref, reactive, computed } from "vue";
import { defineStore } from "pinia";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";
import router, { pages } from "@/router";
import { useModalStore } from "./modal.store";

export const useSystemStore = defineStore(
  "system",
  () => {
    const currentUser = reactive({
      id: null,
      name: null,
      email: null,
      my_id: "",
      password: "",
      is_staff: null,
    });
    const readThreads = ref([]);
    let cleanupTimer = null;

    const loggedIn = computed(() => currentUser.id != null);

    const login = (userData) => Object.assign(currentUser, userData);
    const logOut = async () => {
      Object.assign(currentUser, {
        id: null,
        name: null,
        email: null,
        my_id: "",
        password: "",
        is_staff: null,
      });
      readThreads.value = [];
      if (cleanupTimer) clearTimeout(cleanupTimer);
      cleanupTimer = null;

      if (router.currentRoute.value.meta.requireLogin) {
        const modalStore = new useModalStore();
        const response = await modalStore.showNeedLoginMessage();

        if (response === "Login") router.push({ name: pages.Login });
        else router.push({ name: pages.Main });
      }
    };

    const verify = () => {
      if (currentUser.id != null) {
        new apiRequest()
          .execute(
            API.SignIn,
            { my_id: currentUser.my_id, password: currentUser.password },
            ["id", "is_staff"]
          )
          .then(parseResponse)
          .then((response) => {
            if (response[API.SignIn].id != currentUser.id) logOut();
            if (currentUser.is_staff && !response[API.SignIn].is_staff)
              logOut();
          });
      }
    };

    const readThread = (threadId) => {
      if (readThreads.value.find((x) => x.id == threadId)) return false;

      new apiRequest()
        .execute(API.ReadThread, { id: Number(threadId) })
        .then(parseResponse)
        .then((response) => {
          if (!response[API.ReadThread]) throw new Error();

          readThreads.value.push({ id: threadId, timestamp: new Date() });

          if (cleanupTimer == null) startHistoryCleanup();
        });
      return true;
    };

    /**
     * Remove read history older than 1 hour
     */
    const startHistoryCleanup = () => {
      if (!readThreads.value.length) {
        cleanupTimer = null;
        return;
      }

      const THRESHOLD = 1000 * 60 * 60;

      while (
        readThreads.value.length &&
        Date.now() - new Date(readThreads.value[0]?.timestamp) > THRESHOLD
      )
        readThreads.value.shift();

      if (readThreads.value.length)
        cleanupTimer = setTimeout(
          startHistoryCleanup,
          new Date(readThreads.value[0].timestamp) - Date.now() + THRESHOLD
        );
      else cleanupTimer = null;
    };
    return {
      currentUser,
      readThreads,
      loggedIn,
      login,
      logOut,
      verify,
      readThread,
      startHistoryCleanup,
    };
  },
  { persist: true }
);
