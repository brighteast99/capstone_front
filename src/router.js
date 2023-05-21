import { createWebHistory, createRouter } from "vue-router";
import { useSystemStore, useModalStore, useDevelopStore } from "./store";

const pages = {
  Main: {
    name: "Main",
    needLogin: false,
  },
  Board: {
    name: "Board",
    needLogin: false,
  },
  PostList: {
    name: "PostList",
    needLogin: false,
  },
  Post: {
    name: "Post",
    needLogin: false,
  },
  NewPost: {
    name: "NewPost",
    needLogin: true,
  },
  ViewPost: {
    name: "ViewPost",
    needLogin: false,
  },
  EditPost: {
    name: "EditPost",
    needLogin: true,
  },
  Search: {
    name: "Search",
    needLogin: false,
  },
  UserInfo: {
    name: "UserInfo",
    needLogin: false,
  },
  UserPosts: {
    name: "UserPosts",
    needLogin: false,
  },
  UserBookmarks: {
    name: "UserBookmarks",
    needLogin: false,
  },
  Login: {
    name: "Login",
    needLogin: false,
  },
  Register: {
    name: "Register",
    needLogin: false,
  },
  FindUID: {
    name: "FindUID",
    needLogin: false,
  },
  FindPW: {
    name: "FindPW",
    needLogin: false,
  },
  NotFound: {
    name: "NotFound",
    needLogin: false,
  },
};
Object.freeze(pages);

export { pages };

const routes = [
  // Main Page
  {
    path: "/",
    name: pages.Main.name,
    component: () => import("@/pages/MainPage"),
  },
  // Board page
  {
    path: "/boards/:boardId",
    name: pages.Board.name,
    children: [
      {
        path: "posts",
        children: [
          {
            path: "",
            name: pages.PostList.name,
            props: true,
            component: () => import("@/pages/PostListPage"),
          },
          {
            path: "new",
            name: pages.NewPost.name,
            component: () => import("@/pages/PostPage"),
            props: true,
          },
          {
            path: ":postId",
            name: pages.Post.name,
            children: [
              {
                path: "",
                name: pages.ViewPost.name,
                component: () => import("@/pages/PostPage"),
                props: true,
              },
              {
                path: "edit",
                name: pages.EditPost.name,
                beforeEnter: async (to, from, next) => {
                  const systemStore = useSystemStore();
                  const modalStore = useModalStore();
                  const developStore = useDevelopStore();

                  if (
                    systemStore.currentUser.id !=
                    developStore.postData.writer.id
                  ) {
                    if (!from.name) return next({ name: pages.Main.name });

                    await modalStore.openModal("권한이 없습니다!", null, {
                      actions: [{ label: "OK" }],
                    });
                    return next({ name: pages.Main.name });
                  }

                  next();
                },
                component: () => import("@/pages/PostPage"),
                props: true,
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
    name: pages.Search.name,
    component: () => import("@/pages/SearchPage"),
  },
  // User info page
  {
    path: "/users/:userId",
    name: pages.UserInfo.name,
    component: () => import("@/pages/UserInfoPage"),
    props: true,
    children: [
      {
        path: "posts",
        name: pages.UserPosts.name,
        props: true,
        component: () => import("@/pages/UserInfoPage"),
      },
      {
        path: "bookmarks",
        name: pages.UserBookmarks.name,
        props: true,
        component: () => import("@/pages/UserInfoPage"),
      },
    ],
  },
  // Login page
  {
    path: "/login",
    name: pages.Login.name,
    beforeEnter: () => {
      const systemStore = useSystemStore();
      if (systemStore.loggedIn) return { name: pages.Main.name };
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
        name: pages.Register.name,
        component: () => import("@/components/forms/RegisterForm"),
      },
      {
        path: "find/id",
        name: pages.FindUID.name,
        component: () => import("@/components/forms/FindIdForm"),
      },
      {
        path: "find/pw",
        name: pages.FindPW.name,
        component: () => import("@/components/forms/FindPwForm"),
      },
    ],
  },

  // 404:Not Found
  {
    path: "/:pathMatch(.*)*",
    name: pages.NotFound.name,
    component: () => import("@/pages/NotFoundPage"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

router.beforeEach(async (to, from, next) => {
  if (!pages[to.name].needLogin) return next();

  const systemStore = useSystemStore();
  if (systemStore.loggedIn) return next();

  if (!from.name) return next({ name: pages.Main.name });

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
      if (response === "Login") return next({ name: pages.Login.name });
      else {
        console.log(from);
        return next(false);
      }
    });
});

export default router;
