import google.generativeai as genai
from typing import Dict, List, Any
import os
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        # Initialize Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        
        # Try different model names in order of preference
        model_names = [
            'gemini-2.5-flash-lite-preview-06-17',
            'gemini-2.5-flash'
        ]
        
        self.model = None
        for model_name in model_names:
            try:
                self.model = genai.GenerativeModel(model_name)
                logger.info(f"Successfully initialized Gemini model: {model_name}")
                break
            except Exception as e:
                logger.warning(f"Failed to initialize model {model_name}: {str(e)}")
                continue
        
        if self.model is None:
            # List available models for debugging
            try:
                available_models = [m.name for m in genai.list_models()]
                logger.error(f"Available models: {available_models}")
            except Exception as e:
                logger.error(f"Failed to list available models: {str(e)}")
            
            raise ValueError("Failed to initialize any Gemini model. Please check your API key and available models.")

    def _create_personality_prompt(self, quiz_answers: Dict[str, str]) -> str:
        """Create a personality prompt based on quiz answers"""
        
        # Create a mapping of answers to story preferences
        preferences = {
            'q1': {
                'a': '閉鎖された古い洋館や病院などの不気味な建物',
                'b': '日常に潜む歪みや違和感',
                'c': '未知の生物が潜む自然環境'
            },
            'q2': {
                'a': 'じわじわと精神を追い詰める心理的恐怖',
                'b': '目に見える怪物や幽霊からの直接的な恐怖',
                'c': '理解不能な超常現象や不条理な恐怖'
            },
            'q3': {
                'a': 'ごく普通の一般人で、恐怖に翻弄される主人公',
                'b': '恐怖の謎を解き明かそうとする探究心のある主人公',
                'c': '特殊な能力で恐怖に立ち向かう強い主人公'
            },
            'q4': {
                'a': '不気味な音を立てる古い人形',
                'b': '持つ者の運命を狂わせる曰く付きの鏡',
                'c': '謎の文字が書かれた古文書'
            },
            'q5': {
                'a': '過去の悲劇や怨念',
                'b': '科学では説明できない呪い',
                'c': '人間の狂気や悪意'
            },
            'q6': {
                'a': 'ゆっくりと静かに恐怖が忍び寄るスローペース',
                'b': '次々と事件が起こるジェットコースター展開',
                'c': '静と動が巧みに切り替わる緩急のある展開'
            },
            'q7': {
                'a': '何かを知っているようで話さない謎めいた老人',
                'b': '主人公を惑わす美しいが影のある人物',
                'c': '純粋無垢だが、時折不気味な言動を見せる子供'
            },
            'q8': {
                'a': '耳元で聞こえるはずのない囁き声（聴覚的恐怖）',
                'b': '誰もいないはずなのに感じる視線（視覚的恐怖）',
                'c': 'べっとりと肌にまとわりつくような嫌な感触（触覚的恐怖）'
            },
            'q9': {
                'a': '主人公が絶望に叩き落とされるバッドエンド',
                'b': '謎は残るが、日常には戻れるビターエンド',
                'c': '恐怖の元凶を断ち切る希望のあるハッピーエンド'
            },
            'q10': {
                'a': '読者に情け容赦なく、徹底的に恐怖を与える語り手',
                'b': '読者を物語に引き込み、謎解きを促すガイド役',
                'c': '時にユーモアを交えながらも、核心ではゾッとさせる語り手'
            }
        }
        
        # Build personality description
        personality_traits = []
        for q_id, answer in quiz_answers.items():
            if q_id in preferences and answer in preferences[q_id]:
                personality_traits.append(preferences[q_id][answer])
        
        return "\n".join([f"- {trait}" for trait in personality_traits])

    async def generate_initial_story(self, quiz_answers: Dict[str, str]) -> str:
        """Generate the initial story based on quiz answers"""
        try:
            personality = self._create_personality_prompt(quiz_answers)
            
            prompt = f"""
あなたは恐怖小説の専門的な語り部です。以下のユーザーの好みに基づいて、インタラクティブなホラー小説の冒頭を生成してください。

ユーザーの好み:
{personality}

指示:
1. 2-3段落（200-300文字程度）で物語の冒頭を書いてください
2. 主人公を「あなた」として二人称で書いてください
3. 読者が次にどう行動するか選択できるような状況で終わってください
4. ユーザーの好みを反映した恐怖要素を含めてください
5. 没入感を高めるため、五感に訴える描写を含めてください
6. 物語のトーンはダークで不気味に、しかし読者を引き込むように

物語の冒頭を生成してください:
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating initial story: {str(e)}")
            raise

    async def generate_response(self, quiz_answers: Dict[str, str], chat_history: List[Dict[str, str]]) -> str:
        """Generate AI response based on chat history"""
        try:
            personality = self._create_personality_prompt(quiz_answers)
            
            # Build conversation context
            conversation = ""
            for msg in chat_history:
                role = "語り部" if msg["role"] == "model" else "あなた"
                conversation += f"{role}: {msg['content']}\n\n"
            
            # Count turns to determine if this is the final turn
            user_turns = len([msg for msg in chat_history if msg["role"] == "user"])
            is_final_turn = user_turns >= 9  # 10th turn (0-indexed)
            
            prompt = f"""
あなたは恐怖小説の専門的な語り部です。以下のユーザーの好みに基づいて、インタラクティブなホラー小説を続けてください。

ユーザーの好み:
{personality}

これまでの物語:
{conversation}

指示:
{'1. これは物語の最終ターンです。物語を完結させ、恐怖のクライマックスと結末を書いてください' if is_final_turn else '1. 物語を2-3段落（200-300文字程度）で続けてください'}
2. 主人公を「あなた」として二人称で書いてください
3. ユーザーの行動に対して論理的で恐怖に満ちた展開を続けてください
4. {'物語を完結させ、ユーザーの好みに応じた結末にしてください' if is_final_turn else '読者が次にどう行動するか選択できるような状況で終わってください'}
5. 没入感を高めるため、五感に訴える描写を含めてください
6. 物語のトーンはダークで不気味に保ってください

物語の続きを生成してください:
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise

    async def generate_final_story(self, quiz_answers: Dict[str, str], chat_history: List[Dict[str, str]]) -> str:
        """Generate the final polished story for PDF"""
        try:
            personality = self._create_personality_prompt(quiz_answers)
            
            # Build conversation context
            conversation = ""
            for msg in chat_history:
                role = "語り部" if msg["role"] == "model" else "あなたの行動"
                conversation += f"【{role}】\n{msg['content']}\n\n"
            
            prompt = f"""
あなたは恐怖小説の専門編集者です。以下のインタラクティブな対話を、完成された短編ホラー小説に仕上げてください。

ユーザーの好み:
{personality}

対話履歴:
{conversation}

指示:
1. 対話形式ではなく、流れるような小説形式に書き直してください
2. 主人公を「あなた」として二人称で統一してください
3. 対話の内容を活かしながら、自然な物語の流れに構成し直してください
4. 1500-2000文字程度の短編小説にまとめてください
5. タイトルをつけてください（ユーザーの好みを反映した恐怖的なタイトル）
6. 章や段落を適切に区切り、読みやすくしてください
7. 恐怖の描写を強化し、読者が恐怖を感じられるように仕上げてください
8. PDF用のフォーマットを意識して整理してください

完成された小説を生成してください:
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating final story: {str(e)}")
            raise