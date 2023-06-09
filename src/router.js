import { createWebHistory, createRouter } from "vue-router";
import { useSystemStore, useModalStore } from "./store";
import { API, apiRequest, parseResponse } from "./modules/Services/API";
import { modalPresets } from "./store/modal.store";

const pages = {
  Main: "Main",
  Board: "Board",
  ThreadList: "ThreadList",
  Thread: "Thread",
  NewThread: "NewThread",
  ViewThread: "ViewThread",
  EditThread: "EditThread",
  Search: "Search",
  UserInfo: "UserInfo",
  UserThreads: "UserThreads",
  UserBookmarks: "UserBookmarks",
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
    meta: { requireLogin: false, useTopNavbar: true },
  },
  // Board page
  {
    path: "/boards/:boardId",
    name: pages.Board,
    children: [
      {
        path: "threads",
        children: [
          {
            path: "",
            name: pages.ThreadList,
            props: true,
            component: () => import("@/pages/ThreadListPage"),
            meta: { requireLogin: false, useTopNavbar: true },
          },
          {
            path: "new",
            name: pages.NewThread,
            component: () => import("@/pages/EditThreadPage"),
            props: true,
            meta: { requireLogin: true, useTopNavbar: true, newThread: true },
            beforeEnter: async (to, from, next) => {
              const systemStore = useSystemStore();
              const modalStore = useModalStore();

              const response = await new apiRequest()
                .execute(API.GetBoard, { id: Number(to.params.boardId) }, [
                  "board_type",
                ])
                .then(parseResponse);

              if (
                response[API.GetBoard]?.board_type == "SPECIAL" &&
                !systemStore.currentUser.is_staff
              ) {
                await modalStore.showNoPermissionMessage();
                return next({
                  name: pages.ThreadList,
                  params: {
                    boardId: to.params.boardId,
                  },
                  replace: true,
                });
              }
              return next(true);
            },
          },
          {
            path: ":threadId",
            name: pages.Thread,
            children: [
              {
                path: "",
                name: pages.ViewThread,
                component: () => import("@/pages/ViewThreadPage"),
                props: true,
                meta: { requireLogin: false, useTopNavbar: true },
                beforeEnter: async (to, from, next) => {
                  const modalStore = useModalStore();

                  const response = await new apiRequest()
                    .execute(
                      API.GetThread,
                      { id: Number(to.params.threadId) },
                      [{ board: "id" }, "is_deleted"]
                    )
                    .then(parseResponse);

                  if (response[API.GetThread]?.is_deleted) {
                    await modalStore.openModal("삭제된 게시글입니다", null, {
                      actions: modalPresets.OK,
                    });
                    return next({
                      name: pages.ThreadList,
                      params: { boardId: to.params.boardId },
                      replace: true,
                    });
                  }

                  const exactBoardId = response[API.GetThread]?.board?.id;
                  if (exactBoardId != to.params.boardId) {
                    to.params.boardId = exactBoardId;
                    return next({
                      ...to,
                    });
                  }

                  return next(true);
                },
              },
              {
                path: "edit",
                name: pages.EditThread,
                component: () => import("@/pages/EditThreadPage"),
                props: true,
                meta: {
                  requireLogin: true,
                  useTopNavbar: true,
                  newThread: false,
                },
                beforeEnter: async (to, from, next) => {
                  const systemStore = useSystemStore();
                  const modalStore = useModalStore();

                  const response = await new apiRequest()
                    .execute(
                      API.GetThread,
                      { id: Number(to.params.threadId) },
                      [{ user: "id" }, { board: "id" }, "is_deleted"]
                    )
                    .then(parseResponse);

                  if (response[API.GetThread]?.is_deleted) {
                    await modalStore.openModal("삭제된 게시글입니다", null, {
                      actions: modalPresets.OK,
                    });
                    return next({
                      name: pages.ThreadList,
                      params: { boardId: to.params.boardId },
                      replace: true,
                    });
                  }

                  if (
                    !systemStore.currentUser.is_staff &&
                    response[API.GetThread]?.user?.id !=
                      systemStore.currentUser.id
                  ) {
                    await modalStore.showNoPermissionMessage();
                    return next({
                      name: pages.ViewThread,
                      params: {
                        boardId: to.params.boardId,
                        threadId: to.params.threadId,
                      },
                      replace: true,
                    });
                  }

                  const exactBoardId = response[API.GetThread]?.board?.id;
                  if (exactBoardId != to.params.boardId) {
                    to.params.boardId = exactBoardId;
                    return next({
                      ...to,
                    });
                  }

                  return next(true);
                },
              },
            ],
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
    meta: { requireLogin: false, useTopNavbar: true },
  },
  // User info page
  {
    path: "/users/:userId(\\d+)",
    name: pages.UserInfo,
    component: () => import("@/pages/UserInfoPage"),
    props: true,
    children: [
      {
        path: "threads",
        name: pages.UserThreads,
        props: true,
        component: () => import("@/pages/UserInfoPage"),
        meta: { requireLogin: false, useTopNavbar: true },
      },
      {
        path: "bookmarks",
        name: pages.UserBookmarks,
        props: true,
        component: () => import("@/pages/UserInfoPage"),
        meta: { requireLogin: false, useTopNavbar: true },
      },
    ],
    meta: { requireLogin: false, useTopNavbar: true },
  },
  // Login page
  {
    path: "/login",
    name: pages.Login,
    beforeEnter: (to, from, next) => {
      // redirect to main page if already logged in
      const systemStore = useSystemStore();
      if (systemStore.loggedIn) {
        if (from.name) return next(false);
        return next({ name: pages.Main, replace: true });
      }

      return next(true);
    },
    component: () => import("@/pages/LoginPage"),
    meta: { requireLogin: false, useTopNavbar: false },
  },
  // Register & find ID/PW page
  {
    path: "/account",
    component: () => import("@/pages/AccountPage"),
    children: [
      {
        path: "register",
        name: pages.Register,
        component: () => import("@/components/forms/RegisterForm"),
        meta: { requireLogin: false, useTopNavbar: false },
      },
      {
        path: "find/id",
        name: pages.FindUID,
        component: () => import("@/components/forms/FindIdForm"),
        meta: { requireLogin: false, useTopNavbar: false },
      },
      {
        path: "find/pw",
        name: pages.FindPW,
        component: () => import("@/components/forms/FindPwForm"),
        meta: { requireLogin: false, useTopNavbar: false },
      },
    ],
  },

  // 404:Not Found
  {
    path: "/:pathMatch(.*)*",
    name: pages.NotFound,
    component: () => import("@/pages/NotFoundPage"),
    meta: { requireLogin: false, useTopNavbar: true },
  },
  // 500: Server Error
  {
    path: "/:pathMatch(.*)*",
    name: pages.ServerError,
    component: () => import("@/pages/ErrorPage"),
    meta: { requireLogin: false, useTopNavbar: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

router.beforeEach(async (to, from, next) => {
  const systemStore = useSystemStore();

  // Continue to route if the page doesn't need login or user is already logged in
  if (!to.meta.requireLogin || systemStore.loggedIn) return next();

  // Routing from the outside of the service

  const modalStore = useModalStore();
  const response = await modalStore.showNeedLoginMessage();

  if (response === "Login") return next({ name: pages.Login });
  else if (from.name) return next(false);
  else return next({ name: pages.Main, replace: true });
});

export default router;
