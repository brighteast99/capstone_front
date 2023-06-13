<template>
  <v-card class="background">
    <v-card-title style="font-size: 1.6em; font-weight: bold">
      게시글 검색
    </v-card-title>
    <v-card-text>
      <v-container class="pa-0 pt-3">
        <v-row no-gutters>
          <v-col cols="3">
            <custom-dropdown
              class="mb-4 pl-0"
              :items="['게시판 이름']"
              :model-value="'게시판 이름'"
              style="font-size: 1.5em"
            >
            </custom-dropdown>
          </v-col>
          <v-col>
            <v-text-field
              placeholder="찾을 내용"
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
        color="primary"
        hide-details
        density="compact"
        label="마감된 글 포함"
      >
      </v-checkbox>
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="flat">검색</v-btn>
    </v-card-actions>
  </v-card>
  <v-card class="background">
    <v-card-title class="pa-5 pb-3" style="font-size: 1.4em; font-weight: 500">
      검색 결과
    </v-card-title>

    <v-divider class="mx-3"> </v-divider>

    <v-card-text class="list-area pt-2">
      <error-block v-if="!threads" height="40dvh">
        <v-icon icon="mdi-alert-outline" color="error" size="128"> </v-icon>
        <p style="font-size: 24px">검색 결과가 없습니다.</p>
      </error-block>
      <div v-else v-for="thread in threads" :key="thread">
        <thread-peeker :thread="thread"></thread-peeker>
        <v-divider class="mx-1 my-1"></v-divider>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer>
        <v-pagination
          variant="text"
          length="10"
          active-color="primary_accent"
          density="compact"
          show-first-last-page
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

import { reactive, onBeforeMount } from "vue";

// Data
const threads = reactive([]);

// Hook
onBeforeMount(() => {
  for (let i = 0; i < 10; i++)
    threads.push({
      title: "dummy",
      content: "dummy thread",
      board: { id: null, name: "search_result" },
      user: { id: null, name: "dummy" },
      views: 999,
      likes: 999,
      favorites: 99,
      is_deleted: false,
      commentforthread_set: [
        {
          is_deleted: false,
          replies: [{ is_deleted: false }, { is_deleted: false }],
        },
        {
          is_deleted: false,
          replies: [{ is_deleted: false }, { is_deleted: false }],
        },
        {
          is_deleted: false,
          replies: [{ is_deleted: false }, { is_deleted: false }],
        },
      ],
    });
});
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
