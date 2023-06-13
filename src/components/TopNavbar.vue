<template>
  <div>
    <v-container class="header" fluid :style="{ height: navHeight + 'px' }">
      <v-defaults-provider :defaults="defaults">
        <v-row
          class="mx-auto align-center"
          style="max-width: 1024px; position: relative"
        >
          <!-- Logo -->
          <logo-group class="mr-10"></logo-group>

          <!-- Nav items -->
          <custom-btn
            class="board-included"
            weight="bold"
            @click="menuMVs.boards.value = true"
          >
            게시판
          </custom-btn>
          <custom-btn weight="bold" :to="{ name: pages.Search }">
            검색
          </custom-btn>

          <v-spacer></v-spacer>

          <!-- Login menu -->
          <div v-if="!loggedIn" class="row">
            <v-btn
              variant="outlined"
              size="small"
              color="primary"
              :to="{ name: pages.Login }"
              style="margin-right: 10px"
            >
              로그인
            </v-btn>
            <v-btn
              variant="flat"
              size="small"
              color="primary"
              :to="{ name: pages.Register }"
            >
              회원가입
            </v-btn>
          </div>

          <!-- Profile area -->
          <div v-else class="row">
            <!-- Alerts icon -->
            <div style="position: relative; margin: auto; margin-right: 10px">
              <custom-btn
                :active="menuMVs.alert.value"
                @click="menuMVs.alert.toggle()"
              >
                <v-icon icon="mdi-bell" size="28"></v-icon>
              </custom-btn>
              <v-sheet
                v-if="alerts > 0"
                class="profile-alert-badge"
                color="error"
              >
              </v-sheet>
            </div>

            <!-- Profile icon -->
            <v-avatar class="profile" @click="menuMVs.menu.toggle()">
              <v-icon icon="mdi-account-circle" size="50" color="primary">
              </v-icon>
            </v-avatar>

            <!-- Menus -->
            <v-expand-transition>
              <!-- Alerts -->
              <v-card
                class="menu"
                v-if="menuMVs.alert.value"
                width="300"
                v-click-outside="() => (menuMVs.alert.value = false)"
              >
                <v-card-title class="pb-0">
                  <span style="letter-spacing: 2px; vertical-align: middle">
                    알림
                  </span>
                  <v-chip v-if="alerts > 0" size="x-small" color="primary">
                    {{ alerts }}
                  </v-chip>
                  <custom-btn
                    size="small"
                    class="pr-0"
                    style="float: right; margin-top: 3px"
                  >
                    읽음으로 처리
                  </custom-btn>
                  <div style="clear: right"></div>
                </v-card-title>
                <v-divider></v-divider>

                <v-card-text class="py-0">
                  <p v-if="alerts == 0" class="text-center text-disabled">
                    새로운 알림이 없습니다.
                  </p>
                  <v-list v-else>
                    <v-skeleton-loader
                      v-for="i in 3"
                      :key="i"
                      boilerplate
                      type="list-item-avatar-two-line"
                    >
                    </v-skeleton-loader>
                  </v-list>
                </v-card-text>
              </v-card>

              <!-- User menus -->
              <v-card
                v-else-if="menuMVs.menu.value"
                class="menu"
                v-click-outside="() => (menuMVs.menu.value = false)"
              >
                <v-card-title class="d-flex pa-3 align-center">
                  <v-avatar>
                    <v-icon icon="mdi-account-circle" size="40" color="primary">
                    </v-icon>
                  </v-avatar>
                  <div class="text-left ml-2">
                    <p class="name">{{ currentUser.name }}</p>
                    <p class="email">{{ currentUser.email }}</p>
                  </div>
                </v-card-title>

                <v-divider class="mx-2"></v-divider>

                <v-list density="compact" variant="text">
                  <div v-for="item in items" :key="item">
                    <v-list-item
                      v-for="item in item"
                      :key="item"
                      :title="item.title"
                      :prepend-icon="item.appendIcon"
                      :to="{
                        name: item.routeName,
                        params: { userId: currentUser.id },
                        query: item.query,
                      }"
                      :active="false"
                    >
                    </v-list-item>
                    <v-divider></v-divider>
                  </div>

                  <v-list-item
                    class="text-error text-center"
                    title="로그아웃"
                    @click="logout"
                  >
                  </v-list-item>
                </v-list>
              </v-card>
            </v-expand-transition>
          </div>
        </v-row>
      </v-defaults-provider>
    </v-container>

    <!-- Navigation menu -->
    <v-slide-y-transition>
      <v-container
        v-if="menuMVs.boards.value"
        class="boards-list py-1"
        fluid
        :style="{ top: navHeight + 'px' }"
      >
        <v-row
          v-click-outside="{
            handler: () => (menuMVs.boards.value = false),
          }"
          class="boards-list-area"
        >
          <v-col
            class="pa-0 d-flex flex-column justify-center"
            style="flex-basis: 24px; flex-grow: 0"
          >
            <v-slide-x-transition origin="right">
              <v-icon
                v-if="overflows && !left"
                icon="mdi-chevron-left"
                color="grey"
              ></v-icon>
            </v-slide-x-transition>
          </v-col>

          <v-col ref="list" class="boards-list-boundary">
            <div ref="listInner" class="d-flex" style="min-width: 975px">
              <div v-for="boards in boardGroups" :key="boards" class="d-flex">
                <div class="boards-list-grid">
                  <custom-btn
                    v-for="board in boards"
                    :key="board"
                    :active="
                      router.currentRoute.value.fullPath.startsWith(
                        `/boards/${board.id}`
                      )
                    "
                    :disabled="
                      router.currentRoute.value.fullPath ==
                      `/boards/${board.id}`
                    "
                    class="mb-1"
                    color="primary_lighter"
                    default-color="white"
                    :to="{
                      name: pages.ThreadList,
                      params: { boardId: board.id },
                    }"
                    :size="16"
                  >
                    <p class="text-left">
                      {{ board.title }}
                    </p>
                  </custom-btn>
                </div>
                <v-divider vertical color="grey"></v-divider>
              </div>

              <div
                class="text-h5 d-flex justify-center align-center px-10"
                style="flex-grow: 1; min-width: fit-content"
                :style="{ color: error ? 'gray' : 'rgba(255, 255, 255, 0.1)' }"
              >
                {{ error ? "오류가 발생했습니다" : "서비스 확대 준비중입니다" }}
              </div>
            </div>
          </v-col>

          <v-col
            class="pa-0 d-flex flex-column justify-center"
            style="flex-basis: 24px; flex-grow: 0"
          >
            <v-slide-x-reverse-transition>
              <v-icon
                v-if="overflows && !right"
                icon="mdi-chevron-right"
                color="grey"
              ></v-icon>
            </v-slide-x-reverse-transition>
          </v-col>
        </v-row>
      </v-container>
    </v-slide-y-transition>
  </div>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";
import LogoGroup from "@/components/LogoGroup.vue";

import { ref, reactive, computed, onBeforeMount, watch } from "vue";
import { useElementSize, useScroll, toRefs } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useSystemStore, useModalStore } from "@/store";
import { modalResponses, modalActions } from "@/store/modal.store";
import router, { pages } from "@/router";
import { createToggle } from "@/modules/utility";
import { API, useAPI, parseResponse } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";

// Component
const list = ref();
const listInner = ref();

// Style
const defaults = {
  VCol: {
    alignSelf: "center",
  },
  VList: {
    variant: "plain",
    density: "compact",
  },
  VMenu: {
    openOnClick: true,
    location: "bottom right",
  },
  VDivider: {
    thickness: 1,
  },
};

// Pinia Storage
const systemStore = useSystemStore();
const { loggedIn, currentUser, navHeight } = storeToRefs(systemStore);
const modalStore = useModalStore();

// Data
const { width: outterWidth } = useElementSize(list);
const { width: innerWidth } = useElementSize(listInner);
const overflows = computed(() => innerWidth.value >= outterWidth.value);
const { arrivedState } = useScroll(list);
const { left, right } = toRefs(arrivedState);
const boardGroups = reactive([]);
const items = [
  [
    {
      title: "내 정보",
      value: 1,
      appendIcon: "mdi-clipboard-account",
      routeName: pages.UserInfo,
    },
    {
      title: "작성글 목록",
      value: 2,
      appendIcon: "mdi-playlist-edit",
      routeName: pages.UserInfo,
      query: { tab: "recruits" },
    },
    {
      title: "관심글 목록",
      value: 3,
      appendIcon: "mdi-playlist-star",
      routeName: pages.UserInfo,
      query: { tab: "favorites" },
    },
  ],
];
const alerts = computed(() => 10);
const menuMVs = reactive({
  boards: createToggle(false),
  alert: createToggle(false),
  menu: createToggle(false),
});

// Watch
watch(
  () => router.currentRoute.value,
  () => {
    menuMVs.boards.value = false;
    menuMVs.alert.value = false;
    menuMVs.menu.value = false;
  }
);

// Hook
const { error, execute: LoadBoards } = useAPI();
onBeforeMount(() => {
  LoadBoards(
    constructQuery({
      name: API.GetBoards,
      args: null,
      fields: ["id", "title", "board_type"],
    })
  )
    .then(parseResponse)
    .then((response) => {
      let specials = [];
      let generals = [];

      response[API.GetBoards].map((board) => {
        if (board.board_type == "SPECIAL") specials.push(board);
        else generals.push(board);
      });

      boardGroups.push(specials);
      boardGroups.push(generals);
    });
});

// Methods
const logout = () => {
  modalStore
    .openModal("로그아웃하시겠습니까?", null, {
      actions: [
        { label: "로그아웃", response: modalResponses.OK, color: "error" },
        modalActions.SafeCancel,
      ],
    })
    .then((response) => {
      if (response === modalResponses.OK) {
        menuMVs.menu.value = false;
        systemStore.logOut();
      }
    });
};
</script>

<style scoped>
.header {
  position: fixed;
  top: 0px;
  background-color: white;
  font-size: 1.2rem;
  z-index: 2;
  min-width: 1024px;
  box-shadow: 0 0 5px 1px #a0a0a0;
}

.boards-list {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1;
}

.boards-list-area {
  max-width: 1024px;
  display: flex;
  margin: auto;
}

.boards-list-boundary {
  display: flex;
  overflow-x: scroll;
  padding: 10px 0 10px 0;
}

::-webkit-scrollbar {
  display: none;
}

.boards-category-title {
  margin-left: 20px;
  font-weight: bold;
  font-size: 1.2em;
  color: white;
}
.boards-list-grid {
  display: grid;
  grid-template-rows: repeat(auto-fill, 20px);
  row-gap: 5px;
  column-gap: 10px;
  grid-auto-flow: column;
  max-height: 15dvh;
  margin: 0 15px 0 15px;
}

.name {
  font-size: 1em;
  font-weight: 800;
  line-height: 1;
}
.email {
  font-size: 0.8em;
  color: grey;
  line-height: 1;
  margin: 0.2em 0 0 0.1em;
}

.v-list .v-divider {
  margin: 5px 7.5px 5px 7.5px;
}

.row {
  display: flex;
  flex-direction: row;
  margin: auto;
}

.profile-alert-badge {
  width: 10px;
  height: 10px;
  position: absolute;
  border-radius: 5px;
  top: 2px;
  right: 7px;
}

.menu {
  position: absolute;
  top: 68px;
  right: 0px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.profile {
  cursor: pointer;
  transition: all 0.2s;
}

.profile:hover {
  box-shadow: 0 0 0 5px lightgray;
}

.profile:active {
  box-shadow: 0 0 0 3px rgb(168, 168, 168);
  transition: all 0.1s;
}

.expand-x-enter-active,
.expand-x-leave-active {
  transition: all 0.1s;
}
.expand-x-enter-from,
.expand-x-leave-to {
  transform: scaleX(0);
}
</style>
