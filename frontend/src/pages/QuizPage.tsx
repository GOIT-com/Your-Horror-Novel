import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useStory } from '../context/StoryContext'
import { quizQuestions } from '../data/quizQuestions'
import { storyApi } from '../services/api'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--color-black) 0%, var(--color-dark-grey) 100%);
`

const QuizContainer = styled.div`
  max-width: 800px;
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--color-blood);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-glow);
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--color-dark-grey);
  border-radius: 4px;
  margin-bottom: 2rem;
  overflow: hidden;
`

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, var(--color-blood), var(--color-dark-red));
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px var(--color-blood);
`

const ProgressText = styled.p`
  text-align: center;
  color: var(--color-bone);
  margin-bottom: 1rem;
  font-size: 1.1rem;
`

const Question = styled.h2`
  font-size: 1.5rem;
  color: var(--color-bone);
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.4;
`

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`

const OptionButton = styled.button<{ selected: boolean }>`
  background: ${props => props.selected 
    ? 'linear-gradient(145deg, var(--color-blood), var(--color-dark-red))'
    : 'rgba(0, 0, 0, 0.5)'
  };
  border: 2px solid ${props => props.selected ? 'var(--color-blood)' : 'var(--color-grey)'};
  color: var(--color-bone);
  padding: 1rem;
  font-family: var(--font-body);
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    border-color: var(--color-blood);
    background: ${props => props.selected 
      ? 'linear-gradient(145deg, var(--color-dark-red), var(--color-blood))'
      : 'rgba(139, 0, 0, 0.2)'
    };
  }
`

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BackButton = styled.button`
  background: transparent;
  border: 2px solid var(--color-grey);
  color: var(--color-bone);
  padding: 10px 20px;
  font-family: var(--font-body);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--color-blood);
    background: rgba(139, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const NextButton = styled.button`
  background: linear-gradient(145deg, var(--color-blood), var(--color-dark-red));
  border: 2px solid var(--color-blood);
  color: var(--color-bone);
  padding: 10px 20px;
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(145deg, var(--color-dark-red), var(--color-blood));
    box-shadow: var(--shadow-glow);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const LoadingText = styled.p`
  color: var(--color-bone);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  animation: pulse 1.5s infinite;
`

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid var(--color-grey);
  border-top: 3px solid var(--color-blood);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const { state, dispatch } = useStory()
  const navigate = useNavigate()

  const handleOptionSelect = (value: string) => {
    const questionId = quizQuestions[currentQuestion].id
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // All questions answered, start the story
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_QUIZ_ANSWERS', payload: answers })
      
      try {
        const response = await storyApi.startStory(answers)
        dispatch({ type: 'SET_STORY_ID', payload: response.storyId })
        dispatch({ type: 'ADD_MESSAGE', payload: { role: 'model', content: response.initialMessage } })
        dispatch({ type: 'SET_LOADING', payload: false })
        navigate(`/chat/${response.storyId}`)
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'エラーが発生しました。もう一度お試しください。' })
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100
  const currentQuestionData = quizQuestions[currentQuestion]
  const selectedAnswer = answers[currentQuestionData.id]

  return (
    <>
      <Container>
        <QuizContainer>
          <ProgressText>質問 {currentQuestion + 1} / {quizQuestions.length}</ProgressText>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
          
          <Question>{currentQuestionData.question}</Question>
          
          <OptionsContainer>
            {currentQuestionData.options.map((option) => (
              <OptionButton
                key={option.value}
                selected={selectedAnswer === option.value}
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.text}
              </OptionButton>
            ))}
          </OptionsContainer>
          
          <NavigationContainer>
            <BackButton 
              onClick={handleBack} 
              disabled={currentQuestion === 0}
            >
              戻る
            </BackButton>
            <NextButton 
              onClick={handleNext} 
              disabled={!selectedAnswer}
            >
              {currentQuestion === quizQuestions.length - 1 ? '物語を始める' : '次へ'}
            </NextButton>
          </NavigationContainer>
        </QuizContainer>
      </Container>
      
      {state.isLoading && (
        <LoadingOverlay>
          <LoadingText>あなたの恐怖を分析中...</LoadingText>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
    </>
  )
}

export default QuizPage