import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import QuizPage from './pages/QuizPage'
import ChatPage from './pages/ChatPage'
import CompletionPage from './pages/CompletionPage'
import { StoryProvider } from './context/StoryContext'
import { FontProvider } from './context/FontContext'
import FontSwitcher from './components/FontSwitcher'

function App() {
  return (
    <FontProvider>
      <StoryProvider>
        <Router>
          <FontSwitcher />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/chat/:storyId" element={<ChatPage />} />
            <Route path="/completion/:storyId" element={<CompletionPage />} />
          </Routes>
        </Router>
      </StoryProvider>
    </FontProvider>
  )
}

export default App