import { createWebHistory, createRouter } from "vue-router";
import { useSystemStore, useModalStore } from "./store";
import { modalResponses } from "./store/modal.store";

const pages = {
  Main: "Main",
  Board: "Board",
  PostList: "PostList",
  NewPost: "NewPost",
  ViewPost: "ViewPost",
  Search: "Search",
  UserInfo: "UserInfo",
  UserPosts: "UserPosts",
  UserBookmarks: "UserBookmarks",
  Login: "Login",
  Register: "Register",
  FindUID: "FindUID",
  FindPW: "FindPW",
  NotFound: "NotFound",
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
    name: pages.Board,
    children: [
      {
        path: "posts",
        children: [
          {
            path: "",
            name: pages.PostList,
            props: true,
            component: () => import("@/pages/PostListPage"),
          },
          {
            path: "new",
            name: pages.NewPost,
            component: () => import("@/pages/PostPage"),
            beforeEnter: async () => {
              const systemStore = useSystemStore();
              const modalStore = useModalStore();
              if (!systemStore.loggedIn) {
                if (
                  (await modalStore.openModal("로그인이 필요합니다.", null, {
                    actions: [
                      { label: "로그인" },
                      {
                        label: "취소",
                        response: modalResponses.Cancel,
                        color: "black",
                      },
                    ],
                  })) == modalResponses.Cancel
                )
                  return false;
                return { name: pages.Login };
              }
            },
            props: (route) => ({
              boardId: route.params.boardId,
              editing: true,
            }),
          },
          {
            path: ":postId",
            name: pages.ViewPost,
            component: () => import("@/pages/PostPage"),
            props: (route) => ({
              boardId: route.params.boardId,
              postId: route.params.postId,
              editing: false,
            }),
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
    path: "/users/:userId",
    name: pages.UserInfo,
    component: () => import("@/pages/UserInfoPage"),
    props: true,
    children: [
      {
        path: "posts",
        name: pages.UserPosts,

        component: () => import("@/pages/UserInfoPage"),
      },
      {
        path: "bookmarks",
        name: pages.UserBookmarks,

        component: () => import("@/pages/UserInfoPage"),
      },
    ],
  },
  // Login page
  {
    path: "/login",
    name: pages.Login,
    beforeEnter: () => {
      const systemStore = useSystemStore();
      if (systemStore.loggedIn) return { name: pages.Main };
    },
    component: () => import("@/pages/LoginPage"),
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
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
