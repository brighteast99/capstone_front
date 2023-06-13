<template>
  <v-card class="profile-card" :loading="loadingUserData">
    <dot-menu v-if="isMyInfo" size="small" @click="editInfo">
      <custom-btn>프로필 수정</custom-btn>
    </dot-menu>
    <v-container>
      <v-row>
        <v-col cols="auto" style="min-width: fit-content">
          <v-avatar size="128">
            <v-icon icon="mdi-account-circle" size="128" color="primary">
            </v-icon>
          </v-avatar>
        </v-col>
        <v-col style="min-width: fit-content">
          <h1 class="userinfo-name">{{ userInfo.name }}</h1>
          <p class="userinfo-email">{{ userInfo.email }}</p>
          <p class="userinfo-date">{{ registerDate }}</p>
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
        <error-block height="200">
          아직 포트폴리오를 등록하지 않았습니다.
        </error-block>
      </v-window-item>
      <v-window-item :value="tabs.recruits">
        <error-block
          v-if="loadingUsersThreads || failedLoadingUsersThreads"
          :loading="loadingUsersThreads"
          height="200"
        >
          목록을 불러오지 못했습니다.<br />
          나중에 다시 시도하거나 관리자에게 문의 바랍니다.
        </error-block>
        <div v-else-if="usersThreads.length" class="thread-list">
          <div v-for="thread in usersThreads" :key="thread">
            <thread-peeker :thread="thread"></thread-peeker>
            <v-divider class="mx-1 my-1"></v-divider>
          </div>
        </div>
        <error-block v-else height="200">
          아직 진행한 프로젝트가 없습니다.
        </error-block>
      </v-window-item>
      <v-window-item :value="tabs.participations">
        <error-block height="200">
          아직 참여한 프로젝트가 없습니다.
        </error-block>
      </v-window-item>
      <v-window-item :value="tabs.favorites">
        <error-block
          v-if="loadingFavoriteThreads || failedLoadingFavoriteThreads"
          :loading="loadingFavoriteThreads"
          height="200"
        >
          목록을 불러오지 못했습니다.<br />
          나중에 다시 시도하거나 관리자에게 문의 바랍니다.
        </error-block>
        <div v-else-if="favoriteThreads.length" class="thread-list">
          <div
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
        </div>
        <error-block v-else height="200">
          아직 관심 등록한 프로젝트가 없습니다.
        </error-block>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";
import DotMenu from "@/components/DotMenu.vue";
import ThreadPeeker from "@/components/ThreadPeeker.vue";
import ErrorBlock from "@/components/ErrorBlock.vue";

import {
  reactive,
  ref,
  computed,
  defineProps,
  watch,
  onBeforeMount,
} from "vue";
import { apiRequest, API, parseResponse, useAPI } from "@/modules/Services/API";
import router, { safeBack } from "@/router";
import { useModalStore, useSystemStore } from "@/store";
import { formatDateRelative } from "@/modules/utility";
import { constructQuery } from "@/modules/Services/queryBuilder";

// Pinia storage
const systemStore = useSystemStore();
const modalStore = useModalStore();

// Data
const userId = computed(
  () => router.currentRoute.value.params.userId ?? props.userId
);
const userInfo = computed(
  () =>
    userDataResponse.value?.data[API.GetUser] || {
      id: null,
      name: "User",
      email: "email@email.com",
      date_created: new Date(),
    }
);
const registerDate = computed(
  () => `${formatDateRelative(userInfo.value.date_created)} 가입`
);
const isMyInfo = computed(() => props.userId == systemStore.currentUser.id);
const tabs = {
  portfolio: "portfolio",
  recruits: "recruits",
  participations: "participations",
  favorites: "favorites",
};
Object.freeze(tabs);
const tab = ref(tabs.portfolio);
const usersThreads = computed(() => {
  return (
    usersThreadsResponse.value?.data[API.GetUser].thread_set.filter(
      (thread) => !thread.is_deleted
    ) || []
  );
});
const favoriteThreads = reactive([]);

// Props
const props = defineProps({
  userId: String,
});

// Watches
watch(tab, (value) => {
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
    tab.value = value ?? tabs.portfolio;
  },
  { immediate: true }
);
watch(
  () => router.currentRoute.value.params.userId,
  () => {
    fetchUserData();
    tab.value = tabs.portfolio;
  },
  { immedaite: true }
);
watch(
  () => props.userId,
  () => {
    fetchUserData();
    tab.value = tabs.portfolio;
  },
  { immedaite: true }
);

// Hook
onBeforeMount(() => {
  fetchUserData();
});

// Methods
const {
  isLoading: loadingUserData,
  data: userDataResponse,
  execute: _fetchUserData,
} = useAPI();
const fetchUserData = () => {
  loadedUsersThreads.value = false;
  loadedFavoriteThreads.value = false;

  _fetchUserData(
    constructQuery({
      name: API.GetUser,
      args: { id: Number(userId.value) },
      fields: ["id", "name", "email", "date_created"],
    })
  )
    .then(parseResponse)
    .then((response) => {
      if (!response[API.GetUser]) throw new Error("유저를 찾을 수 없습니다.");
    })
    .catch((err) => modalStore.showErrorMessage(err).then(() => safeBack()));
};
const {
  isLoading: loadingUsersThreads,
  error: failedLoadingUsersThreads,
  isFinished: loadedUsersThreads,
  data: usersThreadsResponse,
  execute: _fetchUsersThreads,
} = useAPI({
  onSuccess: ({ data: response }) => {
    console.log(response);
    if (!response[API.GetUser]) {
      failedLoadingUsersThreads.value = true;
      return;
    }
  },
});
const fetchUsersThreads = () => {
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
            "favorites",
            { commentforthread_set: ["is_deleted", { replies: "is_deleted" }] },
          ],
        },
      ],
    })
  );
};

const {
  isLoading: loadingFavoriteThreads,
  error: failedLoadingFavoriteThreads,
  isFinished: loadedFavoriteThreads,
  execute: _fetchFavoriteThreads,
} = useAPI({
  onSuccess: ({ data: response }) =>
    favoriteThreads.push(...response[API.GetFavorites]),
});
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
        "favorites",
        { commentforthread_set: ["is_deleted", { replies: "is_deleted" }] },
      ],
    })
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

.thread-list {
  max-height: 50dvh;
  overflow: scroll;
}
</style>
