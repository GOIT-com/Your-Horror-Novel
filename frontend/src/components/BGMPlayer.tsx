import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

const BGMContainer = styled.div`
  margin-top: 8px;
`

const BGMButton = styled.button`
  background: rgba(139, 0, 0, 0.9);
  border: 2px solid var(--color-blood);
  color: var(--color-bone);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: var(--color-blood);
    box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const VolumeContainer = styled.div<{ isVisible: boolean }>`
  margin-top: 8px;
  background: rgba(26, 26, 26, 0.95);
  border: 2px solid var(--color-blood);
  border-radius: 8px;
  padding: 8px 12px;
  backdrop-filter: blur(10px);
  
  display: ${props => props.isVisible ? 'block' : 'none'};
  
  animation: ${props => props.isVisible ? 'fadeIn 0.2s ease' : 'none'};
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const VolumeSlider = styled.input`
  width: 100%;
  height: 4px;
  background: var(--color-dark-grey);
  outline: none;
  border-radius: 2px;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--color-blood);
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--color-blood);
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`

const VolumeLabel = styled.div`
  color: var(--color-bone);
  font-size: 12px;
  text-align: center;
  margin-bottom: 8px;
`

const ErrorMessage = styled.div`
  color: var(--color-blood);
  font-size: 12px;
  text-align: center;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(139, 0, 0, 0.2);
  border-radius: 4px;
`

function BGMPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [isLoading, setIsLoading] = useState(false)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [error, setError] = useState('')
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loadingTimeoutRef = useRef<number | null>(null)
  const isPlayingRef = useRef(false)

  // モバイル検知
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  useEffect(() => {
    // オーディオ要素を作成（プリロードしない）
    audioRef.current = new Audio()
    audioRef.current.loop = true
    audioRef.current.volume = volume
    audioRef.current.preload = 'none' // モバイルでのプリロードを無効化
    
    const handleLoadStart = () => {
      setIsLoading(true)
      setError('')
      // 読み込みタイムアウトを設定（モバイル向け）
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
        setError('BGMの読み込みに時間がかかっています')
      }, isMobile ? 10000 : 5000) // モバイルは10秒、デスクトップは5秒
    }
    
    const handleCanPlay = () => {
      setIsLoading(false)
      setError('')
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
    
    const handleError = (e: any) => {
      setIsLoading(false)
      setIsPlaying(false)
      console.error('BGM読み込みエラー:', e)
      setError('BGMの読み込みに失敗しました')
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }

    const handleStalled = () => {
      console.warn('BGM読み込みが停止しました')
      setError('ネットワークが遅い可能性があります')
    }

    const handleEnded = () => {
      console.log('BGM終了 - 自動リロード開始')
      if (isPlayingRef.current && audioRef.current) {
        // BGMが終了したら自動で再開
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((error) => {
          console.error('BGM自動リロードエラー:', error)
          setError('BGMの自動リロードに失敗しました')
        })
      }
    }
    
    audioRef.current.addEventListener('loadstart', handleLoadStart)
    audioRef.current.addEventListener('canplay', handleCanPlay)
    audioRef.current.addEventListener('error', handleError)
    audioRef.current.addEventListener('stalled', handleStalled)
    audioRef.current.addEventListener('ended', handleEnded)
    
          return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadstart', handleLoadStart)
          audioRef.current.removeEventListener('canplay', handleCanPlay)
          audioRef.current.removeEventListener('error', handleError)
          audioRef.current.removeEventListener('stalled', handleStalled)
          audioRef.current.removeEventListener('ended', handleEnded)
          audioRef.current.pause()
          audioRef.current = null
        }
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
      }
  }, [isMobile])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // isPlayingの状態をrefに同期
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  const initializeAudio = () => {
    if (audioRef.current && !audioRef.current.src) {
      // デバイスに応じてファイルを選択
      const bgmFile = isMobile ? '/audio/恐怖BGM2_mobile.mp3' : '/audio/恐怖BGM2.mp3'
      audioRef.current.src = bgmFile
      console.log(`BGMファイル選択: ${bgmFile} (モバイル: ${isMobile})`)
    }
  }

  const toggleBGM = async () => {
    if (!audioRef.current) return
    
    // ユーザーインタラクションをマーク
    if (!userHasInteracted) {
      setUserHasInteracted(true)
    }
    
    // オーディオファイルの初期化
    initializeAudio()
    
    if (isLoading) {
      setError('読み込み中です。少々お待ちください...')
      return
    }
    
    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        setError('')
      } else {
        setIsLoading(true)
        setError('')
        
        // モバイルの場合、再生前に少し待つ
        if (isMobile) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const playPromise = audioRef.current.play()
        
        if (playPromise !== undefined) {
          await playPromise
          setIsPlaying(true)
          setIsLoading(false)
        }
      }
    } catch (error: any) {
      setIsLoading(false)
      setIsPlaying(false)
      console.error('BGM再生エラー:', error)
      
      if (error.name === 'NotAllowedError') {
        setError('ブラウザでオーディオが許可されていません')
      } else if (error.name === 'NotSupportedError') {
        setError('お使いのブラウザではBGMに対応していません')
      } else {
        setError('BGMの再生に失敗しました')
      }
    }
  }

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setVolume(newVolume)
  }

  const toggleVolumeControl = () => {
    setShowVolumeControl(!showVolumeControl)
  }

  const getButtonText = () => {
    if (error) return '❌ BGM: エラー'
    if (isLoading) return '🔄 読込中...'
    if (isPlaying) return '🎵 BGM: ON'
    return '🔇 BGM: OFF'
  }

  const retryLoad = () => {
    setError('')
    setIsLoading(false)
    if (audioRef.current) {
      audioRef.current.load()
    }
  }

  return (
    <BGMContainer>
      <BGMButton onClick={toggleBGM} disabled={isLoading && !error}>
        {getButtonText()}
      </BGMButton>
      
      {error && (
        <ErrorMessage>
          {error}
          {error.includes('読み込み') && (
            <div style={{ marginTop: '4px' }}>
              <button
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-blood)',
                  color: 'var(--color-bone)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
                onClick={retryLoad}
              >
                再試行
              </button>
            </div>
          )}
        </ErrorMessage>
      )}
      
      {isPlaying && !error && (
        <>
          <BGMButton onClick={toggleVolumeControl} style={{ marginTop: '4px', fontSize: '12px', padding: '4px 8px' }}>
            🎚️ 音量調整
          </BGMButton>
          
          <VolumeContainer isVisible={showVolumeControl}>
            <VolumeLabel>音量: {Math.round(volume * 100)}%</VolumeLabel>
            <VolumeSlider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
          </VolumeContainer>
        </>
      )}
    </BGMContainer>
  )
}

export default BGMPlayer 