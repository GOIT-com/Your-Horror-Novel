import React from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: radial-gradient(circle at center, rgba(139, 0, 0, 0.1) 0%, rgba(0, 0, 0, 1) 70%);
  position: relative;
  overflow: hidden;
`

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="blood-drops" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="5" r="1" fill="%23440000" opacity="0.3"/><circle cx="5" cy="15" r="0.5" fill="%23660000" opacity="0.2"/></pattern></defs><rect width="100" height="100" fill="url(%23blood-drops)"/></svg>') repeat;
  opacity: 0.3;
`

const Title = styled.h1`
  font-family: var(--font-horror);
  font-size: clamp(3rem, 8vw, 6rem);
  color: var(--color-blood);
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
  filter: drop-shadow(0 0 20px var(--color-blood));
  animation: flicker 3s infinite alternate;
  
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`

const Subtitle = styled.p`
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: var(--color-bone);
  text-align: center;
  margin-bottom: 2rem;
  font-style: italic;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
`

const AgeRating = styled.div`
  background: var(--color-blood);
  color: var(--color-bone);
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 2rem;
  border: 2px solid var(--color-dark-red);
`

const Description = styled.div`
  max-width: 800px;
  margin-bottom: 3rem;
  text-align: center;
`

const DescriptionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--color-blood);
  margin-bottom: 1rem;
  font-family: var(--font-horror);
`

const DescriptionText = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-bone);
  margin-bottom: 1rem;
`

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`

const FeatureItem = styled.li`
  background: rgba(139, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-dark-red);
  text-align: left;
`

const FeatureNumber = styled.span`
  color: var(--color-blood);
  font-weight: bold;
  font-size: 1.2rem;
`

const StartButton = styled.button`
  background: linear-gradient(145deg, var(--color-blood), var(--color-dark-red));
  border: 3px solid var(--color-blood);
  color: var(--color-bone);
  padding: 16px 32px;
  font-family: var(--font-horror);
  font-size: 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 25px rgba(139, 0, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(145deg, var(--color-dark-red), var(--color-blood));
    box-shadow: 0 8px 30px rgba(139, 0, 0, 0.6);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`

function LandingPage() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/quiz')
  }

  return (
    <Container>
      <Background />
      <Title>Your Horror Nobel</Title>
      <Subtitle>あなたの選択が、恐怖を紡ぐ。AIと創る、あなただけの物語。</Subtitle>
      
      <AgeRating>R13+ 恐怖表現注意</AgeRating>
      
      <Description>
        <DescriptionTitle>🎭 体験の流れ</DescriptionTitle>
        <FeatureList>
          <FeatureItem>
            <FeatureNumber>1.</FeatureNumber> あなたの恐怖の好みを診断する10の質問に答える
          </FeatureItem>
          <FeatureItem>
            <FeatureNumber>2.</FeatureNumber> AIがあなた専用のホラー小説の冒頭を生成
          </FeatureItem>
          <FeatureItem>
            <FeatureNumber>3.</FeatureNumber> 4ターンの対話で物語を共同制作
          </FeatureItem>
          <FeatureItem>
            <FeatureNumber>4.</FeatureNumber> 完成した小説をPDFでメール受信
          </FeatureItem>
        </FeatureList>
        
        <DescriptionTitle style={{marginTop: '2rem'}}>🎨 このアプリの楽しみ方</DescriptionTitle>
        <DescriptionText style={{textAlign: 'left', background: 'rgba(139, 0, 0, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-dark-red)'}}>
          <strong>あなたは単なる読み手ではありません。</strong><br /><br />
          このアプリでは、<em>あなた自身がホラー小説の作者</em>となります。
          想像力を重ね、恐怖を織りなす作者として、AIと共に物語を紡いでいくのです。<br /><br />
          あなたの選択が、あなたの言葉が、あなたの想像が——<br />
          <strong>物語の運命を左右していくのです。</strong><br /><br />
          ＊イヤフォンをつけて、BGMを流し、没入感をお楽しみください。<br />
        </DescriptionText>
        
        <DescriptionText style={{marginTop: '1.5rem'}}>
          これは一度きりの体験です。あなたのメールアドレスで作成できる小説は１つのみ。
          <br />
          <strong>パンドラの箱を開ける覚悟はありますか？</strong>
        </DescriptionText>
      </Description>

      <StartButton onClick={handleStart}>
        物語を始める
      </StartButton>
      <DescriptionTitle style={{marginTop: '2rem'}}></DescriptionTitle>
    </Container>
  )
}

export default LandingPage