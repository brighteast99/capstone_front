<template>
  <v-card variant="flat" color="background">
    <div class="area">
      <p class="mx-2" style="font-weight: bold; white-space: nowrap">
        공지사항
      </p>

      <custom-btn
        class="announce-title-btn"
        :to="{
          name: 'PostPage',
          params: { boardId: 'announcements', postId: currentAnnounce?.postId },
        }"
      >
        <v-scroll-y-reverse-transition leave-absolute>
          <p v-if="transition" class="announce-title">
            {{ currentAnnounce?.title }}
          </p>
          <p v-else class="announce-title">
            {{ currentAnnounce?.title }}
          </p>
        </v-scroll-y-reverse-transition>
      </custom-btn>

      <v-spacer></v-spacer>
      <custom-btn
        size="small"
        :to="{ name: 'PostListPage', params: { boardId: 'announcements' } }"
      >
        모든 공지 보기
      </custom-btn>
    </div>
  </v-card>
</template>

<script setup>
import CustomBtn from "./CustomBtn.vue";

import { ref, computed, reactive, onMounted, onBeforeUnmount } from "vue";
import { useDevelopStore } from "@/store";

// Pinia storage
const developStore = useDevelopStore();

// Data
const current = ref(0);
const currentAnnounce = computed(() => announcements[current.value]);
const announcements = reactive([]);
let timer;
const CYCLE_INTERVAL = 5000;
const transition = ref(true);

onMounted(() => {
  /**
   * TODO 서버에서 공지 받아오기
   */
  announcements.push(...developStore.announcements);

  timer = setInterval(move, CYCLE_INTERVAL);
});
onBeforeUnmount(() => clearInterval(timer));

// Methods
const move = (amount = 1) => {
  current.value = (current.value + amount) % announcements.length;
  transition.value = !transition.value;
};
</script>

<style scoped>
.area {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
}

.announce-title-btn {
  width: 80%;
}

.announce-title {
  display: block;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: left;
}

.icon {
  margin-right: 5px;
}
</style>
