<template>
  <v-app>
    <!-- header -->
    <page-header v-show="interfaceStore.displayUI"></page-header>
    <!-- Main -->
    <custom-dialog></custom-dialog>
    <v-main
      :style="{
        marginTop: (interfaceStore.displayUI ? '72' : '0') + 'px',
        position: 'relative',
      }"
    >
      <v-container class="pa-0" fluid style="max-width: 1024px">
        <router-view :key="$route.fullPath"> </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>
<script setup>
import PageHeader from "@/components/PageHeader.vue";
import { useInterfaceStore } from "@/store";
import CustomDialog from "./components/CustomDialog.vue";

const interfaceStore = useInterfaceStore();
</script>
