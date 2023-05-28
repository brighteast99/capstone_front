import { reactive } from "vue";
import { defineStore } from "pinia";

export const useDevelopStore = defineStore(
  "develop",
  () => {
    const announcements = reactive([
      {
        title: "이용안내",
        postId: "111",
      },
      {
        title: "본 서비스는 현재 시범 운영중입니다.",
        postId: "222",
      },
      {
        title:
          "공지 글자수 테스트 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890",
        postId: "333",
      },
    ]);

    const boards = reactive([
      {
        name: "프로젝트",
        boardId: "0",
      },
    ]);

    const newPosts = reactive([
      {
        title: "새 글 1",
        boardId: "latest",
        postId: "11",
      },
      {
        title: "새 글 2",
        boardId: "latest",
        postId: "22",
      },
      {
        title: "새 글 3",
        boardId: "latest",
        postId: "33",
      },
      {
        title:
          "긴 제목 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890",
        boardId: "latest",
        postId: "44",
      },
    ]);

    const trendingPosts = reactive([
      {
        title: "많이 본 글 1",
        boardId: "trending",
        postId: "1111",
      },
      {
        title: "많이 본 글 2",
        boardId: "trending",
        postId: "2222",
      },
      {
        title: "많이 본 글 3",
        boardId: "trending",
        postId: "3333",
      },
      {
        title:
          "긴 제목 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890",
        boardId: "trending",
        postId: "4444",
      },
    ]);

    const posts = reactive([
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 1",
        postId: "0",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 2",
        postId: "1",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 3",
        postId: "2",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 4",
        postId: "3",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 5",
        postId: "4",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 6",
        postId: "5",
        date: new Date(),
      },
    ]);

    const postData = reactive({
      writer: {
        id: 0,
        name: "홍길동",
      },
      title: "테스트 게시물",
      date: null,
      modifyDate: null,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "left" },
            content: [
              {
                type: "text",
                text: "Example Text",
              },
            ],
          },
        ],
      },
    });

    const updatePost = (newPost) => {
      Object.assign(postData, newPost);
    };

    return {
      announcements,
      boards,
      posts,
      newPosts,
      trendingPosts,
      postData,
      updatePost,
    };
  },
  { persist: true }
);
