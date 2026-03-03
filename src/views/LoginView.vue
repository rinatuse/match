<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { usersData } from '../data/users'

const router = useRouter()
const store = useGameStore()

const inputLogin = ref('')
const inputPassword = ref('')
const errorMessage = ref('')

const handleLogin = () => {
  const user = usersData.find(
    (u) => u.login === inputLogin.value.toLowerCase() && u.password === inputPassword.value
  )

  if (user) {
    errorMessage.value = ''
    // ВМЕСТО store.currentUser = user и store.nextRound() пишем это:
    store.initGame(user) 
    router.push('/game')
  } else {
    errorMessage.value = 'Неверный логин или пароль 🥲'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>С 8 Марта! 🌷</h1>
      <p>Введите свой секретный логин и пароль</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <input 
          v-model="inputLogin" 
          type="text" 
          placeholder="Логин" 
          required 
        />
        <input 
          v-model="inputPassword" 
          type="password" 
          placeholder="Пароль" 
          required 
        />
        
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        
        <button type="submit">Войти</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Простые стили для мобилки и десктопа */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #fce4ec; /* Нежно-розовый фон */
  font-family: sans-serif;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

input {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}

button {
  padding: 12px;
  background-color: #e91e63;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #d81b60;
}

.error {
  color: #d32f2f;
  margin: 0;
  font-size: 14px;
}
</style>