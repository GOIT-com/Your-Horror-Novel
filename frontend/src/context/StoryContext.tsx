import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface QuizAnswers {
  [key: string]: string
}

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export interface StoryState {
  quizAnswers: QuizAnswers
  storyId: string | null
  chatHistory: ChatMessage[]
  currentTurn: number
  maxTurns: number
  isLoading: boolean
  error: string | null
}

type StoryAction =
  | { type: 'SET_QUIZ_ANSWERS'; payload: QuizAnswers }
  | { type: 'SET_STORY_ID'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INCREMENT_TURN' }
  | { type: 'RESET_STORY' }

const initialState: StoryState = {
  quizAnswers: {},
  storyId: null,
  chatHistory: [],
  currentTurn: 0,
  maxTurns: 10,
  isLoading: false,
  error: null
}

function storyReducer(state: StoryState, action: StoryAction): StoryState {
  switch (action.type) {
    case 'SET_QUIZ_ANSWERS':
      return { ...state, quizAnswers: action.payload }
    case 'SET_STORY_ID':
      return { ...state, storyId: action.payload }
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        chatHistory: [...state.chatHistory, action.payload] 
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'INCREMENT_TURN':
      return { ...state, currentTurn: state.currentTurn + 1 }
    case 'RESET_STORY':
      return initialState
    default:
      return state
  }
}

const StoryContext = createContext<{
  state: StoryState
  dispatch: React.Dispatch<StoryAction>
} | null>(null)

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storyReducer, initialState)

  return (
    <StoryContext.Provider value={{ state, dispatch }}>
      {children}
    </StoryContext.Provider>
  )
}

export function useStory() {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider')
  }
  return context
}