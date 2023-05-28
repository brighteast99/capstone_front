import { createWebHistory, createRouter } from "vue-router";
import { useSystemStore, useModalStore, useDevelopStore } from "./store";

const pages = {
  Main: "Main",
  Board: "Board",
  PostList: "PostList",
  Post: "Post",
  NewPost: "NewPost",
  ViewPost: "ViewPost",
  EditPost: "EditPost",
  Search: "Search",
  UserInfo: "UserInfo",
  UserPosts: "UserPosts",
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
        path: "posts",
        children: [
          {
            path: "",
            name: pages.PostList,
            props: true,
            component: () => import("@/pages/PostListPage"),
            meta: { requireLogin: false, useTopNavbar: true },
          },
          {
            path: "new",
            name: pages.NewPost,
            component: () => import("@/pages/PostPage"),
            props: true,
            meta: { requireLogin: true, useTopNavbar: true },
          },
          {
            path: ":postId",
            name: pages.Post,
            children: [
              {
                path: "",
                name: pages.ViewPost,
                component: () => import("@/pages/PostPage"),
                props: true,
                meta: { requireLogin: false, useTopNavbar: true },
              },
              {
                path: "edit",
                name: pages.EditPost,
                beforeEnter: async (to, from, next) => {
                  const systemStore = useSystemStore();
                  const modalStore = useModalStore();
                  const developStore = useDevelopStore();

                  // Check if current user is the writer of the post
                  if (
                    systemStore.currentUser.id !=
                    developStore.postData.writer.id
                  ) {
                    if (!from) return next({ name: pages.Main });

                    await modalStore.openModal("권한이 없습니다!", null, {
                      actions: [{ label: "OK" }],
                    });
                    return next({ name: pages.Main });
                  }

                  next();
                },
                component: () => import("@/pages/PostPage"),
                props: true,
                meta: { requireLogin: true, useTopNavbar: true },
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
        path: "posts",
        name: pages.UserPosts,
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
    beforeEnter: () => {
      // redirect to main page if already logged in
      const systemStore = useSystemStore();
      if (systemStore.loggedIn) return { name: pages.Main };
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
  if (!from) return next({ name: pages.Main });
  // Internel routing
  else {
    const modalStore = useModalStore();
    await modalStore
      .openModal("로그인이 필요한 페이지입니다.", null, {
        actions: [
          { label: "로그인", response: "Login" },
          { label: "취소", response: "Cancel", color: "black" },
        ],
      })
      .then((response) => {
        console.log(response);
        if (response === "Login") return next({ name: pages.Login });
        else {
          console.log(from);
          return next(false);
        }
      });
  }
});

export default router;
