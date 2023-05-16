<template>
  <div>
    <v-container class="header" fluid>
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
            @click="menuMVs.boards = true"
          >
            게시판
          </custom-btn>
          <custom-btn weight="bold" :to="{ name: 'Search' }">검색</custom-btn>

          <v-spacer></v-spacer>

          <!-- Login menu -->
          <div v-if="!systemStore.loggedIn" class="row">
            <v-btn
              variant="outlined"
              size="small"
              color="primary"
              :to="{ name: 'Login' }"
              style="margin-right: 10px"
            >
              로그인
            </v-btn>
            <v-btn
              variant="flat"
              size="small"
              color="primary"
              :to="{ name: 'Register' }"
            >
              회원가입
            </v-btn>
          </div>

          <!-- Profile area -->
          <div v-else class="row">
            <!-- Alerts icon -->
            <div style="position: relative; margin: auto; margin-right: 10px">
              <custom-btn
                :active="menuMVs.alert"
                color="primary"
                @click="menuMVs.alert = !menuMVs.alert"
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
            <v-avatar
              class="profile"
              color="primary"
              @click="menuMVs.menu = !menuMVs.menu"
            >
              <v-icon icon="mdi-account"> </v-icon>
            </v-avatar>

            <!-- Menus -->
            <v-expand-transition>
              <!-- Alerts -->
              <v-card
                class="menu"
                v-if="menuMVs.alert"
                width="300"
                v-click-outside="() => (menuMVs.alert = false)"
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
                v-else-if="menuMVs.menu"
                class="menu"
                v-click-outside="() => (menuMVs.menu = false)"
              >
                <v-list density="compact" variant="text">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-avatar color="primary" size="small">
                        <v-icon icon="mdi-account" size="small"></v-icon>
                      </v-avatar>
                    </template>
                    <div class="text-left mr-3">
                      <p class="name">{{ currentUser.name }}</p>
                      <p class="email">{{ currentUser.email }}</p>
                    </div>
                  </v-list-item>

                  <v-divider></v-divider>

                  <div v-for="item in items" :key="item">
                    <v-list-item
                      v-for="item in item"
                      :key="item"
                      :title="item.title"
                      :prepend-icon="item.appendIcon"
                      :to="{
                        name: item.routeName,
                        params: { userId: currentUser.id },
                      }"
                      :active="false"
                      @click="menuMVs.menu = false"
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
      <v-container v-if="menuMVs.boards" class="boards-list py-1" fluid>
        <v-row
          v-click-outside="{
            handler: () => (menuMVs.boards = false),
            include: boardsInclude,
          }"
          class="boards-list-area"
        >
          <v-col
            class="pa-0 d-flex flex-column justify-center"
            style="flex-basis: 24px; flex-grow: 0"
          >
            <v-icon
              v-if="!position.left"
              icon="mdi-chevron-left"
              color="grey"
            ></v-icon>
          </v-col>

          <v-col class="boards-list-boundary">
            <div class="d-flex" style="width: 100%">
              <div
                v-intersect="
                  (isInterSecting) => (position.left = isInterSecting)
                "
                style="width: 1px"
              ></div>

              <div
                v-for="boards in categories"
                :key="boards"
                class="boards-list-column"
              >
                <custom-btn
                  v-for="board in boards"
                  :key="board"
                  class="mb-1"
                  default-color="white"
                  :to="{
                    name: 'PostListPage',
                    params: { boardId: board.boardId },
                  }"
                  :size="16"
                  @click="menuMVs.boards = false"
                >
                  <p class="text-left">
                    {{ board.title }}
                  </p>
                </custom-btn>
              </div>

              <div
                class="text-h5 d-flex justify-center align-center"
                style="
                  flex-grow: 1;
                  color: rgba(255, 255, 255, 0.1);
                  min-width: fit-content;
                "
              >
                서비스 확대 준비중입니다
              </div>

              <div
                v-intersect="
                  (isInterSecting) => (position.right = isInterSecting)
                "
                style="width: 1px"
              ></div>
            </div>
          </v-col>

          <v-col
            class="pa-0 d-flex flex-column justify-center"
            style="flex-basis: 24px; flex-grow: 0"
          >
            <v-icon
              v-if="!position.right"
              icon="mdi-chevron-right"
              color="grey"
            ></v-icon>
          </v-col>
        </v-row>
      </v-container>
    </v-slide-y-transition>
  </div>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";
import LogoGroup from "@/components/LogoGroup.vue";

import { reactive, computed } from "vue";
import { useSystemStore, useModalStore } from "@/store";
import { modalResponses } from "@/store/modal.store";
import router from "@/router";

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
const modalStore = useModalStore();

// Data
const currentUser = computed(() => systemStore.currentUser);
const position = reactive({ left: true, right: false });
const categories = [
  [
    {
      title: "공지사항",
      boardId: "Announcement",
    },

    {
      title: "최신 프로젝트",
      boardId: "Latest",
    },

    {
      title: "인기 프로젝트",
      boardId: "Trending",
    },
  ],

  [
    {
      title: "프로젝트",
      boardId: "Projects",
    },
  ],
];
const items = [
  [
    {
      title: "내 정보",
      value: 1,
      appendIcon: "mdi-account-circle",
      routeName: "UserInfo",
    },
    {
      title: "작성글 목록",
      value: 3,
      appendIcon: "mdi-newspaper-variant-multiple",
      routeName: "UserPosts",
    },
    {
      title: "관심글 목록",
      value: 4,
      appendIcon: "mdi-bookmark-multiple",
      routeName: "UserBookmarks",
    },
  ],
];
const alerts = computed(() => 10);
const menuMVs = reactive({ boards: false, alert: false, menu: false });

// Methods
const logout = async () => {
  if (
    (await modalStore.openModal("로그아웃하시겠습니까?", null, {
      actions: [
        { label: "로그아웃", color: "error" },
        { label: "취소", response: modalResponses.Cancel, color: "black" },
      ],
    })) == modalResponses.Cancel
  )
    return;

  systemStore.logOut();
  menuMVs.menu = false;
  router.push({ name: "Main" });
};
const boardsInclude = () => {
  return [document.querySelector(".board-included")];
};
</script>

<style scoped>
.header {
  position: fixed;
  top: 0px;
  background-color: white;
  font-size: 1.2rem;
  z-index: 2;
}

.boards-list {
  position: fixed;
  top: 72px;
  background-color: rgba(40, 40, 40, 0.9);
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

.boards-list-column {
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
}
.email {
  margin-top: -5px;
  font-size: 0.8em;
  color: grey;
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
