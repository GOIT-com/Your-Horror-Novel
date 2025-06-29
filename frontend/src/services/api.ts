import axios from 'axios'
import { QuizAnswers } from '../context/StoryContext'

// 環境変数からAPIベースURLを取得、デフォルトはプロキシ経由
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/backend'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface StartStoryResponse {
  storyId: string
  initialMessage: string
}

export interface ChatResponse {
  reply: string
}

export interface FinishStoryResponse {
  message: string
}

export const storyApi = {
  startStory: async (quizAnswers: QuizAnswers): Promise<StartStoryResponse> => {
    const response = await api.post('/stories', { quizAnswers })
    return response.data
  },

  sendMessage: async (storyId: string, message: string): Promise<ChatResponse> => {
    const response = await api.post(`/stories/${storyId}/chat`, { message })
    return response.data
  },

  finishStory: async (storyId: string, email: string): Promise<FinishStoryResponse> => {
    const response = await api.post(`/stories/${storyId}/finish`, { email })
    return response.data
  }
}

export default api