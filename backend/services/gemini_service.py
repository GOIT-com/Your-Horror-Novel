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
        
        # Advanced personalization algorithm
        horror_profile = self._analyze_horror_profile(quiz_answers)
        story_elements = self._generate_story_elements(quiz_answers)
        narrative_style = self._determine_narrative_style(quiz_answers)
        
        # Build personality description with weights
        personality_traits = []
        for q_id, answer in quiz_answers.items():
            if q_id in preferences and answer in preferences[q_id]:
                personality_traits.append(preferences[q_id][answer])
        
        # Create comprehensive personality prompt
        prompt_parts = [
            f"【ユーザーホラープロファイル】",
            f"恐怖タイプ: {horror_profile['horror_type']}",
            f"結末好み: {horror_profile['ending_preference']}",
            f"恐怖強度: {horror_profile['intensity_level']}",
            "",
            f"【物語要素指定】",
            f"舞台: {story_elements['setting']}",
            f"恐怖の源: {story_elements['fear_source']}",
            f"五感刺激: {story_elements['sensory_focus']}",
            f"ペース: {story_elements['pacing']}",
            "",
            f"【語りスタイル】",
            f"{narrative_style}",
            "",
            f"【ユーザー回答詳細】"
        ]
        
        # Add traditional traits
        for trait in personality_traits:
            prompt_parts.append(f"- {trait}")
        
        return "\n".join(prompt_parts)

    async def generate_initial_story(self, quiz_answers: Dict[str, str]) -> str:
        """Generate the initial story based on quiz answers"""
        try:
            personality = self._create_personality_prompt(quiz_answers)
            
            prompt = f"""
あなたは恐怖小説の専門的な語り部です。以下のユーザーの好みに基づいて、短編ホラー小説の冒頭（起）を生成してください。

ユーザーの好み:
{personality}

重要な指示:
【起承転結の「起」】
- これは5ターン完結の短編ホラーの冒頭です
- 恐怖の種をまく、読者を不穏な世界に引き込むことが目的です

【R15+恐怖表現】
- ゾワゾワ、ヒヤヒヤ、不快な感情を積極的に喚起してください
- 直接的な描写よりも、読者の想像力を刺激する「余白」を重視してください

注意事項:
- 必ず日本語で出力してください。

具体的な指示:
1. 250-350文字程度で物語の冒頭を書いてください
2. 主人公を「あなた」として二人称で書いてください
3. 読者が速やかに嫌な気持ちになれるように不快な表現を行なってください。
4. 五感に訴える不快な描写（特に聴覚、触覚、嗅覚）を含めてください
5. 読者が次にどう行動するか3つの選択肢を用意してください。なお、選択肢以外の行動も想像力を膨らませて記述することを推奨して。
6. 「何かがおかしい」という不安を植え付けてください

短編ホラーの冒頭（起）を生成してください:
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
            
            # Count turns to determine story structure (0-indexed)
            user_turns = len([msg for msg in chat_history if msg["role"] == "user"])
            
            # Determine story phase for 4-turn structure
            if user_turns == 1:
                story_phase = "承"
                phase_instruction = "【承】恐怖の展開と状況の悪化。不安を増大させ、読者をさらに深く恐怖の世界に引き込んでください。"
            elif user_turns == 2:
                story_phase = "承"
                phase_instruction = "【承】恐怖の展開と状況の悪化。不安を増大させ、読者をさらに深く恐怖の世界に引き込んでください。"
            elif user_turns == 3:
                story_phase = "転"
                phase_instruction = "【転】恐怖がさらに高まり、真実に近づく。読者を恐怖のクライマックスへと導いてください。"
            elif user_turns == 4:
                story_phase = "結"
                phase_instruction = "【結】物語の完結。恐怖の結末を迎え、ユーザーの好みに応じた強烈なインパクトで終わらせてください。"
            else:
                story_phase = "承"
                phase_instruction = "【承】恐怖の展開と状況の悪化。"
                
            is_pre_final_turn = user_turns == 3
            is_final_turn = user_turns == 4
            
            
            prompt = f"""
あなたは恐怖小説の専門的な語り部です。以下のユーザーの好みに基づいて、5ターン完結の短編ホラー小説を続けてください。

ユーザーの好み:
{personality}

これまでの物語:
{conversation}

現在のフェーズ: {story_phase} (ターン{user_turns + 1}/4)
{phase_instruction}

【R15+恐怖表現】
- ゾワゾワ、ヒヤヒヤ、不快な感情を積極的に喚起してください
- 直接的な描写よりも、読者の想像力を刺激する「余白」を重視してください

具体的な指示:
1. {f'400-500文字程度で物語を完結させてください。恐怖のクライマックスと結末を書いてください。' if is_final_turn else f'250-350文字程度で物語を続けてください。'}
2. 主人公を「あなた」として二人称で書いてください
3. ユーザーの行動に対して論理的で恐怖に満ちた展開を続けてください
4. {
    'ユーザーの好みに応じた結末で物語を完結させてください。バッドエンド、ビターエンド、ハッピーエンドのいずれかで。'
    if is_final_turn else
    '選択肢は示さずに「最期に貴方は・・・・？」という質問をユーザーに投げかけて、自由に記述させるようにしてください。'
    if is_pre_final_turn else
    '読者が次にどう行動するか3つの選択肢を用意してください。なお、選択肢以外の行動も想像力を膨らませて記述することを推奨して。'
}
5. 五感に訴える不快な描写（聴覚、触覚、嗅覚）を積極的に使って
6. 読み手が経験したことのある出来事や読み手の日常に小説の内容が結びつくようにして恐怖を与えてください。

短編ホラーの続きを生成してください:
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
1. 対話形式ではなく、短編小説の形式に書き直してください
2. 主人公を「あなた」として二人称で統一してください
3. 対話の内容を活かしながら、自然な物語の流れに構成し直してください
4. 1500-2000文字程度の短編小説にまとめてください
5. タイトルをつけてください（ユーザーの好みを反映した恐怖的なタイトル）
6. 章や段落を適切に区切り、読みやすくしてください
7. 恐怖の描写を強化し、読者が恐怖を感じられるように仕上げてください
8. PDF用のフォーマットを意識して整理してください
9. 「承知しました」などの表現は不要です。短編小説のみを出力して。

完成された小説を生成してください:
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating final story: {str(e)}")
            raise
    
    def _analyze_horror_profile(self, quiz_answers: Dict[str, str]) -> Dict[str, str]:
        """Analyze user's horror preferences and create profile"""
        
        # Horror type analysis (q2)
        horror_types = {
            'a': '心理的恐怖主体 - 精神をじわじわといたぶる、内面から湧き上がる恐怖',
            'b': '直接的恐怖主体 - 目に見える脇威、即座的な危険とショック',
            'c': '超常恐怖主体 - 理解できない不条理、存在そのものへの恐怖'
        }
        
        # Ending preference analysis (q9)
        ending_prefs = {
            'a': '絶望的結末希望 - 主人公が打ちのめされる強烈なバッドエンド',
            'b': '曖昧的結末希望 - 謎が残り、不安が残るビターエンド',
            'c': '希望的結末希望 - 恐怖を乗り越えるハッピーエンド'
        }
        
        # Intensity level (combination of q2, q6, q10)
        q2_ans = quiz_answers.get('q2', 'a')
        q6_ans = quiz_answers.get('q6', 'a') 
        q9_ans = quiz_answers.get('q9', 'a')
        q10_ans = quiz_answers.get('q10', 'a')
        
        # Determine intensity based on answers
        if q2_ans == 'a' and q10_ans == 'a':
            intensity = 'MAX強度 - 容赦なく、最大限の恐怖を与える'
        elif q2_ans == 'b' and q6_ans == 'b':
            intensity = 'HIGH強度 - アクション重視で強烈な恐怖を与える'
        elif q2_ans == 'c':
            intensity = 'MIND強度 - 理解不能な不条理で精神を攻める'
        else:
            intensity = 'MID強度 - バランスの取れた恐怖体験を提供'
        
        return {
            'horror_type': horror_types.get(q2_ans, horror_types['a']),
            'ending_preference': ending_prefs.get(q9_ans, ending_prefs['b']),
            'intensity_level': intensity
        }
    
    def _generate_story_elements(self, quiz_answers: Dict[str, str]) -> Dict[str, str]:
        """Generate specific story elements based on quiz answers"""
        
        # Setting elements (q1)
        settings = {
            'a': '閉鎖空間系 - 古い建物、地下室、逃げ場のない狭い空間',
            'b': '日常侵食系 - いつもの場所に潜む違和感、家、学校、職場',
            'c': '自然環境系 - 森、山、湖、人里離れた場所での孤立感'
        }
        
        # Fear source (q5)
        fear_sources = {
            'a': '怨念系 - 過去の悲劇、死者の意思、歴史の闇',
            'b': '呪い系 - 超自然的な力、不可解な現象、神秘的要素',
            'c': '狂気系 - 人間の悪意、異常な行動、社会の闇'
        }
        
        # Sensory focus (q8)
        sensory_elements = {
            'a': '聴覚中心 - 怪音、囁き声、不気味な静寂で恐怖を編み出す',
            'b': '視覚中心 - 影、動き、視線、見えてはいけないもので恐怖を作る',
            'c': '触覚中心 - 不快な感触、温度変化、肩に最く気配で恐怖を喩起'
        }
        
        # Pacing (q6)
        pacing_styles = {
            'a': 'スロービルド - じっくりと不安を積み重ね、緊張感を持続',
            'b': 'ラピッド展開 - 次々と起こる事件、スピーディな展開',
            'c': '緩急自在 - 静と動の切り替え、リズムのある展開'
        }
        
        return {
            'setting': settings.get(quiz_answers.get('q1', 'a'), settings['a']),
            'fear_source': fear_sources.get(quiz_answers.get('q5', 'a'), fear_sources['a']),
            'sensory_focus': sensory_elements.get(quiz_answers.get('q8', 'a'), sensory_elements['a']),
            'pacing': pacing_styles.get(quiz_answers.get('q6', 'a'), pacing_styles['a'])
        }
    
    def _determine_narrative_style(self, quiz_answers: Dict[str, str]) -> str:
        """Determine narrative style based on q10 answer"""
        
        styles = {
            'a': '「容赦なき語り手」 - 読者を突き放し、情け無用の恐怖を叩き込む。直接的で強烈な描写を使い、読者の精神を追い詰める。',
            'b': '「ガイド型語り手」 - 読者を物語に引き込み、謎解きへと導く。教育的でありながら、恐怖の真相を明かしていく。',
            'c': '「ユーモア混在語り手」 - 時に軽妙なユーモアを散りばめながら、油断させた隠で真の恐怖を仕掛ける。'
        }
        
        return styles.get(quiz_answers.get('q10', 'b'), styles['b'])