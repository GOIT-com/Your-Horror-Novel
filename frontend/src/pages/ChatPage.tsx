import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useStory } from '../context/StoryContext'
import { storyApi } from '../services/api'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--color-black) 0%, var(--color-dark-grey) 100%);
  position: relative;
`

const BackgroundTexture = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="horror-texture" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M25,5 Q30,10 25,15 Q20,10 25,5" fill="%23220000" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23horror-texture)"/></svg>') repeat;
  opacity: 0.3;
  pointer-events: none;
`

const Header = styled.div`
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 2px solid var(--color-blood);
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`

const TurnCounter = styled.div`
  color: var(--color-bone);
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
`

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-dark-grey);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-blood);
    border-radius: 4px;
  }
`

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser 
    ? 'linear-gradient(145deg, var(--color-blood), var(--color-dark-red))'
    : 'rgba(0, 0, 0, 0.7)'
  };
  border: 2px solid ${props => props.isUser ? 'var(--color-blood)' : 'var(--color-grey)'};
  color: var(--color-bone);
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const MessageHeader = styled.div<{ isUser: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.isUser ? 'var(--color-bone)' : 'var(--color-blood)'};
  margin-bottom: 0.5rem;
  font-weight: 600;
  opacity: 0.8;
`

const InputContainer = styled.div`
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.9);
  border-top: 2px solid var(--color-blood);
  display: flex;
  gap: 1rem;
  align-items: flex-end;
`

const MessageInput = styled.textarea`
  flex: 1;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--color-grey);
  color: var(--color-bone);
  padding: 12px 16px;
  font-family: var(--font-body);
  font-size: 16px;
  border-radius: 12px;
  resize: none;
  min-height: 50px;
  max-height: 120px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-blood);
    box-shadow: 0 0 10px rgba(139, 0, 0, 0.3);
  }
  
  &::placeholder {
    color: var(--color-light-grey);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SendButton = styled.button`
  background: linear-gradient(145deg, var(--color-blood), var(--color-dark-red));
  border: 2px solid var(--color-blood);
  color: var(--color-bone);
  padding: 12px 24px;
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: linear-gradient(145deg, var(--color-dark-red), var(--color-blood));
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const LoadingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 1rem 1.5rem;
  align-self: flex-start;
  
  .dot {
    width: 8px;
    height: 8px;
    background: var(--color-blood);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    } 40% {
      transform: scale(1);
    }
  }
`

const CompletionMessage = styled.div`
  background: linear-gradient(145deg, var(--color-blood), var(--color-dark-red));
  color: var(--color-bone);
  padding: 1.5rem;
  margin: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  border: 2px solid var(--color-blood);
  box-shadow: var(--shadow-glow);
`

const FinishButton = styled.button`
  background: linear-gradient(145deg, var(--color-blood), var(--color-dark-red));
  border: 2px solid var(--color-blood);
  color: var(--color-bone);
  padding: 12px 24px;
  font-family: var(--font-horror);
  font-size: 1.1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem 2rem;
  
  &:hover {
    background: linear-gradient(145deg, var(--color-dark-red), var(--color-blood));
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }
`

function ChatPage() {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { storyId } = useParams<{ storyId: string }>()
  const { state, dispatch } = useStory()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.chatHistory, isTyping])

  const handleSend = async () => {
    if (!message.trim() || !storyId || isTyping) return

    const userMessage = message.trim()
    setMessage('')
    setIsTyping(true)

    // Add user message to chat history
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', content: userMessage } })
    dispatch({ type: 'INCREMENT_TURN' })

    try {
      const response = await storyApi.sendMessage(storyId, userMessage)
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'model', content: response.reply } })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'メッセージの送信に失敗しました。' })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFinish = () => {
    if (storyId) {
      navigate(`/completion/${storyId}`)
    }
  }

  const isStoryComplete = state.currentTurn >= state.maxTurns

  return (
    <Container>
      <BackgroundTexture />
      <Header>
        <TurnCounter>
          {isStoryComplete ? '物語完成' : `ターン ${state.currentTurn} / ${state.maxTurns}`}
        </TurnCounter>
      </Header>
      
      <ChatContainer>
        <MessagesContainer>
          {state.chatHistory.map((msg, index) => (
            <MessageBubble key={index} isUser={msg.role === 'user'}>
              <MessageHeader isUser={msg.role === 'user'}>
                {msg.role === 'user' ? 'あなた' : '語り部'}
              </MessageHeader>
              {msg.content}
            </MessageBubble>
          ))}
          
          {isTyping && (
            <LoadingIndicator>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </LoadingIndicator>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>
        
        {isStoryComplete && (
          <>
            <CompletionMessage>
              🎭 あなたの物語が完成しました！
            </CompletionMessage>
            <FinishButton onClick={handleFinish}>
              物語を受け取る
            </FinishButton>
          </>
        )}
        
        {!isStoryComplete && (
          <InputContainer>
            <MessageInput
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="行動やセリフを入力..."
              disabled={isTyping}
              rows={1}
            />
            <SendButton 
              onClick={handleSend} 
              disabled={!message.trim() || isTyping}
            >
              送信
            </SendButton>
          </InputContainer>
        )}
      </ChatContainer>
    </Container>
  )
}

export default ChatPage