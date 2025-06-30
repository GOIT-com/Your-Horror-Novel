import React, { useState } from 'react'
import styled from 'styled-components'
import { useFont } from '../context/FontContext'
import BGMPlayer from './BGMPlayer'

const FontSwitcherContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1002;
  min-width: 180px;
  
  @media (max-width: 768px) {
    min-width: auto;
    top: 15px;
    right: 15px;
  }
`

const HamburgerButton = styled.button`
  display: none;
  background: rgba(139, 0, 0, 0.9);
  border: 2px solid var(--color-blood);
  color: var(--color-bone);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: var(--color-blood);
    box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
  
  @media (min-width: 769px) {
    display: none !important;
  }
`

const DesktopControls = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 280px;
  background: rgba(26, 26, 26, 0.98);
  border-left: 3px solid var(--color-blood);
  backdrop-filter: blur(15px);
  padding: 20px;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  overflow-y: auto;
  z-index: 1001;
  
  @media (max-width: 768px) {
    display: block;
  }
  
  @media (max-width: 320px) {
    width: 100vw;
    border-left: none;
    border-top: 3px solid var(--color-blood);
  }
`

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-blood);
`

const MobileMenuTitle = styled.h3`
  font-family: var(--font-horror);
  color: var(--color-blood);
  font-size: 1.2rem;
  margin: 0;
`

const CloseButton = styled.button`
  background: transparent;
  border: 2px solid var(--color-blood);
  color: var(--color-bone);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-blood);
  }
`

const MobileFontSection = styled.div`
  margin-bottom: 24px;
`

const MobileSectionTitle = styled.h4`
  color: var(--color-blood);
  font-size: 1rem;
  margin-bottom: 12px;
  font-family: var(--font-horror);
`

const MobileFontOption = styled.button<{ isSelected: boolean; fontFamily: string }>`
  width: 100%;
  background: ${props => props.isSelected ? 'var(--color-blood)' : 'transparent'};
  border: 2px solid ${props => props.isSelected ? 'var(--color-blood)' : 'var(--color-grey)'};
  color: var(--color-bone);
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-family: ${props => props.fontFamily};
  font-size: 14px;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.isSelected ? 'var(--color-blood)' : 'rgba(139, 0, 0, 0.3)'};
    border-color: var(--color-blood);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`

const MobileBGMSection = styled.div`
  margin-top: 24px;
`

const Overlay = styled.div<{ isVisible: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 999;
  
  @media (max-width: 768px) {
    display: block;
  }
`

const FontButton = styled.button`
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
  
  &:hover {
    background: var(--color-blood);
    box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
  }
`

const FontDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(26, 26, 26, 0.95);
  border: 2px solid var(--color-blood);
  border-radius: 8px;
  min-width: 150px;
  margin-top: 5px;
  backdrop-filter: blur(10px);
  
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  animation: ${props => props.isOpen ? 'fadeIn 0.2s ease' : 'none'};
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const FontOption = styled.button<{ isSelected: boolean; fontFamily: string }>`
  width: 100%;
  background: ${props => props.isSelected ? 'var(--color-blood)' : 'transparent'};
  border: none;
  color: var(--color-bone);
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  font-family: ${props => props.fontFamily};
  font-size: 14px;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => props.isSelected ? 'var(--color-blood)' : 'rgba(139, 0, 0, 0.3)'};
  }
  
  &:first-child {
    border-radius: 6px 6px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 6px 6px;
  }
`

function FontSwitcher() {
  const { currentFont, setCurrentFont, fontOptions } = useFont()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const currentFontOption = fontOptions.find(option => option.value === currentFont)
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }
  
  const toggleMobileMenu = () => {
    console.log('ハンバーガーメニュートグル:', !isMobileMenuOpen)
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }
  
  const selectFont = (fontValue: string) => {
    setCurrentFont(fontValue as any)
    setIsOpen(false)
    setIsMobileMenuOpen(false)
  }
  
  // クリック外側で閉じる（デスクトップ用）
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-font-switcher]')) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])
  
  // モバイルメニューでのスクロール防止
  React.useEffect(() => {
    console.log('モバイルメニュー状態変更:', isMobileMenuOpen)
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])
  
  return (
    <>
      <FontSwitcherContainer data-font-switcher>
        {/* ハンバーガーボタン（モバイルのみ表示） */}
        <HamburgerButton onClick={toggleMobileMenu}>
          ☰
        </HamburgerButton>
        
        {/* デスクトップ表示 */}
        <DesktopControls>
          <FontButton onClick={toggleDropdown}>
            🎨 フォント: {currentFontOption?.label}
          </FontButton>
          
          <FontDropdown isOpen={isOpen}>
            {fontOptions.map((option) => (
              <FontOption
                key={option.value}
                isSelected={option.value === currentFont}
                fontFamily={option.family}
                onClick={() => selectFont(option.value)}
              >
                {option.label}
              </FontOption>
            ))}
          </FontDropdown>
          
          <BGMPlayer />
        </DesktopControls>
      </FontSwitcherContainer>
      
      {/* オーバーレイ（モバイルメニュー背景） */}
      <Overlay isVisible={isMobileMenuOpen} onClick={closeMobileMenu} />
      
      {/* モバイルメニュー */}
      <MobileMenu isOpen={isMobileMenuOpen}>
        <MobileMenuHeader>
          <MobileMenuTitle>⚙️ 設定</MobileMenuTitle>
          <CloseButton onClick={closeMobileMenu}>✕</CloseButton>
        </MobileMenuHeader>
        
        <MobileFontSection>
          <MobileSectionTitle>🎨 フォント設定</MobileSectionTitle>
          {fontOptions.map((option) => (
            <MobileFontOption
              key={option.value}
              isSelected={option.value === currentFont}
              fontFamily={option.family}
              onClick={() => selectFont(option.value)}
            >
              {option.label}
            </MobileFontOption>
          ))}
        </MobileFontSection>
        
        <MobileBGMSection>
          <MobileSectionTitle>🎵 BGM設定</MobileSectionTitle>
          <BGMPlayer />
        </MobileBGMSection>
      </MobileMenu>
    </>
  )
}

export default FontSwitcher 