<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { Vue3Lottie } from 'vue3-lottie'
import confetti from 'canvas-confetti'

// Ассеты анимаций
import hamsterNormal from '../assets/hamster.json'
import hamsterWin from '../assets/hamster_win.json'
import hamsterSad from '../assets/hamster_sad.json'

const router = useRouter()
const store = useGameStore()

const isGameStarted = ref(false)
const isHappy = ref(false)
const isSad = ref(false)

if (!store.currentUser) {
  router.push('/')
}

// 1. ФИНАЛЬНЫЙ МЕГА-САЛЮТ
const launchMegaConfetti = () => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

// 2. МИНИ-ВЗРЫВ СЕРДЕЧЕК (Срабатывает на каждый правильный ответ)
const popHearts = () => {
  // @ts-ignore - игнорируем TS, если типы confetti немного отстают от версии библиотеки
  const heart = confetti.shapeFromText ? confetti.shapeFromText({ text: '❤️' }) : null;

  confetti({
    particleCount: 15, // Количество сердечек
    spread: 80, // Угол разлета
    origin: { y: 0.6 }, // Координата Y (0.6 - это чуть ниже центра, прямо из карточки)
    colors: ['#ff4081', '#ff5252', '#e91e63'], // Цвета на случай, если эмодзи не сработают
    shapes: heart ? [heart] : ['circle'], // Если поддерживается текст, летят ❤️, иначе розовые кружки
    scalar: 2, // Размер
    ticks: 50, // Длительность полета
    startVelocity: 25, // Сила "взрыва"
    disableForReducedMotion: true
  });
}

// Реакция маскота на ответы
watch(() => store.mood, (newVal, oldVal) => {
  if (newVal > oldVal) {
    isHappy.value = true
    isSad.value = false 
    setTimeout(() => { isHappy.value = false }, 3000)
    
    // Если настроение не 100% — пускаем сердечки из карточки
    if (Math.round(newVal) < 100) {
      popHearts()
    } 
    // Если 100% — бахаем главный салют
    else {
      launchMegaConfetti()
    }
  }
})

// Реакция на ошибку
watch(() => store.isError, (errorActive) => {
  if (errorActive) {
    isSad.value = true
    isHappy.value = false 
    setTimeout(() => { isSad.value = false }, 2000)
  }
})

// Выбор анимации
const currentAnimation = computed(() => {
  if (store.isGameWon || isHappy.value) return hamsterWin
  if (isSad.value) return hamsterSad
  return hamsterNormal
})

const handleAnswer = (name: string) => {
  if (store.isError || store.isGameWon) return
  store.checkAnswer(name)
}

const goToGift = () => {
  router.push('/gift')
}
</script>

<template>
  <div class="game-container" v-if="store.currentUser">
    
    <div class="mascot-section">
      <div class="lottie-container" :class="{ 'shake': isSad, 'bounce': isHappy }">
        <Vue3Lottie
          :animationData="currentAnimation"
          :height="160"
          :width="160"
          :loop="true"
          :autoPlay="true"
          :key="isSad ? 'sad' : (isHappy || store.isGameWon ? 'happy' : 'normal')"
        />
      </div>
      
      <div class="progress-bg">
        <div class="progress-fill" :style="{ width: store.mood + '%' }"></div>
      </div>
      <p class="mood-text">Настроение: {{ Math.round(store.mood) }}%</p>
    </div>

    <Transition name="fade-slide" mode="out-in">
      
      <div v-if="!isGameStarted" key="intro" class="state-container">
        <div class="intro-container">
          <h2>Привет, {{ store.currentUser.name }}! 👋</h2>
          <p class="intro-text">
            Чтобы открыть праздничное поздравление, нужно поднять настроение нашему хомяку до 100%.
          </p>
          <p class="intro-text">
            Угадай <b>8 историй</b> о коллегах, и маскот будет счастлив!
          </p>
          <button @click="isGameStarted = true" class="start-btn">Я готова! 🚀</button>
        </div>
      </div>

      <div v-else-if="!store.isGameWon" key="game" class="state-container game-state">
        <div class="card-container">
          <div class="question-card" :class="{ 'shake-error': store.isError }">
            <h3>Чья это история?</h3>
            <p class="fact-text">"{{ store.currentFact }}"</p>
            <p v-if="store.isError" class="error-msg">Ой, это не она! Попробуй еще?</p>
          </div>
        </div>

        <div class="options-grid">
          <button 
            v-for="option in store.currentOptions" 
            :key="option"
            @click="handleAnswer(option)"
            :disabled="store.isError"
            class="option-btn"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <div v-else key="victory" class="state-container">
        <div class="victory-container">
          <h2 class="congrats-title">От мужского коллектива поздравляем! 🎉💐</h2>
          
          <div class="personal-msg-box" v-if="store.currentUser.personalMessage">
            <p>"{{ store.currentUser.personalMessage }}"</p>
          </div>
          
          <p class="victory-text">Настроение на максимуме! Ты отлично знаешь команду.</p>
          <button @click="goToGift" class="video-btn">Смотреть видео 🎬</button>
        </div>
      </div>
      
    </Transition>

  </div>
</template>

<style scoped>
.personal-msg-box { background: linear-gradient(135deg, #fff5f8 0%, #ffe4f0 100%); border-radius: 16px; padding: 18px 22px; margin: 15px 0 25px; box-shadow: 0 6px 15px rgba(233, 30, 99, 0.08); border: 1px solid #ffd1df; position: relative; }
.personal-msg-box::before { content: '🌸'; position: absolute; top: -10px; left: 15px; font-size: 20px; }
.personal-msg-box p { color: #e91e63; font-style: italic; font-weight: 700; line-height: 1.6; font-size: 16px; text-align: center; margin: 0; }
.congrats-title { color: #e91e63 !important; font-size: 20px !important; margin-bottom: 5px !important; line-height: 1.3 !important; }
.victory-text { font-size: 15px; color: #666; margin-bottom: 20px; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.5s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-20px); }

.state-container { width: 100%; display: flex; flex-direction: column; align-items: center; flex-grow: 1; }
.game-state { justify-content: space-between; }

.option-btn, .start-btn, .video-btn { cursor: pointer !important; transition: all 0.2s ease; touch-action: manipulation; }
@media (hover: hover) {
  .option-btn:hover:not(:disabled) { background: #fff0f5; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(255, 82, 82, 0.1); }
  .start-btn:hover, .video-btn:hover { opacity: 0.95; box-shadow: 0 6px 15px rgba(233, 30, 99, 0.2); transform: translateY(-2px); }
}
.start-btn:active, .video-btn:active, .option-btn:active:not(:disabled) { transform: scale(0.98); }

.game-container { display: flex; flex-direction: column; height: 100vh; height: 100dvh; width: 100%; background-color: #fdf5f6; font-family: 'Nunito', sans-serif; padding: 15px; max-width: 500px; margin: 0 auto; overflow: hidden; position: relative; }
.mascot-section { text-align: center; margin-bottom: 20px; flex-shrink: 0; }
.lottie-container { display: flex; justify-content: center; min-height: 160px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05)); }
.progress-bg { background: #e0e0e0; border-radius: 20px; height: 18px; width: 100%; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.08); }
.progress-fill { background: linear-gradient(90deg, #ff8a65, #ff4081); height: 100%; transition: width 0.4s ease-out; }
.mood-text { font-weight: 700; color: #777; margin-top: 8px; font-size: 14px; }

.intro-container, .victory-container { flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; padding: 25px 20px; border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.05); text-align: center; margin: 10px 0; border: 1px solid rgba(255, 192, 203, 0.3); }
.intro-container h2, .victory-container h2 { color: #d81b60; font-size: 22px; margin-bottom: 15px; }
.intro-text { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 12px; }

.card-container { flex-grow: 1; display: flex; align-items: center; z-index: 10; }
.question-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); text-align: center; width: 100%; border: 1px solid rgba(255, 192, 203, 0.2); }
.question-card h3 { color: #888; font-size: 16px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.fact-text { font-size: 17px; font-style: italic; color: #333; margin: 15px 0; font-weight: 500; line-height: 1.4; }

.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-bottom: 20px; width: 100%; z-index: 10; }
.option-btn { background: #fff; border: 2px solid #ff5252; color: #ff5252; padding: 14px 5px; border-radius: 12px; font-size: 15px; font-weight: bold; }
.start-btn, .video-btn { background: linear-gradient(45deg, #e91e63, #ff4081); color: white; border: none; padding: 16px 32px; border-radius: 30px; font-size: 17px; font-weight: bold; }
.error-msg { color: #f44336; font-weight: bold; margin-top: 10px; font-size: 14px; }

@keyframes smallShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
.shake { animation: smallShake 0.3s infinite; }
.shake-error { animation: smallShake 0.3s; border: 2px solid #ff5252; }
.bounce { animation: bounce 0.6s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
</style>