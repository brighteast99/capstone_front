<template>
  <v-card class="background">
    <v-card-title class="pt-5 pl-7 d-flex align-baseline">
      <p class="board-name mr-3">{{ props.boardId }}</p>
      <p class="board-desc"></p>
      <v-spacer></v-spacer>
      <custom-btn
        size="small"
        :to="{ name: pages.NewPost, params: { boardId: props.boardId } }"
      >
        게시글 작성
      </custom-btn>
    </v-card-title>

    <v-divider class="mx-3"> </v-divider>

    <v-card-text class="list-area">
      <div
        v-if="!posts && !loading"
        class="d-flex flex-column justify-center align-center"
      >
        <v-icon icon="mdi-alert-outline" color="error" size="128"> </v-icon>
        <p style="font-size: 24px">아직 등록된 글이 없습니다.</p>
      </div>
      <template v-else>
        <v-list density="compact">
          <v-list-item v-for="post in posts" :key="post">
            <custom-btn
              size="medium"
              defaultColor="black"
              :to="{
                name: pages.ViewPost,
                params: { boardId: props.boardId, postId: post.id },
              }"
            >
              <p class="title-text">
                {{ post.title }}
              </p>
            </custom-btn>

            <template v-slot:append>
              <div class="d-flex">
                <custom-btn
                  :to="{
                    name: pages.UserInfo,
                    params: { userId: post.user.id },
                  }"
                >
                  {{ post.user.name }}
                </custom-btn>
                <p>{{ new Date(post.date_updated).toLocaleDateString() }}</p>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </template>
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
import CustomBtn from "@/components/CustomBtn.vue";

import { ref, reactive, defineProps, onBeforeMount } from "vue";
import { pages } from "@/router";
import { API, apiRequest, parseResponse } from "@/modules/Services/API";

// Data
const posts = reactive([]);
const loading = ref(true);

// Props
const props = defineProps({
  boardId: String,
});

// Hook
onBeforeMount(() => {
  new apiRequest()
    .execute(API.SearchPosts, { search_type: 0 }, [
      "id",
      "title",
      "date_updated",
      "user { id name }",
    ])
    .then(parseResponse)
    .then((response) => {
      posts.push(...response[API.SearchPosts]);
    })
    .catch((err) => {
      /**
       * TODO: 에러 처리
       */
      console.log(err);
    })
    .finally(() => (loading.value = false));
});
</script>
<style scoped>
.background {
  margin-top: 40px;
  position: relative;
}

.board-name {
  font-size: 1.5em;
  font-weight: bold;
}
.board-desc {
  line-height: 1.3;
  font-size: 0.9em;
  color: grey;
  font-weight: lighter;
}

.list-area {
  min-height: 50dvh;
  max-height: 70dvh;
}
.title-text {
  width: 100%;
  display: block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.1s;
  text-align: left;
}
</style>
