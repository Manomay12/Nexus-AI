from fastapi import APIRouter, HTTPException
from backend.models.schemas import CopilotChatRequest, CopilotChatResponse
from backend.services.rag_service import rag_service

router = APIRouter(prefix="/api/copilot", tags=["AI Copilot"])

@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(request: CopilotChatRequest):
    """
    Core AI Copilot Chat Endpoint:
    Combines live simulation telemetry, semantic knowledge search via pgvector,
    and Gemini tactical reasoning to generate explainable decision-support recommendations.
    """
    try:
        response = await rag_service.answer_with_context(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot inference error: {str(e)}")
