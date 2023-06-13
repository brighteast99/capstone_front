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
            board-desc="새로 등록된 프로젝트"
            :board-id="4"
            :items="newThreads"
            :loading="isLoading"
            :error="isError"
            elevation="0"
          ></thread-list-mini>
        </v-col>
        <v-col cols="6">
          <thread-list-mini
            board-name="인기 프로젝트"
            board-desc="지금 떠오르는 프로젝트"
            :board-id="4"
            :items="trendingThreads"
            :loading="isLoading"
            :error="isError"
            :showLikes="true"
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

import { reactive, computed, onBeforeMount } from "vue";
import { API, parseResponse, useAPI } from "@/modules/Services/API";
import { constructQuery } from "@/modules/Services/queryBuilder";

// Style
const BANNER_HEIGHT = 360;

// Data
const bannerImages = reactive([]);
const threads = reactive([]);
const newThreads = computed(() =>
  threads.toSorted((a, b) => b.date_created.localeCompare(a.date_created))
);
const trendingThreads = computed(() =>
  threads.toSorted((a, b) => b.likes - a.likes)
);

// Hook
onBeforeMount(() => {
  // 나중에는 서버에서 이미지 받아오기?
  bannerImages.push(
    require("@/assets/Banner_Main.png")
    // "https://picsum.photos/1920/360.webp?random=1",
  );
  fetchThreads();
});

const { isLoading, isError, execute } = useAPI();
const fetchThreads = () => {
  execute(
    constructQuery({
      name: API.GetBoard,
      args: { id: 4 },
      fields: [
        {
          thread_set: [
            "id",
            { board: "id" },
            { user: ["id", "name"] },
            "title",
            "date_created",
            "is_deleted",
            "views",
            "likes",
            "favorites",
            { commentforthread_set: ["is_deleted", { replies: "is_deleted" }] },
          ],
        },
      ],
    })
  )
    .then(parseResponse)
    .then((response) =>
      threads.splice(
        0,
        threads.length,
        ...response[API.GetBoard].thread_set.filter(
          (thread) => !thread.is_deleted
        )
      )
    );
};
</script>
