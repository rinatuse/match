import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { factsData, allNames, type GirlFact } from '../data/girls'
import { type User } from '../data/users'

export const useGameStore = defineStore('game', () => {
  const currentUser = ref<User | null>(null)
  const mood = ref<number>(0)
  const currentFact = ref<string>('')
  const currentOptions = ref<string[]>([])
  const correctAnswer = ref<string>('')
  const isError = ref<boolean>(false)
  const availableFacts = ref<GirlFact[]>([])

  const savedState = localStorage.getItem('sharkSmileState')
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState)
      currentUser.value = parsed.currentUser
      mood.value = parsed.mood
      currentFact.value = parsed.currentFact
      currentOptions.value = parsed.currentOptions
      correctAnswer.value = parsed.correctAnswer
      availableFacts.value = parsed.availableFacts
    } catch (e) {
      console.error("Ошибка при чтении сохранений:", e)
    }
  }

  watch(
    [currentUser, mood, currentFact, currentOptions, correctAnswer, availableFacts],
    () => {
      const stateToSave = {
        currentUser: currentUser.value,
        mood: mood.value,
        currentFact: currentFact.value,
        currentOptions: currentOptions.value,
        correctAnswer: correctAnswer.value,
        availableFacts: availableFacts.value
      }
      localStorage.setItem('sharkSmileState', JSON.stringify(stateToSave))
    },
    { deep: true }
  )

  // ИСПРАВЛЕНО: Добавлены "!" для утверждения, что элементы существуют
  const shuffleArray = <T>(array: T[]): T[] => {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j]!, newArr[i]!]
    }
    return newArr
  }

  const initGame = (user: User) => {
    currentUser.value = user
    mood.value = 0
    const filteredFacts = factsData.filter(item => item.name !== user.name)
    availableFacts.value = shuffleArray(filteredFacts) 
    nextRound()
  }

  // ИСПРАВЛЕНО: Добавлена проверка randomName на undefined
  const getRandomOptions = (correctName: string): string[] => {
    const options = new Set<string>([correctName])
    while (options.size < 4) {
      const randomName = allNames[Math.floor(Math.random() * allNames.length)]
      if (randomName) {
        options.add(randomName)
      }
    }
    return Array.from(options).sort(() => Math.random() - 0.5)
  }

  const nextRound = (): void => {
    isError.value = false
    const item = availableFacts.value.pop()
    if (item) {
      currentFact.value = item.fact
      correctAnswer.value = item.name
      currentOptions.value = getRandomOptions(item.name)
    }
  }

  const checkAnswer = (selectedName: string): void => {
    if (selectedName === correctAnswer.value) {
      mood.value += 12.5
      if (mood.value < 100) {
        nextRound()
      }
    } else {
      isError.value = true
      setTimeout(() => { isError.value = false }, 1500)
    }
  }

  const isGameWon = computed<boolean>(() => Math.round(mood.value) >= 100)

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('sharkSmileState')
  }

  return {
    currentUser, mood, currentFact, currentOptions, availableFacts,
    isError, isGameWon, initGame, nextRound, checkAnswer, logout
  }
})
