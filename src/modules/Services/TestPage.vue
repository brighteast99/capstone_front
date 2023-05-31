<template>
  <v-text-field :model-value="output" disabled> </v-text-field>
</template>

<script setup>
import { computed } from "vue";
import { API, apiRequest } from "./API";

const output = computed(() =>
  new apiRequest().push(API.GetPost, { id: 123 }, ["id"]).test()
);
</script>
