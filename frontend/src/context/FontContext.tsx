import React, { createContext, useContext, useState, useEffect } from 'react'

export type FontType = 'minamoji' | 'creepster' | 'crimson'

interface FontContextType {
  currentFont: FontType
  setCurrentFont: (font: FontType) => void
  fontOptions: { value: FontType; label: string; family: string }[]
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export const fontOptions = [
  { 
    value: 'minamoji' as FontType, 
    label: 'みなもじ', 
    family: "'MinamojiFont', sans-serif" 
  },
  { 
    value: 'creepster' as FontType, 
    label: 'Creepster', 
    family: "'Creepster', cursive" 
  },
  { 
    value: 'crimson' as FontType, 
    label: 'Crimson Text', 
    family: "'Crimson Text', serif" 
  }
]

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [currentFont, setCurrentFont] = useState<FontType>('minamoji')

  // ローカルストレージからフォント設定を復元
  useEffect(() => {
    const savedFont = localStorage.getItem('selectedFont') as FontType
    if (savedFont && fontOptions.some(option => option.value === savedFont)) {
      setCurrentFont(savedFont)
    }
  }, [])

  // フォント変更時にローカルストレージに保存
  const handleFontChange = (font: FontType) => {
    setCurrentFont(font)
    localStorage.setItem('selectedFont', font)
    
    // CSS変数を動的に更新
    const selectedFont = fontOptions.find(option => option.value === font)
    if (selectedFont) {
      document.documentElement.style.setProperty('--font-current', selectedFont.family)
    }
  }

  // 初期化時にCSS変数を設定
  useEffect(() => {
    const selectedFont = fontOptions.find(option => option.value === currentFont)
    if (selectedFont) {
      document.documentElement.style.setProperty('--font-current', selectedFont.family)
    }
  }, [currentFont])

  return (
    <FontContext.Provider 
      value={{ 
        currentFont, 
        setCurrentFont: handleFontChange, 
        fontOptions 
      }}
    >
      {children}
    </FontContext.Provider>
  )
}

export function useFont() {
  const context = useContext(FontContext)
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
} 