from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import Dict, List, Optional
import os
import uuid
from datetime import datetime
import logging

from services.firestore_service import FirestoreService
from services.gemini_service import GeminiService
from services.pdf_service import PDFService
from services.email_service import EmailService
from services.tts_service import TTSService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Your Horror Nobel API", version="1.0.0")

# Create audio directory if it doesn't exist
AUDIO_DIR = "static/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
firestore_service = FirestoreService()
gemini_service = GeminiService()
pdf_service = PDFService()
email_service = EmailService()

# Initialize TTS service with error handling
try:
    tts_service = TTSService()
except Exception as e:
    logger.warning(f"Failed to initialize TTS service: {str(e)}")
    tts_service = None

# Pydantic models
class QuizAnswers(BaseModel):
    quizAnswers: Dict[str, str]

class ChatMessage(BaseModel):
    message: str

class FinishStory(BaseModel):
    email: EmailStr

class ChatHistory(BaseModel):
    role: str
    content: str

class TTSRequest(BaseModel):
    voice: Optional[str] = "onyx"
    speed: Optional[float] = 0.8

@app.get("/")
async def root():
    return {"message": "Your Horror Nobel API"}

@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {"status": "healthy", "tts_enabled": tts_service.enabled if tts_service else False}

@app.post("/stories")
async def create_story(quiz_data: QuizAnswers):
    """Start a new story based on quiz answers"""
    try:
        story_id = str(uuid.uuid4())
        
        # Generate initial story message using Gemini
        initial_message = await gemini_service.generate_initial_story(quiz_data.quizAnswers)
        
        # Create story document in Firestore
        story_data = {
            "quizAnswers": quiz_data.quizAnswers,
            "chatHistory": [{"role": "model", "content": initial_message}],
            "status": "in_progress",
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        await firestore_service.create_story(story_id, story_data)
        
        return {
            "storyId": story_id,
            "initialMessage": initial_message
        }
    
    except Exception as e:
        logger.error(f"Error creating story: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create story")

@app.post("/stories/{story_id}/chat")
async def send_chat_message(story_id: str, chat_data: ChatMessage):
    """Send a chat message and get AI response"""
    try:
        # Get story from Firestore
        story = await firestore_service.get_story(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Add user message to chat history
        chat_history = story.get("chatHistory", [])
        chat_history.append({"role": "user", "content": chat_data.message})
        
        # Generate AI response
        ai_response = await gemini_service.generate_response(
            story.get("quizAnswers", {}), 
            chat_history
        )
        
        # Add AI response to chat history
        chat_history.append({"role": "model", "content": ai_response})
        
        # Update story in Firestore
        await firestore_service.update_story(story_id, {
            "chatHistory": chat_history,
            "updatedAt": datetime.now()
        })
        
        return {"reply": ai_response}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process message")

@app.post("/stories/{story_id}/complete")
async def complete_story(story_id: str):
    """Complete story and generate final novel text"""
    try:
        # Get story from Firestore  
        story = await firestore_service.get_story(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Check if story is already completed
        if story.get("status") == "completed" and story.get("novel"):
            logger.info(f"Story {story_id} already completed, returning existing novel")
            return {
                "message": "Story already completed",
                "novel": story.get("novel")
            }
        
        # Generate final story text
        final_story = await gemini_service.generate_final_story(
            story.get("quizAnswers", {}),
            story.get("chatHistory", [])
        )
        
        # Update story in Firestore with completed novel
        await firestore_service.update_story(story_id, {
            "novel": final_story,
            "status": "completed",
            "updatedAt": datetime.now(),
            # Clear any cached audio info when story is regenerated
            "audioUrl": None,
            "audioChunks": None
        })
        
        return {
            "message": "Story completed successfully",
            "novel": final_story
        }
    
    except Exception as e:
        logger.error(f"Error completing story: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete story")

@app.post("/stories/{story_id}/send-email")
async def send_story_email(story_id: str, finish_data: FinishStory):
    """Send completed story as PDF via email"""
    try:
        # Get story from Firestore  
        story = await firestore_service.get_story(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Check if story is completed
        if story.get("status") != "completed" or not story.get("novel"):
            raise HTTPException(status_code=400, detail="Story is not completed yet")
        
        # Check if email has already been used (skip in development mode)
        dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
        if not dev_mode and await firestore_service.is_email_used(finish_data.email):
            raise HTTPException(
                status_code=400, 
                detail="This email address has already been used to receive a story"
            )
        
        # Generate PDF from completed novel
        final_story = story.get("novel")
        pdf_content = pdf_service.generate_pdf(final_story)
        
        # Send email with PDF attachment
        await email_service.send_story_email(finish_data.email, pdf_content)
        
        # Update story in Firestore with email
        await firestore_service.update_story(story_id, {
            "email": finish_data.email,
            "updatedAt": datetime.now()
        })
        
        return {"message": "PDFの生成と送信処理を受け付けました。"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending story email: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send story email")

@app.post("/stories/{story_id}/generate-audio")
async def generate_story_audio(story_id: str, tts_request: TTSRequest = TTSRequest()):
    """Generate audio narration of the completed story using OpenAI TTS"""
    logger.info(f"Received audio generation request for story: {story_id}")
    logger.info(f"TTS request: voice={tts_request.voice}, speed={tts_request.speed}")
    
    try:
        # Check if TTS service is available
        if not tts_service or not tts_service.enabled:
            logger.error("TTS service is not available or not enabled")
            raise HTTPException(
                status_code=503, 
                detail="TTS service is not available. Please configure OPENAI_API_KEY."
            )
        
        # Get story from Firestore
        story = await firestore_service.get_story(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Check if story is completed
        if story.get("status") != "completed" or not story.get("novel"):
            raise HTTPException(status_code=400, detail="Story is not completed yet")
        
        # Check if audio already exists in cache
        cached_audio_url = tts_service.get_cached_audio_url(story_id)
        if cached_audio_url and story.get("audioUrl"):
            logger.info(f"Returning cached audio URL for story {story_id}")
            return {
                "audioUrl": cached_audio_url,
                "cached": True,
                "message": "音声ファイルはキャッシュから取得されました"
            }
        
        # Get the completed novel text
        novel_text = story.get("novel")
        logger.info(f"Retrieved novel text, length: {len(novel_text) if novel_text else 0} characters")
        
        if not novel_text:
            logger.error("Novel text is empty or None")
            raise HTTPException(status_code=400, detail="Novel text not found or empty")
        
        # Clean and prepare text for TTS
        cleaned_text = tts_service.clean_text_for_speech(novel_text)
        logger.info(f"Cleaned text length: {len(cleaned_text)} characters")
        
        # Generate audio using OpenAI TTS
        logger.info("Starting OpenAI TTS generation...")
        audio_content = await tts_service.generate_speech(
            text=cleaned_text,
            voice=tts_request.voice,
            speed=tts_request.speed,
            response_format="mp3"
        )
        logger.info(f"TTS generation completed, audio size: {len(audio_content)} bytes")
        
        # Save audio file to disk
        audio_url = tts_service.save_audio_file(audio_content, story_id)
        
        # Update Firestore with audio URL
        await firestore_service.update_story(story_id, {
            "audioUrl": audio_url,
            "audioSettings": {
                "voice": tts_request.voice,
                "speed": tts_request.speed
            },
            "updatedAt": datetime.now()
        })
        
        logger.info(f"Audio generated and saved for story {story_id}: {audio_url}")
        
        return {
            "audioUrl": audio_url,
            "cached": False,
            "message": "音声ファイルが正常に生成されました"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating story audio: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate story audio")

@app.get("/stories/{story_id}/audio-chunks-info")
async def get_audio_chunks_info(story_id: str):
    """Get information about audio chunks for the story"""
    try:
        # Check if TTS service is available
        if not tts_service or not tts_service.enabled:
            raise HTTPException(status_code=503, detail="TTS service is not available")
        
        # Get story from Firestore
        story = await firestore_service.get_story(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Check if story is completed
        if story.get("status") != "completed" or not story.get("novel"):
            raise HTTPException(status_code=400, detail="Story is not completed yet")
        
        # Get the completed novel text
        novel_text = story.get("novel")
        cleaned_text = tts_service.clean_text_for_speech(novel_text)
        chunks = tts_service.split_text_for_tts(cleaned_text)
        
        return {
            "total_chunks": len(chunks),
            "chunks_info": [
                {
                    "chunk_id": i,
                    "length": len(chunk),
                    "preview": chunk[:100] + "..." if len(chunk) > 100 else chunk
                }
                for i, chunk in enumerate(chunks)
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting audio chunks info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get audio chunks info")

@app.post("/stories/{story_id}/generate-audio-chunk/{chunk_id}")
async def generate_story_audio_chunk(story_id: str, chunk_id: int, tts_request: TTSRequest = TTSRequest()):
    """Generate audio for a specific chunk of the story"""
    logger.info(f"Received audio chunk generation request for story: {story_id}, chunk: {chunk_id}")
    
    try:
        # Check if TTS service is available
        if not tts_service or not tts_service.enabled:
            raise HTTPException(status_code=503, detail="TTS service is not available")
        
        # Get story from Firestore
        story = await firestore_service.get_story(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Check if story is completed
        if story.get("status") != "completed" or not story.get("novel"):
            raise HTTPException(status_code=400, detail="Story is not completed yet")
        
        # Check if this chunk is already cached
        cached_chunk_url = tts_service.get_cached_audio_url(story_id, chunk_id)
        if cached_chunk_url:
            logger.info(f"Returning cached audio chunk {chunk_id} for story {story_id}")
            return {
                "audioUrl": cached_chunk_url,
                "chunkId": chunk_id,
                "cached": True
            }
        
        # Get the completed novel text and split into chunks
        novel_text = story.get("novel")
        cleaned_text = tts_service.clean_text_for_speech(novel_text)
        chunks = tts_service.split_text_for_tts(cleaned_text)
        
        if chunk_id >= len(chunks):
            raise HTTPException(status_code=400, detail="Chunk ID out of range")
        
        # Generate audio for the specific chunk
        chunk_text = chunks[chunk_id]
        logger.info(f"Generating audio for chunk {chunk_id}, length: {len(chunk_text)} characters")
        
        audio_content = await tts_service.generate_speech(
            text=chunk_text,
            voice=tts_request.voice,
            speed=tts_request.speed,
            response_format="mp3"
        )
        
        logger.info(f"Chunk {chunk_id} audio generation completed, size: {len(audio_content)} bytes")
        
        # Save chunk audio file to disk
        chunk_audio_url = tts_service.save_audio_file(audio_content, story_id, chunk_id)
        
        # Update audio chunks info in Firestore - 安全に処理
        audio_chunks = story.get("audioChunks") or {}
        audio_chunks[str(chunk_id)] = {
            "audioUrl": chunk_audio_url,
            "settings": {
                "voice": tts_request.voice,
                "speed": tts_request.speed
            }
        }
        
        await firestore_service.update_story(story_id, {
            "audioChunks": audio_chunks,
            "updatedAt": datetime.now()
        })
        
        return {
            "audioUrl": chunk_audio_url,
            "chunkId": chunk_id,
            "cached": False
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating story audio chunk: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate story audio chunk")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)