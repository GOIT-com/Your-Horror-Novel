import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useStory } from '../context/StoryContext'
import { storyApi } from '../services/api'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: radial-gradient(circle at center, rgba(139, 0, 0, 0.2) 0%, rgba(0, 0, 0, 1) 70%);
  position: relative;
`

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="completion-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="2" fill="%23440000" opacity="0.2"/><path d="M5,25 Q15,20 25,25" stroke="%23660000" stroke-width="0.5" fill="none" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23completion-pattern)"/></svg>') repeat;
  opacity: 0.4;
`

const CompletionContainer = styled.div`
  max-width: 800px;
  width: 100%;
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid var(--color-blood);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.5);
  text-align: center;
  position: relative;
  overflow: hidden;
`

const CompletionTitle = styled.h1`
  font-family: var(--font-horror);
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--color-blood);
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
  filter: drop-shadow(0 0 15px var(--color-blood));
  animation: glow 2s infinite alternate;
  
  @keyframes glow {
    from { filter: drop-shadow(0 0 15px var(--color-blood)); }
    to { filter: drop-shadow(0 0 25px var(--color-blood)); }
  }
`

const CompletionMessage = styled.p`
  font-size: 1.3rem;
  color: var(--color-bone);
  margin-bottom: 2rem;
  line-height: 1.6;
  font-style: italic;
`

const StoryPreview = styled.div`
  background: rgba(139, 0, 0, 0.1);
  border: 2px solid var(--color-dark-red);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-dark-grey);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-blood);
    border-radius: 3px;
  }
`

const StoryText = styled.p`
  color: var(--color-bone);
  line-height: 1.8;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const EmailSection = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  border: 1px solid var(--color-grey);
`

const EmailTitle = styled.h3`
  color: var(--color-blood);
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-family: var(--font-horror);
`

const EmailDescription = styled.p`
  color: var(--color-bone);
  margin-bottom: 1.5rem;
  font-size: 1rem;
`

const EmailForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 600px) {
    flex-direction: row;
    align-items: flex-end;
  }
`

const EmailInput = styled.input`
  flex: 1;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--color-grey);
  color: var(--color-bone);
  padding: 12px 16px;
  font-family: var(--font-body);
  font-size: 16px;
  border-radius: 8px;
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

const SendEmailButton = styled.button`
  background: linear-gradient(145deg, var(--color-blood), var(--color-dark-red));
  border: 2px solid var(--color-blood);
  color: var(--color-bone);
  padding: 12px 24px;
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: 8px;
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

const SuccessMessage = styled.div`
  background: linear-gradient(145deg, var(--color-blood), var(--color-dark-red));
  color: var(--color-bone);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-weight: 600;
  border: 2px solid var(--color-blood);
  animation: slideIn 0.5s ease;
`

const FinalMessage = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(139, 0, 0, 0.2);
  border: 2px solid var(--color-blood);
  border-radius: 8px;
  text-align: center;
`

const FinalTitle = styled.h3`
  font-family: var(--font-horror);
  color: var(--color-blood);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  animation: flicker 2s infinite;
  
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`

const FinalText = styled.p`
  color: var(--color-bone);
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
`

function CompletionPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { storyId } = useParams<{ storyId: string }>()
  const { state } = useStory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !storyId || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      await storyApi.finishStory(storyId, email.trim())
      setIsSubmitted(true)
    } catch (error) {
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create a preview of the story from chat history
  const storyPreview = state.chatHistory
    .map(msg => msg.content)
    .join('\n\n')
    .substring(0, 500) + '...'

  return (
    <Container>
      <Background />
      <CompletionContainer>
        <CompletionTitle>🎭 物語完成</CompletionTitle>
        <CompletionMessage>
          あなたとAIが紡いだ、世界でただ一つの恐怖の物語が完成しました。
        </CompletionMessage>
        
        <StoryPreview>
          <StoryText>{storyPreview}</StoryText>
        </StoryPreview>
        
        {!isSubmitted ? (
          <EmailSection>
            <EmailTitle>📧 PDF受け取り</EmailTitle>
            <EmailDescription>
              この物語をPDFで保存し、メールでお送りします。
            </EmailDescription>
            <EmailForm onSubmit={handleSubmit}>
              <EmailInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
                disabled={isSubmitting}
              />
              <SendEmailButton type="submit" disabled={!email.trim() || isSubmitting}>
                {isSubmitting ? '送信中...' : 'PDFをメールで受け取る'}
              </SendEmailButton>
            </EmailForm>
          </EmailSection>
        ) : (
          <SuccessMessage>
            ✅ PDFをメールで送信しました。受信トレイをご確認ください。
          </SuccessMessage>
        )}
        
        {isSubmitted && (
          <FinalMessage>
            <FinalTitle>⚠️ 警告 ⚠️</FinalTitle>
            <FinalText>
              あなたは開けてはならないパンドラの箱を開けてしまった。<br />
              この恐怖の体験は一度きり...<br />
              二度と、この扉を開くことはできない。<br />
              <strong>永遠に！！</strong>
            </FinalText>
          </FinalMessage>
        )}
      </CompletionContainer>
    </Container>
  )
}

export default CompletionPage