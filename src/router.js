import { createWebHistory, createRouter } from "vue-router";

const routes = [
  // Main Page
  {
    path: "/",
    name: "Main",
    component: () => import("@/pages/MainPage"),
  },
  // Board page
  {
    path: "/boards/:boardId",
    name: "Board",

    children: [
      {
        path: "posts",
        children: [
          {
            path: "",
            name: "PostListPage",
            props: true,
            component: () => import("@/pages/PostListPage"),
          },
          {
            path: "new",
            name: "NewPostPage",
            component: () => import("@/pages/PostPage"),
            props: (route) => ({
              boardId: route.params.boardId,
              editing: true,
            }),
          },
          {
            path: ":postId",
            name: "PostPage",
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
    name: "Search",
    component: () => import("@/pages/SearchPage"),
  },
  // User info page
  {
    path: "/users/:userId",
    name: "UserInfo",
    component: () => import("@/pages/UserInfoPage"),
    props: true,
    children: [
      {
        path: "posts",
        name: "UserPosts",

        component: () => import("@/pages/UserInfoPage"),
      },
      {
        path: "bookmarks",
        name: "UserBookmarks",

        component: () => import("@/pages/UserInfoPage"),
      },
    ],
  },
  // Login page
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/LoginPage"),
  },
  // Register & find ID/PW page
  {
    path: "/account",
    name: "Account",
    component: () => import("@/pages/AccountPage"),
    children: [
      {
        path: "register",
        name: "Register",
        component: () => import("@/components/forms/RegisterForm"),
      },
      {
        path: "find/id",
        name: "FindUID",
        component: () => import("@/components/forms/FindIdForm"),
      },
      {
        path: "find/pw",
        name: "FindPW",
        component: () => import("@/components/forms/FindPwForm"),
      },
    ],
  },

  // 404:Not Found
  {
    path: "/:pathMatch(.*)*",
    name: "notFound",
    component: () => import("@/pages/NotFoundPage"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
