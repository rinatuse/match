<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const store = useGameStore()

// Если кто-то зашел по прямой ссылке без логина
if (!store.currentUser) {
  router.push('/')
}

const goBack = () => {
  router.push('/game')
}
</script>

<template>
  <div class="gift-container">
    <div class="video-card">
      <h2>Это для тебя! ✨</h2>
      
      <div class="video-wrapper">
        <video 
          controls 
          autoplay
          playsinline
          class="main-video"
        >
          <source src="/march.MP4" type="video/mp4">
          Ваш браузер не поддерживает видео.
        </video>
      </div>

      <p class="congrats-text">
        Пусть этот день будет полон улыбок и радости! 🌸
      </p>
      
      <button @click="goBack" class="back-btn">Вернуться к хомяку 🐹</button>
    </div>
  </div>
</template>

<style scoped>
.gift-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  background-color: #fdf5f6;
  padding: 20px;
}

.video-card {
  background: white;
  padding: 20px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;
}

h2 { color: #e91e63; margin-bottom: 20px; }

.video-wrapper {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.main-video {
  width: 100%;
  display: block;
}

.congrats-text {
  margin: 20px 0;
  font-size: 16px;
  line-height: 1.5;
  color: #555;
}

.back-btn {
  background: transparent;
  border: 2px solid #ff4081;
  color: #ff4081;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  width: 100%;
}

.back-btn:hover {
  background: #ff4081;
  color: white;
}
</style>