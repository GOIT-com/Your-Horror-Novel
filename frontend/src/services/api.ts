import axios from 'axios'
import { QuizAnswers } from '../context/StoryContext'

// 本番環境ではVITE_API_BASE_URL環境変数、開発環境ではプロキシ経由
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? (import.meta.env.VITE_API_BASE_URL || 'https://your-backend-url.run.app')
  : (import.meta.env.VITE_API_BASE_URL || '/backend')

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

export interface CompleteStoryResponse {
  message: string
  novel: string
}

export interface SendEmailResponse {
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

  completeStory: async (storyId: string): Promise<CompleteStoryResponse> => {
    const response = await api.post(`/stories/${storyId}/complete`)
    return response.data
  },

  sendEmail: async (storyId: string, email: string): Promise<SendEmailResponse> => {
    const response = await api.post(`/stories/${storyId}/send-email`, { email })
    return response.data
  }
}

export default api