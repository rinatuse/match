import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import GameView from '../views/GameView.vue'
import GiftView from '../views/GiftView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/game',
      name: 'game',
      component: GameView
    },
    {
      path: '/gift',
      name: 'gift',
      component: GiftView
    }
  ]
})

export default router