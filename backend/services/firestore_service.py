from google.cloud import firestore
from typing import Dict, Any, Optional
import os
import logging

logger = logging.getLogger(__name__)

class FirestoreService:
    def __init__(self):
        # Initialize Firestore client
        # The service account key should be set via GOOGLE_APPLICATION_CREDENTIALS env var
        # or via default credentials in GCP
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        
        try:
            self.db = firestore.Client(project=project_id)
            self.stories_collection = self.db.collection("stories")
            logger.info(f"Firestore client initialized for project: {project_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Firestore client: {str(e)}")
            # For development, continue without Firestore
            logger.warning("Continuing without Firestore for development purposes")
            self.db = None
            self.stories_collection = None

    async def create_story(self, story_id: str, story_data: Dict[str, Any]) -> None:
        """Create a new story document"""
        if self.db is None:
            logger.warning(f"Firestore not available, skipping story creation: {story_id}")
            return
            
        try:
            doc_ref = self.stories_collection.document(story_id)
            doc_ref.set(story_data)
            logger.info(f"Created story with ID: {story_id}")
        except Exception as e:
            logger.error(f"Error creating story: {str(e)}")
            # For development, don't fail
            logger.warning("Continuing without Firestore for development purposes")
            return

    async def get_story(self, story_id: str) -> Optional[Dict[str, Any]]:
        """Get a story document by ID"""
        if self.db is None:
            logger.warning(f"Firestore not available, returning mock story data: {story_id}")
            # Return mock data for development
            return {
                "quizAnswers": {},
                "chatHistory": [],
                "status": "in_progress",
                "createdAt": None,
                "updatedAt": None
            }
            
        try:
            doc_ref = self.stories_collection.document(story_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting story: {str(e)}")
            # For development, return mock data
            logger.warning("Returning mock data for development purposes")
            return {
                "quizAnswers": {},
                "chatHistory": [],
                "status": "in_progress",
                "createdAt": None,
                "updatedAt": None
            }

    async def update_story(self, story_id: str, update_data: Dict[str, Any]) -> None:
        """Update a story document"""
        if self.db is None:
            logger.warning(f"Firestore not available, skipping story update: {story_id}")
            return
            
        try:
            doc_ref = self.stories_collection.document(story_id)
            doc_ref.update(update_data)
            logger.info(f"Updated story with ID: {story_id}")
        except Exception as e:
            logger.error(f"Error updating story: {str(e)}")
            # For development, don't fail
            logger.warning("Continuing without Firestore for development purposes")
            return

    async def is_email_used(self, email: str) -> bool:
        """Check if an email address has already been used"""
        if self.db is None:
            logger.warning(f"Firestore not available, allowing email: {email}")
            return False  # For development, always allow emails
            
        try:
            # Query for stories with the given email
            query = self.stories_collection.where(filter=firestore.FieldFilter("email", "==", email)).limit(1)
            docs = query.stream()
            
            # If any document exists, email has been used
            for _ in docs:
                return True
            return False
        except Exception as e:
            logger.error(f"Error checking email usage: {str(e)}")
            # For development, allow email
            logger.warning("Allowing email for development purposes")
            return False

    async def get_stories_by_email(self, email: str) -> list:
        """Get all stories for a given email (for admin purposes)"""
        if self.db is None:
            logger.warning(f"Firestore not available, returning empty list for email: {email}")
            return []
            
        try:
            query = self.stories_collection.where(filter=firestore.FieldFilter("email", "==", email))
            docs = query.stream()
            
            stories = []
            for doc in docs:
                story_data = doc.to_dict()
                story_data["id"] = doc.id
                stories.append(story_data)
            
            return stories
        except Exception as e:
            logger.error(f"Error getting stories by email: {str(e)}")
            # For development, return empty list
            logger.warning("Returning empty list for development purposes")
            return []