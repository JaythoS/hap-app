from typing import Dict, Any, List
import logging
from startup_data_analyzer import startup_analyzer
from openai import OpenAI
from config import settings

logger = logging.getLogger(__name__)

class AIAnalyzer:
    def __init__(self):
        self.data_analyzer = startup_analyzer
        try:
            self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI client: {str(e)}")
            self.openai_client = None
        
    async def analyze_project_risk(self, startup_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze startup risk using category and funding patterns
        """
        try:
            # Determine the best matching category using AI
            user_category = startup_data.get('category', '')
            description = startup_data.get('description', '')
            determined_category = await self.determine_best_category(user_category, description)
            
            # Update startup data with determined category
            updated_startup_data = startup_data.copy()
            updated_startup_data['category'] = determined_category
            updated_startup_data['original_category'] = user_category
            
            logger.info(f"Risk analysis: '{user_category}' → '{determined_category}'")
            return self.data_analyzer.calculate_risk_score(updated_startup_data)
        except Exception as e:
            logger.error(f"Error in data-driven risk analysis: {str(e)}")
            return self._get_fallback_risk_analysis()
    
    async def analyze_market_size(self, startup_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze market size using category funding patterns and investment trends
        """
        try:
            # Determine the best matching category using AI
            user_category = startup_data.get('category', '')
            description = startup_data.get('description', '')
            determined_category = await self.determine_best_category(user_category, description)
            
            # Update startup data with determined category
            updated_startup_data = startup_data.copy()
            updated_startup_data['category'] = determined_category
            updated_startup_data['original_category'] = user_category
            
            logger.info(f"Market analysis: '{user_category}' → '{determined_category}'")
            
            # Add debug logging to see what's happening
            result = self.data_analyzer.calculate_market_size(updated_startup_data)
            logger.info(f"Market size result for '{determined_category}': {result}")
            
            return result
        except Exception as e:
            logger.error(f"Error in data-driven market analysis: {str(e)}")
            return self._get_fallback_market_analysis()
    
    async def analyze_originality(self, startup_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze startup originality using category frequency and AI description analysis
        """
        try:
            # Determine the best matching category using AI
            user_category = startup_data.get('category', '')
            description = startup_data.get('description', '')
            determined_category = await self.determine_best_category(user_category, description)
            
            # Update startup data with determined category
            updated_startup_data = startup_data.copy()
            updated_startup_data['category'] = determined_category
            updated_startup_data['original_category'] = user_category
            
            # Get AI description analysis score
            ai_score = await self.analyze_description_uniqueness(description)
            
            logger.info(f"Originality analysis: '{user_category}' → '{determined_category}'")
            # Calculate originality with AI score
            return self.data_analyzer.calculate_originality(updated_startup_data, ai_score)
        except Exception as e:
            logger.error(f"Error in data-driven originality analysis: {str(e)}")
            return self._get_fallback_originality_analysis()
    
    async def analyze_description_uniqueness(self, description: str) -> float:
        """
        Analyze description uniqueness using OpenAI
        Returns a score from 0-100 indicating how unique the description is
        """
        if not self.openai_client:
            logger.warning("OpenAI client not initialized - returning default uniqueness score")
            return 60.0
        
        try:
            prompt = f"""
            Analyze the following startup description for uniqueness and innovation:
            
            "{description}"
            
            Rate the uniqueness on a scale from 0-100 where:
            - 0-30: Common, saturated market with many similar solutions
            - 31-60: Moderate uniqueness, some differentiation but not groundbreaking
            - 61-80: Good uniqueness, clear differentiation and innovation
            - 81-100: Exceptional uniqueness, highly innovative and rare approach
            
            Consider factors like:
            - Innovation in approach
            - Market differentiation
            - Technology novelty
            - Solution creativity
            
            Respond with only a number (0-100).
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0.3
            )
            
            score_text = response.choices[0].message.content.strip()
            score = float(score_text)
            return max(0, min(100, score))
            
        except Exception as e:
            logger.error(f"Error in OpenAI description analysis: {str(e)}")
            return 60.0  # Default score on error

    
    def _get_fallback_risk_analysis(self) -> Dict[str, Any]:
        """Fallback risk analysis when AI fails"""
        return {
            "percentage": 60,
            "factors": ["Market competition", "Technical complexity", "Financial constraints"],
            "recommendations": ["Conduct market research", "Build MVP", "Secure funding"],
            "categories": {"technical": 30, "market": 40, "financial": 25, "team": 20, "timeline": 35},
            "confidence_score": 50
        }
    
    def _get_fallback_market_analysis(self) -> Dict[str, Any]:
        """Fallback market analysis when AI fails"""
        return {
            "percentage": 55,
            "factors": ["Industry growth", "Target market size", "Competition level"],
            "recommendations": ["Research market trends", "Validate target audience", "Analyze competitors"],
            "growth_rate": 10,
            "confidence_score": 50
        }
    
    def _get_fallback_originality_analysis(self) -> Dict[str, Any]:
        """Fallback originality analysis when AI fails"""
        return {
            "percentage": 60,
            "factors": ["Solution approach", "Technology usage", "Market differentiation"],
            "recommendations": ["Strengthen unique value proposition", "Enhance differentiation", "Study competitors"],
            "similar_projects": ["Similar project 1 - 60%", "Similar project 2 - 45%"],
            "confidence_score": 50
        }

    async def determine_best_category(self, user_category: str, description: str) -> str:
        """
        Use AI to determine the best matching category from dataset based on user input
        
        Args:
            user_category: User's provided category (may be general or descriptive)
            description: Project description for additional context
            
        Returns:
            Best matching category from the dataset
        """
        if not self.openai_client:
            logger.warning("OpenAI client not initialized - using fallback category matching")
            return self._fallback_category_matching(user_category)
        
        try:
            # Get all available categories from dataset
            available_categories = self.data_analyzer.get_all_categories_for_matching()
            
            # Filter for simpler categories (prefer single-word or simple categories)
            simple_categories = []
            complex_categories = []
            
            for cat in available_categories:
                if '|' in cat:
                    # Count pipe separators - prefer categories with fewer separators
                    pipe_count = cat.count('|')
                    if pipe_count <= 2:  # Allow some complexity but not too much
                        complex_categories.append(cat)
                else:
                    simple_categories.append(cat)
            
            # Prefer simple categories, but include some complex ones for coverage
            preferred_categories = simple_categories[:30] + complex_categories[:20]
            
            if len(preferred_categories) > 50:
                preferred_categories = preferred_categories[:50]
            
            categories_text = ", ".join(preferred_categories)
            
            prompt = f"""
            You are a startup category classification expert. Given a user's category input and project description, 
            determine the best matching category from the available dataset categories.
            
            User's Category Input: "{user_category}"
            Project Description: "{description}"
            
            Available Categories from Dataset:
            {categories_text}
            
            Instructions:
            1. Analyze the user's category and description carefully
            2. Find the most appropriate category from the available list
            3. PREFER SIMPLER categories over complex pipe-separated ones when possible
            4. If user says "AI Education Platform", prefer "Education" over "3D Printing|Education|AI"
            5. If user says "Healthcare Tech", prefer "Healthcare" over complex combinations
            6. If user says "Financial App", prefer "Finance" over "3D Printing|Finance|Mobile"
            7. Only use complex categories if no simple alternative exists
            
            Respond with ONLY the exact category name from the available list that best matches.
            Do not add any explanation or additional text.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=30,
                temperature=0.1  # Low temperature for consistent categorization
            )
            
            determined_category = response.choices[0].message.content.strip()
            
            # Validate that the returned category is in our available categories
            if determined_category in available_categories:
                logger.info(f"AI determined category: '{determined_category}' for user input: '{user_category}'")
                return determined_category
            else:
                logger.warning(f"AI returned invalid category: '{determined_category}', using fallback")
                return self._fallback_category_matching(user_category)
                
        except Exception as e:
            logger.error(f"Error in AI category determination: {str(e)}")
            return self._fallback_category_matching(user_category)
    
    def _fallback_category_matching(self, user_category: str) -> str:
        """
        Fallback category matching using simple keyword matching
        """
        user_cat_lower = user_category.lower()
        
        # Enhanced category mappings with Turkish support
        category_mappings = {
            # AI and Technology
            'ai': 'Artificial Intelligence',
            'artificial intelligence': 'Artificial Intelligence',
            'machine learning': 'Artificial Intelligence',
            'yapay zeka': 'Artificial Intelligence',
            
            # Healthcare
            'healthcare': 'Healthcare',
            'health': 'Healthcare',
            'medical': 'Healthcare',
            'sağlık': 'Healthcare',
            'tıp': 'Healthcare',
            'biotech': 'Biotechnology',
            'biotechnology': 'Biotechnology',
            
            # Finance
            'finance': 'Finance',
            'financial': 'Finance',
            'fintech': 'Finance',
            'banking': 'Finance',
            'finansal': 'Finance',
            'bankacılık': 'Finance',
            
            # Education
            'education': 'Education',
            'learning': 'Education',
            'eğitim': 'Education',
            'öğrenim': 'Education',
            
            # Technology
            'tech': 'Technology',
            'technology': 'Technology',
            'teknoloji': 'Technology',
            'software': 'Software',
            'yazılım': 'Software',
            'mobile': 'Mobile',
            'mobil': 'Mobile',
            'internet': 'Internet',
            
            # E-commerce
            'ecommerce': 'E-commerce',
            'e-commerce': 'E-commerce',
            'retail': 'E-commerce',
            'perakende': 'E-commerce',
            'satış': 'E-commerce',
            
            # Gaming and Entertainment
            'gaming': 'Games',
            'games': 'Games',
            'oyun': 'Games',
            'entertainment': 'Entertainment',
            'eğlence': 'Entertainment',
            
            # Media and Social
            'media': 'Media',
            'medya': 'Media',
            'social': 'Social Media',
            'sosyal': 'Social Media',
            'sosyal medya': 'Social Media',
            'social media': 'Social Media',
            
            # Energy and Environment
            'energy': 'Energy',
            'enerji': 'Energy',
            'clean': 'Clean Technology',
            'temiz': 'Clean Technology',
            'green': 'Clean Technology',
            'yeşil': 'Clean Technology',
            'renewable': 'Clean Technology',
            'yenilenebilir': 'Clean Technology',
            'solar': 'Clean Technology',
            'güneş': 'Clean Technology',
            
            # Transportation
            'transportation': 'Transportation',
            'transport': 'Transportation',
            'ulaşım': 'Transportation',
            'taşımacılık': 'Transportation',
            
            # Food and Agriculture
            'food': 'Food and Beverage',
            'yemek': 'Food and Beverage',
            'agriculture': 'Agriculture',
            'tarım': 'Agriculture',
            
            # Apps and Mobile
            'app': 'Apps',
            'apps': 'Apps',
            'uygulama': 'Apps',
            'platform': 'Software'
        }
        
        # Try to find matching category
        for keyword, category in category_mappings.items():
            if keyword in user_cat_lower:
                logger.info(f"Fallback matched '{user_category}' to '{category}'")
                return category
        
        # Default fallback
        logger.info(f"No match found for '{user_category}', using 'Technology' as default")
        return 'Technology'

# Global AI analyzer instance
ai_analyzer = AIAnalyzer() 