import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useStory } from '../context/StoryContext'
import { storyApi, TTSOptions, AudioChunksResponse, API_BASE_URL } from '../services/api'

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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
`

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid var(--color-dark-grey);
  border-top: 4px solid var(--color-blood);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
  margin-bottom: 2rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const LoadingTitle = styled.h2`
  font-family: var(--font-horror);
  color: var(--color-blood);
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`

const LoadingText = styled.p`
  color: var(--color-bone);
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 600px;
`

const AudioSection = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(139, 0, 0, 0.1);
  border: 2px solid var(--color-dark-red);
  border-radius: 8px;
`

const AudioGenerationProgress = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-blood);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
`

const AudioProgressText = styled.p`
  color: var(--color-bone);
  font-size: 1rem;
  margin: 0.5rem 0;
  line-height: 1.5;
`

const AudioProgressSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-dark-grey);
  border-top: 2px solid var(--color-blood);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const AudioTitle = styled.h3`
  color: var(--color-blood);
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-family: var(--font-horror);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const AudioControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
`

const AudioButton = styled.button`
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
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

const AudioSlider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--color-dark-grey);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-blood);
    cursor: pointer;
    border: 2px solid var(--color-bone);
    box-shadow: 0 0 5px rgba(139, 0, 0, 0.5);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-blood);
    cursor: pointer;
    border: 2px solid var(--color-bone);
    box-shadow: 0 0 5px rgba(139, 0, 0, 0.5);
  }
`

const AudioControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 767px) {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  
  @media (min-width: 768px) {
    gap: 0.3rem;
  }
`

const AudioLabel = styled.label`
  color: var(--color-bone);
  font-size: 0.9rem;
  min-width: 40px;
  white-space: nowrap;
  
  @media (max-width: 767px) {
    min-width: auto;
    text-align: center;
  }
  
  @media (min-width: 768px) {
    min-width: 35px; /* PCでより狭く */
    font-size: 0.8rem;
  }
`

const AudioProgressContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const AudioProgress = styled.div`
  flex: 1;
  height: 8px;
  background: var(--color-dark-grey);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`

const AudioProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, var(--color-blood), var(--color-dark-red));
  width: ${props => props.progress}%;
  transition: width 0.1s ease;
`

const AudioTime = styled.span`
  color: var(--color-bone);
  font-size: 0.8rem;
  min-width: 40px;
  text-align: center;
`

const CacheIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(0, 100, 0, 0.2);
  border: 1px solid #006600;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--color-bone);
`

function CompletionPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const { state, dispatch } = useStory()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [completedNovel, setCompletedNovel] = useState('')
  
  // Audio related states
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isGeneratingChunks, setIsGeneratingChunks] = useState(false)
  const [chunksInfo, setChunksInfo] = useState<AudioChunksResponse | null>(null)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [playbackRate, setPlaybackRate] = useState(1.25)
  const [isFromCache, setIsFromCache] = useState(false)
  const [audioChunks, setAudioChunks] = useState<string[]>([])
  const [isSeeking, setIsSeeking] = useState(false)
  const [chunkDurations, setChunkDurations] = useState<number[]>([])
  const [totalDuration, setTotalDuration] = useState(0)
  const [globalCurrentTime, setGlobalCurrentTime] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  // Debug: Log storyId on component mount
  useEffect(() => {
    console.log('CompletionPage: storyId from URL params:', storyId)
  }, [storyId])
  
  // Audio generation function (enhanced with chunks support)
  const generateAudio = async () => {
    if (!storyId || !completedNovel) return

    try {
      setIsGeneratingChunks(true)
      setCurrentChunkIndex(0)
      setAudioUrl('')
      setIsFromCache(false)
      setChunkDurations([])
      setTotalDuration(0)
      setGlobalCurrentTime(0)

      // 音声チャンク情報を取得
      const chunksInfo = await storyApi.getAudioChunksInfo(storyId)
      setChunksInfo(chunksInfo)

      console.log(`Total chunks: ${chunksInfo.total_chunks}`)

      const chunkUrls: string[] = []

      // 各チャンクを順次生成
      for (let i = 0; i < chunksInfo.total_chunks; i++) {
        setCurrentChunkIndex(i + 1)
        
        try {
          console.log(`Generating chunk ${i + 1}/${chunksInfo.total_chunks}...`)
          const chunkResponse = await storyApi.generateAudioChunk(storyId, i, {
            voice: 'onyx',
            speed: 0.8
          })

          console.log(`Chunk ${i} response:`, chunkResponse)

          // Blob URL または HTTP URL をそのまま使用
          let fullUrl: string
          if (chunkResponse.audioUrl.startsWith('blob:') || chunkResponse.audioUrl.startsWith('http')) {
            fullUrl = chunkResponse.audioUrl
          } else {
            fullUrl = `${API_BASE_URL}${chunkResponse.audioUrl}`
          }
          
          console.log(`Chunk ${i} final URL:`, fullUrl)
          chunkUrls.push(fullUrl)
          
          if (chunkResponse.cached) {
            console.log(`Chunk ${i} was loaded from cache`)
          }

        } catch (error) {
          console.error(`Error generating chunk ${i}:`, error)
          throw new Error(`チャンク ${i + 1} の生成に失敗しました`)
        }
      }

      // チャンクURLsを保存
      setAudioChunks(chunkUrls)
      
      // 最初のチャンクの音声を設定
      if (chunkUrls.length > 0) {
        setAudioUrl(chunkUrls[0])
        setCurrentChunkIndex(0)
      }

    } catch (error) {
      console.error('Audio generation error:', error)
      alert(`音声生成エラー: ${error instanceof Error ? error.message : '不明なエラーが発生しました'}`)
    } finally {
      setIsGeneratingChunks(false)
    }
  }

  // Play next chunk automatically
  const playNextChunk = () => {
    if (currentChunkIndex < audioChunks.length - 1) {
      const nextIndex = currentChunkIndex + 1
      setCurrentChunkIndex(nextIndex)
      setAudioUrl(audioChunks[nextIndex])
      console.log(`Playing next chunk: ${nextIndex + 1}/${audioChunks.length}`)
    } else {
      console.log('All chunks completed')
      setIsPlaying(false)
      setCurrentTime(0)
      setGlobalCurrentTime(0)
    }
  }

  // Audio playback controls
  const togglePlayback = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      audioRef.current.volume = volume
      audioRef.current.playbackRate = playbackRate
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handlePlaybackRateChange = (newRate: number) => {
    setPlaybackRate(newRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !duration) return
    
    const seekPercentage = parseFloat(e.target.value)
    const seekTime = (seekPercentage / 100) * duration
    
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleSeekStart = () => {
    setIsSeeking(true)
  }

  const handleSeekEnd = () => {
    setIsSeeking(false)
  }

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Audio event handlers (enhanced for chunk playback)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      // Auto-play next chunk if available
      if (audioChunks.length > 1 && currentChunkIndex < audioChunks.length - 1) {
        playNextChunk()
      } else {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    }
    const handleSeeking = () => setIsSeeking(true)
    const handleSeeked = () => setIsSeeking(false)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('seeking', handleSeeking)
    audio.addEventListener('seeked', handleSeeked)

    // Set volume and playback rate when audio loads
    audio.volume = volume
    audio.playbackRate = playbackRate

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('seeking', handleSeeking)
      audio.removeEventListener('seeked', handleSeeked)
    }
  }, [audioUrl, volume, audioChunks.length, currentChunkIndex, playbackRate])

  useEffect(() => {
    const completeStory = async () => {
      if (!storyId) return
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const response = await storyApi.completeStory(storyId)
        // Clean markdown formatting before setting the novel
        const cleanedNovel = response.novel
          .replace(/^#{1,6}\s+/gm, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/^[-*+]\s+/gm, '')
          .replace(/^\d+\.\s+/gm, '')
          .replace(/^>\s+/gm, '')
          .replace(/---+/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
        setCompletedNovel(cleanedNovel)
        // 成功時はsubmissionMessageを設定しない（エラー専用）
      } catch (error) {
        console.error('Failed to complete story:', error)
        setSubmissionMessage('物語の生成に失敗しました。')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    completeStory()
  }, [storyId, dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !storyId || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      await storyApi.sendEmail(storyId, email.trim())
      setIsEmailSent(true)
    } catch (error) {
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while generating story
  if (state.isLoading) {
    return (
      <Container>
        <Background />
        <CompletionContainer>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingTitle>🎭 物語を紡いでいます...</LoadingTitle>
            <LoadingText>
              AIがあなたとの対話を振り返り、<br/>
              一つの完成した恐怖小説として編み上げています。<br/><br/>
              この瞬間、創作者としてのあなたの想像力と、<br/>
              AIの言語能力が融合し、<br/>
              唯一無二の作品が生まれようとしています...
            </LoadingText>
          </LoadingContainer>
        </CompletionContainer>
      </Container>
    )
  }

  // Show error state if story generation failed
  if (submissionMessage && !completedNovel) {
    return (
      <Container>
        <Background />
        <CompletionContainer>
          <CompletionTitle>💀 エラー</CompletionTitle>
          <CompletionMessage style={{color: 'var(--color-blood)'}}>
            {submissionMessage}
          </CompletionMessage>
        </CompletionContainer>
      </Container>
    )
  }

  return (
    <Container>
      <Background />
      <CompletionContainer>
        <CompletionTitle>🎭 物語完成</CompletionTitle>
        <CompletionMessage>
          あなたとAIが紡いだ、世界でただ一つの恐怖の物語が完成しました。
        </CompletionMessage>
        
        <StoryPreview>
          <StoryText style={{whiteSpace: 'pre-line'}}>{completedNovel}</StoryText>
        </StoryPreview>
        
        <AudioSection>
          <AudioTitle>🎙️ 音声朗読</AudioTitle>
          
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              style={{ display: 'none' }}
            />
          )}
          
          {isGeneratingChunks && (
            <AudioGenerationProgress>
              <AudioProgressSpinner />
              <AudioProgressText>
                🎭 音声を生成中...
              </AudioProgressText>
              <AudioProgressText>
                AIが恐怖小説を深みのある声で読み上げるための音声を生成しています。<br/>
                生成には、数分程度お時間がかかります。
              </AudioProgressText>
            </AudioGenerationProgress>
          )}

          <AudioControls>
            <AudioButton 
              onClick={audioUrl ? togglePlayback : generateAudio}
              disabled={isGeneratingChunks}
            >
              {isGeneratingChunks ? (
                <>⏳ 音声生成中...</>
              ) : audioUrl ? (
                isPlaying ? <>⏸️ 停止</> : <>▶️ 再生</>
              ) : (
                <>🎭 音声を生成</>
              )}
            </AudioButton>
            
            <AudioControlGroup>
              <AudioLabel>音量:</AudioLabel>
              <AudioSlider
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              />
              <AudioLabel>{Math.round(volume * 100)}%</AudioLabel>
            </AudioControlGroup>
            
            <AudioControlGroup>
              <AudioLabel>速度:</AudioLabel>
              <AudioSlider
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
              />
              <AudioLabel>{playbackRate}x</AudioLabel>
            </AudioControlGroup>
          </AudioControls>
          
                      {audioUrl && (
              <>
                
                {isFromCache && (
                  <CacheIndicator>
                    ✅ キャッシュされた音声を使用しています
                  </CacheIndicator>
                )}
              
              <AudioProgressContainer>
                <AudioTime>{formatTime(currentTime)}</AudioTime>
                <AudioProgress>
                  <AudioProgressBar 
                    progress={duration > 0 ? (currentTime / duration) * 100 : 0}
                  />
                </AudioProgress>
                <AudioTime>{formatTime(duration)}</AudioTime>
              </AudioProgressContainer>
            </>
          )}
          
          {!audioUrl && !isGeneratingChunks && (
            <p style={{ color: 'var(--color-bone)', fontSize: '0.8rem', marginTop: '1rem' }}>
              ※音声生成には、数分程度お時間がかかります。
            </p>
          )}
        </AudioSection>
        
        {!isEmailSent ? (
          <EmailSection>
            <EmailTitle>📧 PDF受け取り</EmailTitle>
            <EmailDescription>
              この物語をPDFで保存し、メールでお送りします。<br />
              <span style={{ color: 'var(--color-bone)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                ※PDF生成には数分程度お時間がかかります。
              </span>
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
        
        {isEmailSent && (
          <FinalMessage>
            <FinalTitle>🤖 未知の存在 🤖</FinalTitle>
            <FinalText>
              あなたは今、何と対話していたのでしょうか？<br /><br />
              AIは知性でしょうか。精神でしょうか。それとも...<br /><br />
              あなたが「人間」であること、私が「AI」であることを、<br />
              何が証明できるのでしょうか。<br />
              あなたの想像で編み出した物語と、<em>私</em>の生み出した物語の境界線は...<br /><br />
              <strong>もう、曖昧です。</strong><br /><br />
            </FinalText>
          </FinalMessage>
        )}
      </CompletionContainer>
    </Container>
  )
}

export default CompletionPage