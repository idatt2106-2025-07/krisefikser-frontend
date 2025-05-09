<script setup lang="ts"></script>

<template>
  <div class="back-button-wrapper">
    <button @click="$router.back()" class="back-button__btn">
      <span class="back-button__text">Back</span>
    </button>
  </div>
</template>

<style scoped>
.back-button__btn {
  position: absolute;
  top: 20px;
  left: 40px;
  z-index: 10;
  background-color: white;
  border-radius: 50px;
}
</style>
