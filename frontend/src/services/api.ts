import axios from 'axios'
import { QuizAnswers } from '../context/StoryContext'

// 本番環境ではVITE_API_BASE_URL環境変数、開発環境ではプロキシ経由
export const API_BASE_URL = import.meta.env.MODE === 'production'
  ? (import.meta.env.VITE_API_BASE_URL || 'https://your-backend-url.run.app')
  : (import.meta.env.VITE_API_BASE_URL || '/backend')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000 // 2分のタイムアウト（音声生成用）
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

export interface TTSOptions {
  voice?: string
  speed?: number
}

export interface AudioChunkInfo {
  chunk_id: number
  length: number
  preview: string
}

export interface AudioChunksResponse {
  total_chunks: number
  chunks_info: {
    chunk_id: number
    length: number
    preview: string
  }[]
}

export interface AudioGenerationResponse {
  audioUrl: string
  cached: boolean
  message?: string
}

export interface AudioChunkResponse {
  audioUrl: string
  chunkId: number
  cached: boolean
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
  },

  generateAudio: async (storyId: string, options: TTSOptions = {}): Promise<AudioGenerationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories/${storyId}/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate audio');
      }

      const audioData: AudioGenerationResponse = await response.json();
      return audioData;
    } catch (error) {
      console.error('Audio generation failed:', error);
      throw error;
    }
  },

  getAudioChunksInfo: async (storyId: string): Promise<AudioChunksResponse> => {
    const response = await api.get(`/stories/${storyId}/audio-chunks-info`)
    return response.data
  },

  generateAudioChunk: async (storyId: string, chunkId: number, options: TTSOptions = {}): Promise<AudioChunkResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories/${storyId}/generate-audio-chunk/${chunkId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate audio chunk');
      }

      const chunkData: AudioChunkResponse = await response.json();
      return chunkData;
    } catch (error) {
      console.error('Audio chunk generation failed:', error);
      throw error;
    }
  }
}

export default api