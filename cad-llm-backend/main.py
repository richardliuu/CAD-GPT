from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from engine import GeminiEngine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

#CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini_engine = GeminiEngine()

class GeminiRequest(BaseModel):
    prompt: str
    model: str = "gemini-2.5-pro-exp-03-25"

@app.get("/")
def read_root():
    return {"message": "Hello!"}

@app.post("/api/generate")
async def generate_content(request: GeminiRequest):
    try:
        logger.info(f"Generating content with prompt: {request.prompt}")
        result = gemini_engine.generate_content(
            prompt=request.prompt,
            model=request.model
        )
        return {"result": result}
    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-cad")
async def generate_cad(request: GeminiRequest):
    try:
        logger.info(f"Generating CAD code with prompt: {request.prompt}")
        code = gemini_engine.generate_cad(
            prompt=request.prompt,
            model=request.model
        )
        return {"code": code}
    except Exception as e:
        logger.error(f"Error generating CAD code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/debug")
async def debug_request(request: Request):
    body = await request.body()
    logger.info(f"Raw request body: {body}")
    return {"received": body.decode()}