<template>
  <v-card class="profile-card" :loading="loadingUserData">
    <dot-menu v-if="isMyInfo" size="small" @click="editInfo">
      <custom-btn :to="{ name: pages.EditUserInfo }">프로필 수정</custom-btn>
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
          <h1 class="userinfo-name">
            {{ userInfo.name }}
            <v-chip v-if="userInfo.occupation" color="primary" label>
              {{ userInfo.occupation }}
            </v-chip>
          </h1>
          <p class="userinfo-email">{{ userInfo.email }}</p>
          <p class="userinfo-date">{{ registerDate }}</p>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
  <v-card class="mt-3" style="min-width: 480px">
    <v-tabs v-model="tab" grow color="primary">
      <v-tab :value="tabs.portfolio">포트폴리오</v-tab>
      <v-tab :value="tabs.recruits">진행한 프로젝트</v-tab>
      <v-tab :value="tabs.participations">참여한 프로젝트</v-tab>
      <v-tab :value="tabs.favorites"> 관심 프로젝트 </v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-window v-model="tab">
      <v-window-item :value="tabs.portfolio">
        <error-block
          v-if="loadingPortfolio || failedLoadingPortfolio || !portfolio"
          :loading="loadingPortfolio"
          height="200"
        >
          <span v-if="failedLoadingPortfolio">
            포트폴리오를 불러오지 못했습니다.
          </span>
          <span v-else> 아직 포트폴리오를 등록하지 않았습니다. </span>
        </error-block>
        <div v-else class="pa-5">
          <p
            v-if="portfolio.introduction"
            class="pb-10"
            style="font-size: 1.2em; font-weight: 500"
          >
            {{ portfolio.introduction }}
          </p>
          <div v-if="links.length">
            <p style="font-size: 1.2em; font-weight: 500">외부 링크</p>
            <ul class="ml-5">
              <li v-for="link in links" :key="link">
                <a
                  :href="formatLink(link.link)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ link.link }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </v-window-item>

      <v-window-item :value="tabs.recruits">
        <error-block
          v-if="
            loadingUsersThreads ||
            failedLoadingUsersThreads ||
            !usersThreads.length
          "
          :loading="loadingUsersThreads"
          height="200"
        >
          <span v-if="failedLoadingUsersThreads">
            진행한 프로젝트 목록을 불러오지 못했습니다.<br />
            나중에 다시 시도하거나 관리자에게 문의 바랍니다.
          </span>
          <span v-else> 아직 진행한 프로젝트가 없습니다. </span>
        </error-block>
        <div v-else class="thread-list">
          <div v-for="thread in usersThreads" :key="thread">
            <thread-peeker :thread="thread"></thread-peeker>
            <v-divider class="mx-1 my-1"></v-divider>
          </div>
        </div>
      </v-window-item>

      <v-window-item :value="tabs.participations">
        <error-block
          v-if="
            loadingParticipations ||
            failedLoadingParticipations ||
            !participations.length
          "
          :loading="loadingParticipations"
          height="200"
        >
          <span v-if="failedLoadingParticipations">
            참여한 프로젝트 목록을 불러오지 못했습니다.<br />
            나중에 다시 시도하거나 관리자에게 문의 바랍니다.
          </span>
          <span v-else> 아직 참여한 프로젝트가 없습니다. </span>
        </error-block>
        <div v-else class="thread-list">
          <div
            v-for="recruitment in participations"
            :key="recruitment"
            class="position-relative"
          >
            <thread-peeker :thread="recruitment.thread"></thread-peeker>
            <div
              class="text-center py-3"
              style="position: absolute; top: 0; width: 100%; font-size: 1em"
            >
              <v-chip v-if="!isMyInfo" color="primary" size="small">
                {{ `${recruitment.occupation.name}로 참여` }}
              </v-chip>
            </div>
            <v-divider class="mx-1 my-1"></v-divider>
          </div>
        </div>
      </v-window-item>

      <v-window-item :value="tabs.favorites">
        <error-block
          v-if="
            loadingFavoriteThreads ||
            failedLoadingFavoriteThreads ||
            !favoriteThreads.length
          "
          :loading="loadingFavoriteThreads"
          height="200"
        >
          <span v-if="failedLoadingFavoriteThreads">
            관심 프로젝트 목록을 불러오지 못했습니다.<br />
            나중에 다시 시도하거나 관리자에게 문의 바랍니다.
          </span>
          <span v-else> 아직 관심 등록한 프로젝트가 없습니다. </span>
        </error-block>
        <div v-else class="thread-list">
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
import router, { pages, safeBack } from "@/router";
import { useModalStore, useSystemStore } from "@/store";
import { formatDateRelative, formatLink } from "@/modules/utility";
import { constructQuery } from "@/modules/Services/queryBuilder";
import { watchTriggerable } from "@vueuse/core";

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
const portfolio = computed(
  () => portfolioResponse.value?.data[API.GetPortfolio]
);
const links = reactive([]);
const usersThreads = computed(
  () =>
    usersThreadsResponse.value?.data[API.GetUser].thread_set.filter(
      (thread) => !thread.is_deleted
    ) || []
);
const participations = computed(
  () =>
    participationResponse.value?.data[API.UsersApplications]
      .filter((application) => application.result == "PASS")
      .map((application) => application.recruitment) || []
);
const favoriteThreads = reactive([]);

// Props
const props = defineProps({
  userId: String,
});

// Watches
const { trigger: InitInfo } = watchTriggerable(tab, (value) => {
  switch (value) {
    case tabs.portfolio: {
      if (
        (!loadingPortfolio.value && !loadedPortfolio.value) ||
        failedLoadingPortfolio.value
      )
        fetchPortfolio();
      break;
    }
    case tabs.recruits: {
      if (
        (!loadingUsersThreads.value && !loadedUsersThreads.value) ||
        failedLoadingUsersThreads.value
      )
        fetchUsersThreads();
      break;
    }
    case tabs.participations: {
      if (
        (!loadingParticipations.value && !loadedParticipations.value) ||
        failedLoadingParticipations.value
      )
        fetchParticipations();
      break;
    }
    case tabs.favorites: {
      if (
        (!loadingFavoriteThreads.value && !loadedFavoriteThreads.value) ||
        failedLoadingFavoriteThreads.value
      )
        fetchFavoriteThreads();
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
  userId,
  () => {
    fetchUserData();
    tab.value = tabs.portfolio;
    InitInfo();
  },
  { immedaite: true }
);

// Hook
onBeforeMount(() => {
  fetchUserData();
  InitInfo();
});

// Methods
const {
  isLoading: loadingUserData,
  data: userDataResponse,
  execute: _fetchUserData,
} = useAPI();
const fetchUserData = () => {
  loadedPortfolio.value = false;
  loadedUsersThreads.value = false;
  loadedParticipations.value = false;
  loadedFavoriteThreads.value = false;

  _fetchUserData(
    constructQuery({
      name: API.GetUser,
      args: { id: Number(userId.value) },
      fields: ["id", "name", "email", "date_created", "occupation"],
    })
  )
    .then(parseResponse)
    .then((response) => {
      if (!response[API.GetUser]) throw new Error("유저를 찾을 수 없습니다.");
    })
    .catch((err) => {
      console.log(err);
      modalStore.showErrorMessage(err).then(() => safeBack());
    });
};

const {
  isLoading: loadingPortfolio,
  error: failedLoadingPortfolio,
  isFinished: loadedPortfolio,
  data: portfolioResponse,
  execute: _fetchPortfolio,
} = useAPI({
  onSuccess: ({ data: response }) => {
    if (!response[API.GetPortfolio]) {
      failedLoadingUsersThreads.value = true;
      return;
    }

    new apiRequest()
      .execute(
        API.GetLinks,
        { portfolio_id: Number(response[API.GetPortfolio].id) },
        "link"
      )
      .then(parseResponse)
      .then((response) =>
        links.splice(0, links.length, ...response[API.GetLinks])
      );
  },
});
const fetchPortfolio = () => {
  _fetchPortfolio(
    constructQuery({
      name: API.GetPortfolio,
      args: { user_id: Number(userId.value) },
      fields: ["id", "introduction"],
    })
  );
};

const {
  isLoading: loadingUsersThreads,
  error: failedLoadingUsersThreads,
  isFinished: loadedUsersThreads,
  data: usersThreadsResponse,
  execute: _fetchUsersThreads,
} = useAPI({
  onSuccess: ({ data: response }) => {
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
            "occupation",
            { commentforthread_set: ["is_deleted", { replies: "is_deleted" }] },
          ],
        },
      ],
    })
  );
};

const {
  isLoading: loadingParticipations,
  error: failedLoadingParticipations,
  isFinished: loadedParticipations,
  data: participationResponse,
  execute: _fetchParticipations,
} = useAPI({
  onSuccess: ({ data: response }) => {
    if (!response[API.UsersApplications]) {
      failedLoadingParticipations.value = true;
      return;
    }
  },
});
const fetchParticipations = () => {
  _fetchParticipations(
    constructQuery({
      name: API.UsersApplications,
      args: { user_id: Number(userId.value) },
      fields: [
        {
          recruitment: [
            {
              thread: [
                "id",
                { board: "id" },
                { user: ["id", "name"] },
                "is_deleted",
                "title",
                "content",
                "date_created",
                "views",
                "likes",
                "favorites",
                {
                  commentforthread_set: [
                    "is_deleted",
                    { replies: "is_deleted" },
                  ],
                },
              ],
            },
            { occupation: "name" },
          ],
        },
        "result",
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
    favoriteThreads.splice(...response[API.GetFavorites]),
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
  min-width: 480px;
  padding: 1.5em 2.5% 1.5em 2.5%;
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
