<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="layout">
    <Sidebar class="sidebar" />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style>
#app {
  width: 100%;
  height: 100vh;
}

.layout {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 200px;
  height: 100%;
  background-color: #fff;
}

.main-content {
  flex: 1;
  margin: 20px;
  background-color: #ffffff;
}
</style>
