<template>
  <v-card class="background">
    <v-card-title style="font-size: 1.6em; font-weight: bold">
      게시글 검색
    </v-card-title>
    <v-card-text>
      <v-container class="pa-0 pt-3" style="max-width: unset">
        <v-row no-gutters>
          <v-col cols="3">
            <custom-dropdown
              class="mb-4 pl-0"
              v-model="searchOptions.selectedBoard"
              :items="boards"
              item-value="id"
              style="font-size: 1.5em"
            >
            </custom-dropdown>
          </v-col>
          <v-col>
            <v-text-field
              v-model="searchOptions.keyword"
              placeholder="찾을 제목"
              variant="underlined"
              color="primary"
              autofocus
              hide-details
              density="compact"
              style="margin-top: -19px"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-combobox
            v-model="searchOptions.occupations.raw"
            variant="underlined"
            color="primary"
            density="compact"
            multiple
            chips
            closable-chips
            clearable
            hide-details
            hide-selected
            :hide-no-data="false"
            placeholder="모집 분야"
            :items="[
              '기획자',
              '디자이너',
              '백엔드 개발자',
              '풀스택 개발자',
              '프론트엔드 개발자',
            ]"
          >
            <template v-slot:selection>
              <v-icon icon="mdi-check"></v-icon>
            </template>
            <template v-slot:no-data>
              <error-block height="3em">
                조건에 맞는 직군이 없습니다
              </error-block>
            </template>
          </v-combobox>
        </v-row>
      </v-container>
    </v-card-text>

    <v-card-actions style="min-height: unset">
      <v-checkbox
        v-model="searchOptions.includeClosed"
        color="primary"
        hide-details
        density="compact"
        label="마감된 글 포함"
      >
      </v-checkbox>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="flat"
        :loading="isLoading"
        @click="searchThread"
      >
        검색
      </v-btn>
    </v-card-actions>
  </v-card>

  <v-card class="background">
    <v-card-title class="pa-5 pb-3" style="font-size: 1.4em; font-weight: 500">
      검색 결과
    </v-card-title>

    <v-divider class="mx-3"> </v-divider>

    <v-card-text class="list-area pt-2">
      <error-block
        v-if="isLoading || isError || !threads.length"
        :loading="isLoading"
        height="40dvh"
      >
        <p style="font-size: 24px">검색 결과가 없습니다.</p>
      </error-block>
      <div v-else v-for="thread in paginated" :key="thread">
        <thread-peeker :thread="thread"></thread-peeker>
        <v-divider class="mx-1 my-1"></v-divider>
      </div>
    </v-card-text>

    <v-card-actions v-if="threads.length">
      <v-spacer>
        <v-pagination
          v-model="currentPage"
          variant="text"
          :length="pageCount"
          active-color="primary_accent"
          density="compact"
          :show-first-last-page="pageCount > 10"
          total-visible="10"
        >
        </v-pagination>
      </v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import CustomDropdown from "@/components/CustomDropdown.vue";
import ThreadPeeker from "@/components/ThreadPeeker.vue";
import ErrorBlock from "@/components/ErrorBlock.vue";

import { ref, reactive, computed, onBeforeMount } from "vue";
import { API, apiRequest, useAPI, parseResponse } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";

// Data
const PAGE_SIZE = 10;
const currentPage = ref(1);
const pageCount = computed(
  () => parseInt(threads.value.length / PAGE_SIZE) || 1
);
const boards = reactive([]);
const searchOptions = reactive({
  selectedBoard: null,
  keyword: "",
  occupations: {
    raw: [],
    converted: computed(() => searchOptions.occupations.raw.join(",")),
  },
  includeClosed: false,
});
const threads = computed(
  () =>
    data.value?.data[API.SearchThreads].filter((thread) => {
      if (thread.board.id != searchOptions.selectedBoard) return false;

      if (searchOptions.includeClosed) return true;

      const hasActive = thread.recruitmentforthread_set.every(
        (recruitment) =>
          !searchOptions.occupations.raw.includes(
            recruitment.occupation.name
          ) || !recruitment.is_closed
      );

      return hasActive;
    }) || []
);
const paginated = computed(() =>
  threads.value.slice(
    PAGE_SIZE * (currentPage.value - 1),
    PAGE_SIZE * currentPage.value
  )
);

// Hook
onBeforeMount(() => {
  new apiRequest()
    .execute(API.GetBoards, null, ["id", "title", "board_type"])
    .then(parseResponse)
    .then((response) => {
      boards.push(
        ...response[API.GetBoards].filter(
          (board) => board.board_type != "SPECIAL"
        )
      );
      searchOptions.selectedBoard = boards[0].id;
    });
});

//  Methods
const { isLoading, isError, data, execute } = useAPI();
const searchThread = () => {
  const queryOption = {
    occupations: searchOptions.occupations.converted,
  };
  if (searchOptions.keyword) queryOption.search_value = searchOptions.keyword;

  execute(
    constructQuery({
      name: API.SearchThreads,
      args: {
        search_value: searchOptions.keyword,
        occupations: searchOptions.occupations.converted,
      },
      fields: [
        "id",
        { board: "id" },
        { user: ["id", "name"] },
        "title",
        "content",
        "date_created",
        "is_deleted",
        "views",
        "likes",
        "favorites",
        { recruitmentforthread_set: [{ occupation: "name" }, "is_closed"] },
        { commentforthread_set: ["is_deleted", { replies: "is_deleted" }] },
      ],
    })
  );
};
</script>
<style scoped>
.background {
  margin: 40px 0 40px 0;
  position: relative;
}

.list-area {
  min-height: 50dvh;
}
.select-board {
  font-size: 1.5em;
}
</style>
