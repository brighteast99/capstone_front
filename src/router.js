import { createWebHistory, createRouter } from "vue-router";
import { useSystemStore, useModalStore } from "./store";
import { API, apiRequest, parseResponse } from "./modules/Services/API";
import { modalPresets } from "./store/modal.store";

const pages = {
  Main: "Main",
  ThreadList: "ThreadList",
  Thread: "Thread",
  NewThread: "NewThread",
  ViewThread: "ViewThread",
  EditThread: "EditThread",
  Search: "Search",
  UserInfo: "UserInfo",
  Login: "Login",
  Register: "Register",
  FindUID: "FindUID",
  FindPW: "FindPW",
  NotFound: "NotFound",
  ServerError: "ServerError",
};
Object.freeze(pages);

export { pages };

const routes = [
  // Main Page
  {
    path: "/",
    name: pages.Main,
    component: () => import("@/pages/MainPage"),
  },
  // Board page
  {
    path: "/boards/:boardId",
    children: [
      {
        path: "",
        name: pages.ThreadList,
        props: true,
        component: () => import("@/pages/ThreadListPage"),
      },
      {
        path: "threads/new",
        name: pages.NewThread,
        component: () => import("@/pages/EditThreadPage"),
        props: true,
        meta: { requireLogin: true, newThread: true },
      },
      {
        path: "threads/:threadId",
        name: pages.Thread,
        children: [
          {
            path: "",
            name: pages.ViewThread,
            component: () => import("@/pages/ViewThreadPage"),
            props: true,
            beforeEnter: async (to, from, next) => {
              const modalStore = useModalStore();

              const response = (
                await new apiRequest()
                  .execute(API.GetThread, { id: Number(to.params.threadId) }, [
                    { board: "id" },
                    "is_deleted",
                  ])
                  .then(parseResponse)
              )[API.GetThread];

              if (!response || response.is_deleted) {
                await modalStore.openModal("존재하지 않는 게시글입니다", null, {
                  actions: modalPresets.OK,
                });
                return next(safeBlock(from));
              }

              const exactBoardId = response.board?.id;
              if (exactBoardId != to.params.boardId) {
                to.params.boardId = exactBoardId;
                return next({ ...to });
              }

              return next(true);
            },
          },
          {
            path: "edit",
            name: pages.EditThread,
            component: () => import("@/pages/EditThreadPage"),
            props: true,
            meta: { requireLogin: true },
          },
        ],
      },
    ],
  },
  // Search Page
  {
    path: "/search",
    name: pages.Search,
    component: () => import("@/pages/SearchPage"),
  },
  // User info page
  {
    path: "/users/:userId(\\d+)",
    name: pages.UserInfo,
    component: () => import("@/pages/UserInfoPage"),
    props: true,
    beforeEnter: (to) => {
      if (to.query.tab) return true;
      return { name: to.name, params: to.params, query: { tab: "portfolio" } };
    },
  },
  // Login page
  {
    path: "/login",
    name: pages.Login,
    beforeEnter: (to, from, next) => {
      // redirect to main page if already logged in
      const systemStore = useSystemStore();
      if (systemStore.loggedIn) return next(safeBlock(from));

      return next(true);
    },
    component: () => import("@/pages/LoginPage"),
    meta: { hideTopNavbar: true },
  },
  // Register & find ID/PW page
  {
    path: "/account",
    component: () => import("@/pages/AccountPage"),
    meta: { ideTopNavbar: true },
    children: [
      {
        path: "register",
        name: pages.Register,
        component: () => import("@/components/forms/RegisterForm"),
      },
      {
        path: "find/id",
        name: pages.FindUID,
        component: () => import("@/components/forms/FindIdForm"),
      },
      {
        path: "find/pw",
        name: pages.FindPW,
        component: () => import("@/components/forms/FindPwForm"),
      },
    ],
  },

  // 404:Not Found
  {
    path: "/:pathMatch(.*)*",
    name: pages.NotFound,
    component: () => import("@/pages/NotFoundPage"),
  },
  // 500: Server Error
  {
    path: "/:pathMatch(.*)*",
    name: pages.ServerError,
    component: () => import("@/pages/ErrorPage"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

router.beforeEach(async (to, from, next) => {
  const systemStore = useSystemStore();

  // Continue to route if the page doesn't need login or user is already logged in
  if (!to.meta.requireLogin || systemStore.loggedIn) return next(true);

  const modalStore = useModalStore();
  const response = await modalStore.showNeedLoginMessage();

  if (response === "Login")
    return next({ name: pages.Login, query: { redirect: to.fullPath } });
  return next(safeBlock(from));
});

/**
 *
 * @param {defaultRoute: {name: String, params: Object}} options
 * @returns
 */
export const safeBack = (options) => {
  try {
    router.resolve(window.history.state.back);
    router.back();
  } catch (err) {
    router.push(options?.defaultRoute ?? { name: pages.Main });
  }
};

const safeBlock = (from) => {
  if (from?.name) return false;
  else return { name: pages.Main };
};
export default router;
