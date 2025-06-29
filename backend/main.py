from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Your Horror Nobel API", version="1.0.0")

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

@app.get("/")
async def root():
    return {"message": "Your Horror Nobel API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

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

@app.post("/stories/{story_id}/finish")
async def finish_story(story_id: str, finish_data: FinishStory):
    """Finish story and send PDF via email"""
    try:
        # Get story from Firestore  
        story = await firestore_service.get_story(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Check if email has already been used (skip in development mode)
        dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
        if not dev_mode and await firestore_service.is_email_used(finish_data.email):
            raise HTTPException(
                status_code=400, 
                detail="This email address has already been used to receive a story"
            )
        
        # Generate final story text
        final_story = await gemini_service.generate_final_story(
            story.get("quizAnswers", {}),
            story.get("chatHistory", [])
        )
        
        # Generate PDF
        pdf_content = pdf_service.generate_pdf(final_story)
        
        # Send email with PDF attachment
        await email_service.send_story_email(finish_data.email, pdf_content)
        
        # Update story in Firestore
        await firestore_service.update_story(story_id, {
            "email": finish_data.email,
            "novel": final_story,
            "status": "completed",
            "updatedAt": datetime.now()
        })
        
        return {"message": "PDFの生成と送信処理を受け付けました。"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finishing story: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to finish story")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)