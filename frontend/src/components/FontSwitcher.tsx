import React, { useState } from 'react'
import styled from 'styled-components'
import { useFont } from '../context/FontContext'

const FontSwitcherContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
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
  
  const currentFontOption = fontOptions.find(option => option.value === currentFont)
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }
  
  const selectFont = (fontValue: string) => {
    setCurrentFont(fontValue as any)
    setIsOpen(false)
  }
  
  // クリック外側で閉じる
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
  
  return (
    <FontSwitcherContainer data-font-switcher>
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
    </FontSwitcherContainer>
  )
}

export default FontSwitcher 