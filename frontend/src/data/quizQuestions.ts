export interface QuizOption {
  value: string
  text: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: '物語の舞台として、あなたが最も惹かれるのは？',
    options: [
      { value: 'a', text: '閉鎖された古い洋館や病院' },
      { value: 'b', text: '見慣れたはずの日常に潜む歪み' },
      { value: 'c', text: '未知の生物が潜む森や海' }
    ]
  },
  {
    id: 'q2',
    question: 'あなたが最も「怖い」と感じる恐怖の種類は？',
    options: [
      { value: 'a', text: 'じわじわと精神を追い詰める心理的恐怖' },
      { value: 'b', text: '目に見える怪物や幽霊からの直接的な恐怖' },
      { value: 'c', text: '理解不能な超常現象や不条理な恐怖' }
    ]
  },
  {
    id: 'q3',
    question: '物語の主人公に求めるものは？',
    options: [
      { value: 'a', text: 'ごく普通の一般人で、恐怖に翻弄される姿' },
      { value: 'b', text: '恐怖の謎を解き明かそうとする探究心' },
      { value: 'c', text: '特殊な能力で恐怖に立ち向かう強さ' }
    ]
  },
  {
    id: 'q4',
    question: '物語に登場してほしい「不気味なアイテム」は？',
    options: [
      { value: 'a', text: '不気味な音を立てる古い人形' },
      { value: 'b', text: '持つ者の運命を狂わせる曰く付きの鏡' },
      { value: 'c', text: '謎の文字が書かれた古文書' }
    ]
  },
  {
    id: 'q5',
    question: '恐怖体験の「原因」としてしっくりくるのは？',
    options: [
      { value: 'a', text: '過去の悲劇や怨念' },
      { value: 'b', text: '科学では説明できない呪い' },
      { value: 'c', text: '人間の狂気や悪意' }
    ]
  },
  {
    id: 'q6',
    question: '物語の進行速度はどれが好み？',
    options: [
      { value: 'a', text: 'ゆっくりと、静かに恐怖が忍び寄るスローペース' },
      { value: 'b', text: '次々と事件が起こるジェットコースター展開' },
      { value: 'c', text: '静と動が巧みに切り替わる緩急のある展開' }
    ]
  },
  {
    id: 'q7',
    question: '物語のキーパーソンとして登場してほしいのは？',
    options: [
      { value: 'a', text: '何かを知っているようで話さない謎めいた老人' },
      { value: 'b', text: '主人公を惑わす美しいが影のある人物' },
      { value: 'c', text: '純粋無垢だが、時折不気味な言動を見せる子供' }
    ]
  },
  {
    id: 'q8',
    question: '五感のうち、どの感覚への刺激が最も怖い？',
    options: [
      { value: 'a', text: '耳元で聞こえるはずのない囁き声（聴覚）' },
      { value: 'b', text: '誰もいないはずなのに感じる視線（視覚）' },
      { value: 'c', text: 'べっとりと肌にまとわりつくような嫌な感触（触覚）' }
    ]
  },
  {
    id: 'q9',
    question: '物語の結末として許せるのは？',
    options: [
      { value: 'a', text: '主人公が絶望に叩き落とされるバッドエンド' },
      { value: 'b', text: '謎は残るが、ひとまず日常には戻れるビターエンド' },
      { value: 'c', text: '恐怖の元凶を断ち切り、希望が見えるハッピーエンド' }
    ]
  },
  {
    id: 'q10',
    question: '最後に、この物語の語り手（AI）に何を望みますか？',
    options: [
      { value: 'a', text: '読者に情け容赦なく、徹底的に恐怖を与える語り手' },
      { value: 'b', text: '読者を物語に引き込み、謎解きを促すガイド役' },
      { value: 'c', text: '時にユーモアを交えながらも、核心ではゾッとさせる語り手' }
    ]
  }
]