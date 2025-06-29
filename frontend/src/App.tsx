import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import QuizPage from './pages/QuizPage'
import ChatPage from './pages/ChatPage'
import CompletionPage from './pages/CompletionPage'
import { StoryProvider } from './context/StoryContext'

function App() {
  return (
    <StoryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/chat/:storyId" element={<ChatPage />} />
          <Route path="/completion/:storyId" element={<CompletionPage />} />
        </Routes>
      </Router>
    </StoryProvider>
  )
}

export default App