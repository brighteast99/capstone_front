<template>
  <v-form style="width: 100%" @submit.prevent>
    <v-row>
      <v-text-field label="아이디"> </v-text-field>
    </v-row>
    <v-row>
      <v-text-field label="이메일"> </v-text-field>
    </v-row>
    <v-row>
      <v-btn block color="primary">비밀번호 변경</v-btn>
    </v-row>
  </v-form>
</template>

<script setup></script>

<style scoped>
.v-text-field {
  margin-bottom: 1rem;
}
</style>
