import { reactive } from "vue";
import { defineStore } from "pinia";

export const useDevelopStore = defineStore(
  "develop",
  () => {
    const announcements = reactive([
      {
        title: "이용안내",
        threadId: "111",
      },
      {
        title: "본 서비스는 현재 시범 운영중입니다.",
        threadId: "222",
      },
      {
        title:
          "공지 글자수 테스트 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890",
        threadId: "333",
      },
    ]);

    const boards = reactive([
      {
        name: "프로젝트",
        boardId: "0",
      },
    ]);

    const newThreads = reactive([
      {
        title: "새 글 1",
        boardId: "latest",
        threadId: "11",
      },
      {
        title: "새 글 2",
        boardId: "latest",
        threadId: "22",
      },
      {
        title: "새 글 3",
        boardId: "latest",
        threadId: "33",
      },
      {
        title:
          "긴 제목 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890",
        boardId: "latest",
        threadId: "44",
      },
    ]);

    const trendingThreads = reactive([
      {
        title: "많이 본 글 1",
        boardId: "trending",
        threadId: "1111",
      },
      {
        title: "많이 본 글 2",
        boardId: "trending",
        threadId: "2222",
      },
      {
        title: "많이 본 글 3",
        boardId: "trending",
        threadId: "3333",
      },
      {
        title:
          "긴 제목 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890",
        boardId: "trending",
        threadId: "4444",
      },
    ]);

    const threads = reactive([
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 1",
        threadId: "0",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 2",
        threadId: "1",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 3",
        threadId: "2",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 4",
        threadId: "3",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 5",
        threadId: "4",
        date: new Date(),
      },
      {
        writer: {
          id: 1,
          name: "홍길동",
        },
        title: "테스트 게시물 6",
        threadId: "5",
        date: new Date(),
      },
    ]);

    const threadData = reactive({
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

    const updateThread = (newThread) => {
      Object.assign(threadData, newThread);
    };

    return {
      announcements,
      boards,
      threads,
      newThreads,
      trendingThreads,
      threadData,
      updateThread,
    };
  },
  { persist: true }
);
