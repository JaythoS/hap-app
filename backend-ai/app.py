from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import uvicorn
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Project Analysis API",
    description="AI-powered project analysis for risk, market size, and originality assessment",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class StartupAnalysisInput(BaseModel):
    startup_name: str
    category: str  # Any category description - AI will match to dataset categories
    description: str
    
class AnalysisResponse(BaseModel):
    percentage: float
    confidence_score: float
    factors: List[str]
    recommendations: List[str]
    analysis_date: datetime
    
class RiskAnalysisResponse(AnalysisResponse):
    risk_level: str  # "Low", "Medium", "High"
    risk_categories: Dict[str, float]
    
class MarketSizeResponse(AnalysisResponse):
    market_potential: str  # "Small", "Medium", "Large"
    growth_rate: float
    
class OriginalityResponse(AnalysisResponse):
    originality_level: str  # "Low", "Medium", "High"
    similar_projects: List[str]

@app.get("/")
async def root():
    return {"message": "Project Analysis API", "version": "1.0.0"}

@app.post("/riskcalc", response_model=RiskAnalysisResponse)
async def calculate_risk(startup_data: StartupAnalysisInput):
    """
    Calculate startup risk percentage based on category and funding patterns
    
    Analyzes:
    - Category success rates
    - Funding vs status correlations
    - Historical performance patterns
    """
    try:
        # Validate input
        if not startup_data.startup_name.strip():
            raise HTTPException(status_code=400, detail="Startup name is required")
        if not startup_data.category.strip():
            raise HTTPException(status_code=400, detail="Category is required")
        if not startup_data.description.strip():
            raise HTTPException(status_code=400, detail="Description is required")
        
        # Calculate risk
        risk_factors = await analyze_risk_factors(startup_data)
        risk_percentage = calculate_risk_percentage(risk_factors)
        
        return RiskAnalysisResponse(
            percentage=risk_percentage,
            confidence_score=risk_factors.get("confidence_score", 85.0),
            factors=risk_factors.get("factors", []),
            recommendations=risk_factors.get("recommendations", []),
            analysis_date=datetime.now(),
            risk_level=determine_risk_level(risk_percentage),
            risk_categories=risk_factors.get("categories", {})
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error in risk calculation: {str(e)}")
        raise HTTPException(status_code=500, detail="Risk calculation failed")

@app.post("/marketsize", response_model=MarketSizeResponse)
async def calculate_market_size(startup_data: StartupAnalysisInput):
    """
    Calculate market size potential based on category funding patterns
    
    Analyzes:
    - Category funding statistics
    - Investment trends
    - Market penetration indicators
    """
    try:
        # Validate input
        if not startup_data.startup_name.strip():
            raise HTTPException(status_code=400, detail="Startup name is required")
        if not startup_data.category.strip():
            raise HTTPException(status_code=400, detail="Category is required")
        if not startup_data.description.strip():
            raise HTTPException(status_code=400, detail="Description is required")
        
        market_analysis = await analyze_market_size(startup_data)
        market_percentage = calculate_market_percentage(market_analysis)
        
        return MarketSizeResponse(
            percentage=market_percentage,
            confidence_score=market_analysis.get("confidence_score", 78.0),
            factors=market_analysis.get("factors", []),
            recommendations=market_analysis.get("recommendations", []),
            analysis_date=datetime.now(),
            market_potential=determine_market_potential(market_percentage),
            growth_rate=market_analysis.get("growth_rate", 10.0)
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error in market size calculation: {str(e)}")
        raise HTTPException(status_code=500, detail="Market size calculation failed")

@app.post("/originality", response_model=OriginalityResponse)
async def calculate_originality(startup_data: StartupAnalysisInput):
    """
    Calculate startup originality using category frequency and AI description analysis
    
    Analyzes:
    - Category frequency (market saturation)
    - AI-powered description uniqueness
    - Innovation assessment
    - Differentiation factors
    """
    try:
        # Validate input
        if not startup_data.startup_name.strip():
            raise HTTPException(status_code=400, detail="Startup name is required")
        if not startup_data.category.strip():
            raise HTTPException(status_code=400, detail="Category is required")
        if not startup_data.description.strip():
            raise HTTPException(status_code=400, detail="Description is required")
        
        originality_analysis = await analyze_originality(startup_data)
        originality_percentage = calculate_originality_percentage(originality_analysis)
        
        return OriginalityResponse(
            percentage=originality_percentage,
            confidence_score=originality_analysis.get("confidence_score", 82.0),
            factors=originality_analysis.get("factors", []),
            recommendations=originality_analysis.get("recommendations", []),
            analysis_date=datetime.now(),
            originality_level=determine_originality_level(originality_percentage),
            similar_projects=originality_analysis.get("similar_projects", [])
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error in originality calculation: {str(e)}")
        raise HTTPException(status_code=500, detail="Originality calculation failed")

# Helper functions (now using AI services)
async def analyze_risk_factors(startup_data: StartupAnalysisInput) -> Dict[str, Any]:
    """Analyze risk factors using AI"""
    from ai_services import ai_analyzer
    
    startup_dict = startup_data.dict()
    return await ai_analyzer.analyze_project_risk(startup_dict)

def calculate_risk_percentage(risk_factors: Dict[str, Any]) -> float:
    """Calculate overall risk percentage"""
    return risk_factors.get("percentage", 65.0)

def determine_risk_level(percentage: float) -> str:
    """Determine risk level based on percentage"""
    if percentage < 30:
        return "Low"
    elif percentage < 70:
        return "Medium"
    else:
        return "High"

async def analyze_market_size(startup_data: StartupAnalysisInput) -> Dict[str, Any]:
    """Analyze market size using AI"""
    from ai_services import ai_analyzer
    
    startup_dict = startup_data.dict()
    return await ai_analyzer.analyze_market_size(startup_dict)

def calculate_market_percentage(market_analysis: Dict[str, Any]) -> float:
    """Calculate market size percentage"""
    return market_analysis.get("percentage", 72.0)

def determine_market_potential(percentage: float) -> str:
    """Determine market potential based on percentage"""
    if percentage < 40:
        return "Small"
    elif percentage < 75:
        return "Medium"
    else:
        return "Large"

async def analyze_originality(startup_data: StartupAnalysisInput) -> Dict[str, Any]:
    """Analyze originality using AI"""
    from ai_services import ai_analyzer
    
    startup_dict = startup_data.dict()
    return await ai_analyzer.analyze_originality(startup_dict)

def calculate_originality_percentage(originality_analysis: Dict[str, Any]) -> float:
    """Calculate originality percentage"""
    return originality_analysis.get("percentage", 78.0)

def determine_originality_level(percentage: float) -> str:
    """Determine originality level based on percentage"""
    if percentage < 30:
        return "Low"
    elif percentage < 70:
        return "Medium"
    else:
        return "High"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 