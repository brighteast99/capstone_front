<template>
  <v-card class="background">
    <v-card-title class="pt-5 pl-7 d-flex align-baseline">
      <p class="board-name mr-3">{{ props.boardId }}</p>
      <p class="board-desc">게시판 소개글</p>
      <v-spacer></v-spacer>
      <custom-btn
        size="small"
        :to="{ name: 'NewPostPage', params: { boardId: props.boardId } }"
      >
        게시글 작성
      </custom-btn>
    </v-card-title>

    <v-divider class="mx-3"> </v-divider>

    <v-card-text class="list-area">
      <div
        v-if="posts.length == 0"
        class="d-flex fill-height justify-center align-center"
      >
        <v-icon icon="mdi-alert-outline" color="error" size="128"> </v-icon>
        <span style="font-size: 24px">아직 등록된 글이 없습니다.</span>
      </div>
      <template v-else>
        <v-list density="compact">
          <v-list-item v-for="post in posts" :key="post">
            <custom-btn
              :to="{
                name: 'PostPage',
                params: { boardId: props.boardId, postId: post.postId },
              }"
            >
              <p class="title-text">
                {{ post.title }}
              </p>
            </custom-btn>
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

import { defineProps, reactive, onMounted } from "vue";
import { useDevelopStore } from "@/store";

// Pinia storage
const developStore = useDevelopStore();

// Data
const posts = reactive([]);

// Props
const props = defineProps({
  boardId: String,
});

// Hook
onMounted(() => {
  // console.log(...developStore.posts);
  posts.push(...developStore.posts);
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
