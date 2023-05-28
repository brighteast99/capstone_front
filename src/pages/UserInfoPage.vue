<template>
  <v-card class="profile-card">
    <custom-btn v-if="myInfo" class="edit-btn" size="x-small" @click="editInfo">
      <v-icon icon="mdi-pencil" size="x-large"> </v-icon>
      <v-tooltip activator="parent"> 프로필 수정 </v-tooltip>
    </custom-btn>
    <v-container>
      <v-row>
        <v-col cols="auto">
          <v-avatar size="128">
            <v-icon icon="mdi-account-circle" size="128" color="primary">
            </v-icon>
          </v-avatar>
        </v-col>
        <v-col>
          <h1 class="userinfo-name">{{ userInfo.name }}</h1>
          <p class="userinfo-email">{{ userInfo.email }}</p>
          <p class="userinfo-date">{{ userInfo.registerDate }} 가입</p>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
  <v-card class="mt-3">
    <v-tabs v-model="tab" grow color="primary">
      <v-tab value="portfolio">포트폴리오</v-tab>
      <v-tab value="recruits">진행한 프로젝트</v-tab>
      <v-tab value="participations">참여한 프로젝트</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="portfolio">
        <div
          class="text-h4 text-disabled d-flex justify-center align-center py-7"
        >
          포폴어떻게넣지
        </div>
      </v-window-item>
      <v-window-item value="recruits">
        <div
          class="text-h4 text-disabled d-flex justify-center align-center py-7"
        >
          내용어케넣지
        </div>
      </v-window-item>
      <v-window-item value="participations">
        <div
          class="text-h4 text-disabled d-flex justify-center align-center py-7"
        >
          어케넣지
        </div>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup>
import CustomBtn from "@/components/CustomBtn.vue";

import { reactive, ref, computed, defineProps, onBeforeMount } from "vue";
import { apiRequest, API, parseResponse } from "@/modules/Services/API";
import router, { pages } from "@/router";
import { useSystemStore } from "@/store";

// Pinia storage
const systemStore = useSystemStore();

// Data
const userInfo = reactive({
  name: null,
  email: null,
  date_created: null,
  registerDate: computed(() =>
    new Date(userInfo.date_created).toLocaleDateString()
  ),
});
const myInfo = computed(() => props.userId == systemStore.currentUser.id);
const tab = ref(null);

// Props
const props = defineProps({
  userId: String,
});

// Hooks
onBeforeMount(() => {
  apiRequest(API.GetUser, { id: Number(props.userId) }, [
    "name",
    "email",
    "date_created",
  ])
    .then(parseResponse)
    .then((response) => {
      if (!response[API.GetUser]) router.replace({ name: pages.NotFound });

      Object.assign(userInfo, response[API.GetUser]);
    })
    .catch(() => {
      router.replace({ name: pages.ServerError });
    });
});

// Methods
const editInfo = () => {}; // TODO
</script>

<style scoped>
.profile-card {
  margin-top: 40px;
  padding: 1.5em 2em 1.5em 2em;
}

.edit-btn {
  position: absolute;
  padding: 0;
  top: 1em;
  right: 1em;
}

.userinfo-name {
  font-size: 2em;
}

.userinfo-email {
  font-size: 1.2em;
  color: gray;
}

.userinfo-date {
  color: gray;
}
</style>
