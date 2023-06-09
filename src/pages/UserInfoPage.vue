<template>
  <v-card class="profile-card">
    <custom-btn
      v-if="isMyInfo"
      class="edit-btn"
      size="x-small"
      @click="editInfo"
    >
      <v-icon icon="mdi-pencil" size="x-large"> </v-icon>
    </custom-btn>
    <v-container>
      <v-row>
        <v-col cols="auto">
          <v-avatar size="128">
            <v-icon icon="mdi-account-circle" size="128" color="primary">
            </v-icon>
          </v-avatar>
        </v-col>
        <v-col>
          <h1 class="userinfo-name">{{ userInfo.name }}</h1>
          <p class="userinfo-email">{{ userInfo.email }}</p>
          <p class="userinfo-date">{{ userInfo.date_created }}</p>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
  <v-card class="mt-3">
    <v-tabs v-model="tab" grow color="primary">
      <v-tab :value="tabs.portfolio">포트폴리오</v-tab>
      <v-tab :value="tabs.recruits">진행한 프로젝트</v-tab>
      <v-tab :value="tabs.participations">참여한 프로젝트</v-tab>
      <v-tab :value="tabs.favorites"> 관심 프로젝트 </v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-window v-model="tab">
      <v-window-item :value="tabs.portfolio">
        <div
          class="text-h6 text-disabled d-flex justify-center align-center py-7"
          style="height: 200px"
        >
          아직 포트폴리오를 등록하지 않았습니다.
        </div>
      </v-window-item>
      <v-window-item :value="tabs.recruits">
        <div
          v-if="loadingUsersThreads | failedLoadingUsersThreads"
          class="text-h6 text-disabled d-flex justify-center align-center text-center"
          style="height: 200px"
        >
          <span v-if="failedLoadingUsersThreads">
            목록을 불러오는 데 실패했습니다.<br />
            나중에 다시 시도하거나 관리자에게 문의 바랍니다.
          </span>
          <v-icon v-else class="mdi-spin" icon="mdi-loading"> </v-icon>
        </div>
        <div
          v-else-if="usersThreads.length"
          v-for="thread in usersThreads"
          :key="thread"
        >
          <thread-peeker :thread="thread"></thread-peeker>
          <v-divider class="mx-1 my-1"></v-divider>
        </div>
        <div
          v-else
          class="text-h6 text-disabled d-flex justify-center align-center text-center"
          style="height: 200px"
        >
          아직 진행한 프로젝트가 없습니다.
        </div>
      </v-window-item>
      <v-window-item :value="tabs.participations">
        <div
          class="text-h6 text-disabled d-flex justify-center align-center text-center"
          style="height: 200px"
        >
          아직 참여한 프로젝트가 없습니다.
        </div>
      </v-window-item>
      <v-window-item :value="tabs.favorites">
        <div
          v-if="loadingFavoriteThreads | failedLoadingFavoriteThreads"
          class="text-h6 text-disabled d-flex justify-center align-center text-center"
          style="height: 200px"
        >
          <span v-if="failedLoadingFavoriteThreads">
            목록을 불러오는 데 실패했습니다.<br />
            나중에 다시 시도하거나 관리자에게 문의 바랍니다.
          </span>
          <v-icon class="mdi-spin" icon="mdi-loading"></v-icon>
        </div>
        <div
          v-else-if="favoriteThreads.length"
          v-for="(thread, i) in favoriteThreads"
          :key="thread"
          style="position: relative"
        >
          <dot-menu v-if="isMyInfo">
            <custom-btn color="error" @click="cancelFavorite(i)">
              관심 해제
            </custom-btn>
          </dot-menu>
          <thread-peeker :thread="thread"> </thread-peeker>
          <v-divider class="mx-1 my-1"></v-divider>
        </div>
        <div
          v-else
          class="text-h6 text-disabled d-flex justify-center align-center py-7"
          style="height: 200px"
        >
          아직 관심 등록한 프로젝트가 없습니다.
        </div>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";
import DotMenu from "@/components/DotMenu.vue";
import ThreadPeeker from "@/components/ThreadPeeker.vue";

import {
  reactive,
  ref,
  computed,
  defineProps,
  watch,
  onBeforeMount,
} from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { apiRequest, API, parseResponse, useAPI } from "@/modules/Services/API";
import router, { safeBack } from "@/router";
import { useModalStore, useSystemStore } from "@/store";
import { formatDateRelative } from "@/modules/utility";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { pages } from "@/router";

// Pinia storage
const systemStore = useSystemStore();
const modalStore = useModalStore();

// Data
const userId = computed(() => router.currentRoute.value.params.userId);
const userInfo = reactive({
  id: null,
  name: "",
  email: "",
  date_created: "",
});
const isMyInfo = computed(() => props.userId == systemStore.currentUser.id);
const tabs = {
  portfolio: "portfolio",
  recruits: "recruits",
  participations: "participations",
  favorites: "favorites",
};
Object.freeze(tabs);
const tab = ref(tabs.portfolio);
const usersThreads = reactive([]);
const favoriteThreads = reactive([]);

// Props
const props = defineProps({
  userId: String,
});

// Watches
watch(tab, (value) => {
  router.push({
    name: pages.UserInfo,
    params: { userId: userId.value },
    query: { tab: value },
  });
  switch (value) {
    case tabs.portfolio: {
      break;
    }
    case tabs.recruits: {
      if (!loadingUsersThreads.value && !loadedUsersThreads.value)
        fetchUsersThreads();
      break;
    }
    case tabs.paricipations: {
      break;
    }
    case tabs.favorites: {
      if (!loadingFavoriteThreads.value && !loadedFavoriteThreads.value) {
        fetchFavoriteThreads();
      }
      break;
    }
  }
});
watch(
  () => router.currentRoute.value.query.tab,
  (value) => {
    if (router.currentRoute.value.name != pages.UserInfo) return;

    tab.value = value ?? tabs.portfolio;
  },
  { immediate: true }
);
watch(
  () => router.currentRoute.value.params.userId,
  () => {
    if (router.currentRoute.value.name != pages.UserInfo) return;

    fetchUserData();
  },
  { immedaite: true }
);

// Hook
onBeforeMount(() => {
  fetchUserData();
});
onBeforeRouteUpdate((to, from, next) => {
  if (!to.query.tab)
    return next({
      name: to.name,
      params: to.params,
      query: { tab: tabs.portfolio },
    });
  return next(true);
});

// Methods
const fetchUserData = () => {
  Object.assign(userInfo, {
    id: null,
    name: "",
    email: "",
    date_created: "",
  });
  loadedUsersThreads.value = false;
  loadedFavoriteThreads.value = false;

  new apiRequest()
    .execute(API.GetUser, { id: Number(userId.value) }, [
      "id",
      "name",
      "email",
      "date_created",
    ])
    .then(parseResponse)
    .then((response) => {
      if (!response[API.GetUser]) throw new Error("유저를 찾을 수 없습니다.");

      Object.assign(userInfo, response[API.GetUser]);
      userInfo.date_created = `${formatDateRelative(
        userInfo.date_created
      )} 가입`;
    })
    .catch((err) => modalStore.showErrorMessage(err).then(() => safeBack()));
};
const {
  isLoading: loadingUsersThreads,
  error: failedLoadingUsersThreads,
  isFinished: loadedUsersThreads,
  execute: _fetchUsersThreads,
} = useAPI();
const fetchUsersThreads = () => {
  usersThreads.splice(0, usersThreads.length);
  _fetchUsersThreads(
    constructQuery({
      name: API.GetUser,
      args: { id: Number(userId.value) },
      fields: [
        {
          thread_set: [
            "id",
            { board: "id" },
            { user: ["id", "name"] },
            "title",
            "content",
            "date_created",
            "is_deleted",
            "views",
            "likes",
            { commentforthread_set: ["is_deleted", { replies: "is_deleted" }] },
          ],
        },
      ],
    })
  ).then(({ data: response }) => {
    if (!response.value.data[API.GetUser]) {
      failedLoadingUsersThreads.value = true;
      return;
    }
    const threadsData = response.value.data[API.GetUser].thread_set;
    usersThreads.push(...threadsData.filter((thread) => !thread.is_deleted));
  });
};

const {
  isLoading: loadingFavoriteThreads,
  error: failedLoadingFavoriteThreads,
  isFinished: loadedFavoriteThreads,
  execute: _fetchFavoriteThreads,
} = useAPI();
const fetchFavoriteThreads = () => {
  favoriteThreads.splice(0, favoriteThreads.length);
  _fetchFavoriteThreads(
    constructQuery({
      name: API.GetFavorites,
      args: { user_id: Number(userId.value) },
      fields: [
        "id",
        { board: "id" },
        { user: ["id", "name"] },
        "title",
        "content",
        "date_created",
        "is_deleted",
        "views",
        "likes",
        { commentforthread_set: ["is_deleted", { replies: "is_deleted" }] },
      ],
    })
  ).then(({ data: response }) =>
    favoriteThreads.push(...response.value.data[API.GetFavorites])
  );
};

const editInfo = () => {}; // TODO

const cancelFavorite = (idx) => {
  new apiRequest()
    .execute(API.UpdateThreadActions, {
      user_id: Number(props.userId),
      thread_id: Number(favoriteThreads[idx].id),
      is_cancel: true,
      option: "favorite",
    })
    .then(parseResponse)
    .then((response) => {
      if (!response[API.UpdateThreadActions])
        throw new Error("관심 해제에 실패했습니다.");

      favoriteThreads.splice(idx, 1);
    })
    .catch(modalStore.showErrorMessage);
};
</script>

<style scoped>
.profile-card {
  margin-top: 40px;
  padding: 1.5em 2em 1.5em 2em;
}

.edit-btn {
  position: absolute;
  padding: 0;
  top: 1em;
  right: 1em;
}

.userinfo-name {
  font-size: 2em;
}

.userinfo-email {
  font-size: 1.2em;
  color: gray;
}

.userinfo-date {
  color: gray;
}
</style>
