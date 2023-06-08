<template>
  <!-- Banner -->
  <main-banner
    :height="BANNER_HEIGHT"
    :images="bannerImages"
    style="position: absolute; left: 0; top: 0"
  >
  </main-banner>

  <v-card
    class="rounded-0"
    elevation="0"
    :style="{ marginTop: BANNER_HEIGHT + 'px' }"
  >
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <!-- Announcements -->
          <announcement-card></announcement-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <thread-list-mini
            board-name="최신 프로젝트"
            board-desc="따끈따끈한 프로젝트들을 만나보세요"
            board-id="Latest"
            :items="newThreads"
            elevation="0"
          ></thread-list-mini>
        </v-col>
        <v-col cols="6">
          <thread-list-mini
            board-name="인기 프로젝트"
            board-desc="지금 떠오르는 프로젝트들은?"
            board-id="Trending"
            :items="trendingThreads"
            elevation="0"
          ></thread-list-mini>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import MainBanner from "@/components/MainBanner.vue";
import AnnouncementCard from "@/components/AnnouncementCard.vue";
import ThreadListMini from "@/components/ThreadListMini.vue";

import { reactive, onBeforeMount } from "vue";
import { useDevelopStore } from "@/store";

// Style
const BANNER_HEIGHT = 360;

// Pinia Storage
const developStore = useDevelopStore();

// Data
const bannerImages = reactive([]);
const newThreads = reactive([]);
const trendingThreads = reactive([]);

// Hook
onBeforeMount(() => {
  // 나중에는 서버에서 이미지 받아오기?
  bannerImages.push(
    require("@/assets/Banner_Main.png"),
    require("@/assets/Banner_1.png")
    // "https://picsum.photos/1920/360.webp?random=1",
  );

  newThreads.push(...developStore.newThreads);
  trendingThreads.push(...developStore.trendingThreads);
});
</script>
