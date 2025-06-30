import os
import logging
import hashlib
from openai import OpenAI
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        """Initialize OpenAI TTS service"""
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        self.enabled = False
        
        if not self.api_key:
            logger.warning("OPENAI_API_KEY environment variable not set - TTS functionality will be disabled")
            return
            
        try:
            # Set the API key as environment variable for OpenAI client
            os.environ["OPENAI_API_KEY"] = self.api_key
            self.client = OpenAI()
            self.enabled = True
            logger.info("OpenAI TTS service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {str(e)}")
            logger.warning("TTS functionality will be disabled")
    
    async def generate_speech(
        self, 
        text: str, 
        voice: str = "onyx", 
        speed: float = 0.8,
        response_format: str = "mp3"
    ) -> bytes:
        """
        Generate speech from text using OpenAI TTS
        
        Args:
            text (str): The text to convert to speech (max 4096 characters)
            voice (str): Voice to use - onyx is deep and suitable for horror
            speed (float): Speed of speech (0.25-4.0), slower for horror atmosphere
            response_format (str): Audio format (mp3, opus, aac, flac, wav, pcm)
        
        Returns:
            bytes: Audio content as bytes
        """
        if not self.enabled or not self.client:
            raise Exception("TTS service is not available. Please check OPENAI_API_KEY configuration.")
        
        try:
            logger.info(f"Original text length: {len(text)} characters")
            logger.info(f"Text preview (first 200 chars): {text[:200]}...")
            
            # For gpt-4o-mini-tts: estimate tokens (roughly 1.3 chars per token for Japanese)
            # Safe limit: 1800 tokens = ~2340 characters for Japanese text
            safe_char_limit = 2300
            
            if len(text) > safe_char_limit:
                logger.warning(f"Text length {len(text)} exceeds safe limit of {safe_char_limit} characters for gpt-4o-mini-tts, truncating...")
                # Find a good breaking point (end of sentence)
                truncated_text = text[:safe_char_limit]
                last_period = max(truncated_text.rfind('。'), truncated_text.rfind('.'), truncated_text.rfind('！'), truncated_text.rfind('？'))
                if last_period > safe_char_limit * 0.8:  # If we can find a sentence end in the last 20%
                    text = truncated_text[:last_period + 1]
                else:
                    text = truncated_text + "..."
                logger.info(f"Truncated text length: {len(text)} characters")
            
            logger.info(f"Generating speech for text of length {len(text)} with voice '{voice}' at speed {speed}")
            
            # Enhanced horror-specific instructions for gpt-4o-mini-tts
            try:
                horror_instructions = (
                    "このホラー小説を深く不気味な声で読み上げてください。"
                    "恐怖場面では声を低く、ささやくように読み、"
                    "サスペンス場面では劇的な間を取り、"
                    "緊張を高めるためにゆっくりと話してください。"
                    "感情を込めて、聞き手を恐怖の世界に引き込んでください。"
                )
                
                response = self.client.audio.speech.create(
                    model="gpt-4o-mini-tts",
                    voice=voice,
                    input=text,
                    instructions=horror_instructions,
                    speed=max(0.7, speed - 0.1),  # Slightly slower for horror atmosphere
                    response_format=response_format
                )
                logger.info("TTS API call successful with horror instructions")
            except Exception as e:
                logger.error(f"TTS API call failed: {str(e)}")
                # Fallback to basic TTS model if gpt-4o-mini-tts fails
                logger.info("Falling back to tts-1 model...")
                response = self.client.audio.speech.create(
                    model="tts-1",
                    voice=voice,
                    input=text,
                    speed=speed,
                    response_format=response_format
                )
            
            # Get audio content as bytes
            audio_content = response.content
            logger.info(f"Successfully generated speech, audio size: {len(audio_content)} bytes")
            
            return audio_content
            
        except Exception as e:
            logger.error(f"Error generating speech: {str(e)}")
            raise Exception(f"Failed to generate speech: {str(e)}")
    
    def clean_text_for_speech(self, text: str) -> str:
        """
        Clean and prepare text for speech synthesis
        
        Args:
            text (str): Raw text to clean
            
        Returns:
            str: Cleaned text suitable for TTS
        """
        # Remove markdown formatting
        cleaned = text
        cleaned = cleaned.replace('**', '')  # Remove bold markers
        cleaned = cleaned.replace('*', '')   # Remove italic markers  
        cleaned = cleaned.replace('`', '')   # Remove code markers
        cleaned = cleaned.replace('#', '')   # Remove headers
        cleaned = cleaned.replace('---', '') # Remove horizontal rules
        
        # Replace multiple spaces/newlines with single spaces
        import re
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()
        
        return cleaned
    
    def split_text_for_tts(self, text: str, safe_char_limit: int = 2300) -> list[str]:
        """
        Split text into chunks suitable for TTS generation
        
        Args:
            text (str): Text to split
            safe_char_limit (int): Maximum characters per chunk
            
        Returns:
            list[str]: List of text chunks
        """
        if len(text) <= safe_char_limit:
            return [text]
        
        chunks = []
        remaining_text = text
        
        while len(remaining_text) > safe_char_limit:
            # Find a good breaking point within the safe limit
            chunk = remaining_text[:safe_char_limit]
            
            # Look for sentence endings
            break_points = [
                chunk.rfind('。'),
                chunk.rfind('.'),
                chunk.rfind('！'),
                chunk.rfind('？'),
                chunk.rfind('\n\n'),
                chunk.rfind('\n')
            ]
            
            best_break = max([bp for bp in break_points if bp > safe_char_limit * 0.7])
            
            if best_break > 0:
                chunks.append(remaining_text[:best_break + 1].strip())
                remaining_text = remaining_text[best_break + 1:].strip()
            else:
                # No good break point found, force split
                chunks.append(chunk + "...")
                remaining_text = remaining_text[safe_char_limit:]
        
        # Add the remaining text
        if remaining_text.strip():
            chunks.append(remaining_text.strip())
        
        return chunks
    
    async def generate_speech_chunks(
        self, 
        text: str, 
        voice: str = "onyx", 
        speed: float = 0.8,
        response_format: str = "mp3"
    ) -> list[bytes]:
        """
        Generate speech from text in multiple chunks
        
        Returns:
            list[bytes]: List of audio chunks
        """
        if not self.enabled or not self.client:
            raise Exception("TTS service is not available. Please check OPENAI_API_KEY configuration.")
        
        # Split text into chunks
        chunks = self.split_text_for_tts(text)
        logger.info(f"Splitting text into {len(chunks)} chunks for TTS generation")
        
        audio_chunks = []
        for i, chunk in enumerate(chunks):
            logger.info(f"Generating audio for chunk {i+1}/{len(chunks)}")
            audio_content = await self.generate_speech(
                text=chunk,
                voice=voice,
                speed=speed,
                response_format=response_format
            )
            audio_chunks.append(audio_content)
        
        return audio_chunks

    def save_audio_file(self, audio_content: bytes, story_id: str, chunk_id: Optional[int] = None) -> str:
        """
        Save audio content to disk and return the file URL
        
        Args:
            audio_content (bytes): Audio content to save
            story_id (str): Story ID for filename
            chunk_id (Optional[int]): Chunk ID if this is part of a series
            
        Returns:
            str: URL path to the saved audio file
        """
        # Create audio directory if it doesn't exist
        audio_dir = "static/audio"
        os.makedirs(audio_dir, exist_ok=True)
        
        # Generate filename
        if chunk_id is not None:
            filename = f"{story_id}_chunk_{chunk_id}.mp3"
        else:
            filename = f"{story_id}_complete.mp3"
        
        file_path = os.path.join(audio_dir, filename)
        
        # Save audio content to file
        with open(file_path, 'wb') as f:
            f.write(audio_content)
        
        logger.info(f"Audio file saved: {file_path} ({len(audio_content)} bytes)")
        
        # Return URL path (will be served by FastAPI static files)
        return f"/static/audio/{filename}"

    def generate_cache_key(self, text: str, voice: str, speed: float) -> str:
        """Generate a cache key for audio content"""
        content = f"{text}_{voice}_{speed}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get_cached_audio_url(self, story_id: str, chunk_id: Optional[int] = None) -> Optional[str]:
        """Check if audio file already exists and return URL"""
        audio_dir = "static/audio"
        
        if chunk_id is not None:
            filename = f"{story_id}_chunk_{chunk_id}.mp3"
        else:
            filename = f"{story_id}_complete.mp3"
        
        file_path = os.path.join(audio_dir, filename)
        
        if os.path.exists(file_path):
            logger.info(f"Found cached audio file: {file_path}")
            return f"/static/audio/{filename}"
        
        return None 