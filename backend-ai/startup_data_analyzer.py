import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import kagglehub
import logging
from datetime import datetime
import re
from functools import lru_cache

logger = logging.getLogger(__name__)

class StartupDataAnalyzer:
    def __init__(self):
        self.df = None
        self.success_rates = {}
        self.category_stats = {}
        self.regional_stats = {}
        self.funding_patterns = {}
        self._load_dataset()
    
    def _load_dataset(self):
        """Load and preprocess the Crunchbase dataset"""
        try:
            logger.info("Loading Crunchbase dataset...")
            # Download dataset files
            path = kagglehub.dataset_download("yanmaksi/big-startup-secsees-fail-dataset-from-crunchbase")
            
            # Find the CSV file in the downloaded path
            import os
            csv_files = [f for f in os.listdir(path) if f.endswith('.csv')]
            if not csv_files:
                raise FileNotFoundError("No CSV files found in the dataset")
            
            # Load the first CSV file
            csv_path = os.path.join(path, csv_files[0])
            logger.info(f"Loading CSV file: {csv_path}")
            self.df = pd.read_csv(csv_path)
            
            logger.info(f"Dataset loaded: {len(self.df)} records")
            logger.info(f"Dataset columns: {list(self.df.columns)}")
            self._preprocess_data()
            self._calculate_statistics()
        except Exception as e:
            logger.warning(f"Unable to load Kaggle dataset: {str(e)}")
            logger.info("Using fallback analysis without historical data")
            self.df = pd.DataFrame()  # Empty fallback - will use synthetic calculations
    
    def _preprocess_data(self):
        """Clean and preprocess the dataset"""
        if self.df.empty:
            return
        
        # Clean status column - Include operating companies as successful too
        # Original: only 'acquired' and 'ipo' considered successful
        # Updated: also include 'operating' as they are still active and viable
        self.df['is_success'] = self.df['status'].str.lower().isin(['acquired', 'ipo', 'operating'])
        
        # Parse categories
        self.df['categories'] = self.df['category_list'].fillna('').str.split(',')
        self.df['main_category'] = self.df['categories'].apply(
            lambda x: x[0].strip() if x and x[0] else 'Unknown'
        )
        
        # Clean funding amounts
        self.df['funding_total_usd'] = pd.to_numeric(
            self.df['funding_total_usd'], errors='coerce'
        ).fillna(0)
        
        # Parse dates
        for col in ['founded_at', 'first_funding_at', 'last_funding_at']:
            self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
        
        # Calculate time to funding
        self.df['days_to_funding'] = (
            self.df['first_funding_at'] - self.df['founded_at']
        ).dt.days
        
        # Calculate company age
        self.df['company_age_years'] = (
            (datetime.now() - self.df['founded_at']).dt.days / 365.25
        ).fillna(0)
    
    def _calculate_statistics(self):
        """Calculate success rates and patterns"""
        if self.df.empty:
            logger.warning("Dataset is empty - skipping statistics calculation")
            return
        
        logger.info("Calculating statistics...")
        
        # Category success rates
        self.success_rates['by_category'] = (
            self.df.groupby('main_category')['is_success']
            .agg(['mean', 'count'])
            .to_dict('index')
        )
        
        logger.info(f"Categories processed: {len(self.success_rates['by_category'])}")
        logger.info(f"Sample categories: {list(self.success_rates['by_category'].keys())[:10]}")
        
        # Regional success rates
        self.success_rates['by_region'] = (
            self.df.groupby('country_code')['is_success']
            .agg(['mean', 'count'])
            .to_dict('index')
        )
        
        # Funding patterns
        self.funding_patterns = {
            'avg_funding_success': self.df[self.df['is_success']]['funding_total_usd'].mean(),
            'avg_funding_fail': self.df[~self.df['is_success']]['funding_total_usd'].mean(),
            'avg_rounds_success': self.df[self.df['is_success']]['funding_rounds'].mean(),
            'avg_rounds_fail': self.df[~self.df['is_success']]['funding_rounds'].mean(),
        }
        
        logger.info("Statistics calculation completed")
    
    def calculate_risk_score(self, startup_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate risk score based on category and funding patterns"""
        if self.df.empty:
            return self._get_fallback_risk()
        
        factors = []
        recommendations = []
        
        # Get category and basic info
        category = startup_data.get('category', '').lower()
        startup_name = startup_data.get('startup_name', '')
        
        # Calculate category-based risk
        category_risk = self._get_category_risk_new(category)
        
        # Calculate funding vs status risk
        funding_risk = self._get_funding_status_risk(category)
        
        # Calculate overall risk (inverse of success rate)
        overall_risk = (category_risk + funding_risk) / 2
        
        # Add factors and recommendations
        if category_risk > 70:
            factors.append(f"High-risk category: {category}")
            recommendations.append("Consider market differentiation strategies")
        elif category_risk > 40:
            factors.append(f"Moderate-risk category: {category}")
            recommendations.append("Focus on execution excellence")
        else:
            factors.append(f"Low-risk category: {category}")
            recommendations.append("Leverage favorable market conditions")
        
        if funding_risk > 60:
            factors.append("Limited funding success in this category")
            recommendations.append("Prepare strong funding strategy")
        
        return {
            'percentage': max(0, min(100, overall_risk)),
            'factors': factors,
            'recommendations': recommendations,
            'categories': {
                'category_risk': category_risk,
                'funding_risk': funding_risk,
                'market_risk': (category_risk + funding_risk) / 2,
                'overall': overall_risk
            },
            'confidence_score': 85
        }
    
    def calculate_market_size(self, startup_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate market size based on category funding patterns and investment data"""
        if self.df.empty:
            logger.warning("Dataset is empty - using fallback market analysis")
            return self._get_fallback_market()
        
        factors = []
        recommendations = []
        
        # Get category
        category = startup_data.get('category', '').lower()
        logger.info(f"Calculating market size for category: '{category}'")
        
        # Calculate market size based on category funding data
        category_funding = self._get_category_funding_size(category)
        logger.info(f"Category funding size: {category_funding}%")
        
        # Calculate investment trends for this category
        investment_trend = self._get_category_investment_trend(category)
        logger.info(f"Investment trend: {investment_trend}%")
        
        # Calculate market size percentage (0-100)
        market_size = (category_funding * 0.7) + (investment_trend * 0.3)
        logger.info(f"Final market size: {market_size}%")
        
        # Add factors
        factors.append(f"Category funding patterns indicate {category_funding:.1f}% market potential")
        factors.append(f"Investment trends show {investment_trend:.1f}% growth momentum")
        
        # Add recommendations
        if market_size > 75:
            recommendations.append("Excellent market opportunity - consider aggressive scaling")
        elif market_size > 50:
            recommendations.append("Good market potential - focus on market penetration")
        elif market_size > 25:
            recommendations.append("Moderate market - consider niche positioning")
        else:
            recommendations.append("Limited market - explore pivoting or niche focus")
        
        # Growth rate based on category performance
        growth_rate = max(5, min(50, investment_trend))
        
        return {
            'percentage': max(0, min(100, market_size)),
            'factors': factors,
            'recommendations': recommendations,
            'growth_rate': growth_rate,
            'confidence_score': 78
        }
    
    def calculate_originality(self, startup_data: Dict[str, Any], ai_description_score: float = 60.0) -> Dict[str, Any]:
        """Calculate originality based on category frequency and AI description analysis"""
        if self.df.empty:
            return self._get_fallback_originality()
        
        factors = []
        recommendations = []
        
        # Get category and description
        category = startup_data.get('category', '').lower()
        description = startup_data.get('description', '')
        
        # Calculate category frequency uniqueness (lower frequency = higher uniqueness)
        category_uniqueness = self._get_category_uniqueness(category)
        
        # Use AI description analysis score
        description_uniqueness = ai_description_score
        
        # Combine both scores (50% category uniqueness, 50% description uniqueness)
        originality_score = (category_uniqueness * 0.5) + (description_uniqueness * 0.5)
        
        # Add factors
        factors.append(f"Category frequency analysis: {category_uniqueness:.1f}% uniqueness")
        factors.append(f"AI description analysis: {description_uniqueness:.1f}% uniqueness")
        
        # Add recommendations
        if originality_score > 80:
            recommendations.append("Exceptional uniqueness - consider IP protection and rapid scaling")
        elif originality_score > 60:
            recommendations.append("Good uniqueness - focus on differentiation and market positioning")
        elif originality_score > 40:
            recommendations.append("Moderate uniqueness - emphasize execution and timing advantages")
        else:
            recommendations.append("Limited uniqueness - pivot to innovative approach or niche market")
        
        # Similar projects based on category frequency
        similar_projects = self._find_similar_projects_by_category(category)
        
        return {
            'percentage': max(0, min(100, originality_score)),
            'factors': factors,
            'recommendations': recommendations,
            'similar_projects': similar_projects,
            'confidence_score': 82
        }
    
    def _get_category_risk_new(self, category: str) -> float:
        """Calculate category-specific risk based on success rates"""
        if not self.success_rates.get('by_category'):
            return 50  # Default moderate risk
        
        # Since we now use AI-determined exact category names, check for exact match first
        if category in self.success_rates['by_category']:
            success_rate = self.success_rates['by_category'][category]['mean']
            risk_percentage = (1 - success_rate) * 100
            return max(0, min(100, risk_percentage))
        
        # Fallback: Find similar category names (for cases where AI category doesn't exactly match dataset)
        for cat, stats in self.success_rates['by_category'].items():
            if category.lower() in cat.lower() or cat.lower() in category.lower():
                success_rate = stats['mean']
                risk_percentage = (1 - success_rate) * 100
                return max(0, min(100, risk_percentage))
        
        # If no match found, calculate average risk for similar words
        similar_categories = []
        category_words = set(category.lower().split())
        
        for cat, stats in self.success_rates['by_category'].items():
            cat_words = set(cat.lower().split())
            if category_words.intersection(cat_words):  # If any word matches
                similar_categories.append(stats['mean'])
        
        if similar_categories:
            avg_success_rate = sum(similar_categories) / len(similar_categories)
            risk_percentage = (1 - avg_success_rate) * 100
            return max(0, min(100, risk_percentage))
        
        return 50  # Default moderate risk for unknown categories
    
    def _get_funding_status_risk(self, category: str) -> float:
        """Calculate funding vs status risk for category"""
        if self.df.empty:
            return 50
        
        # Try exact match first (AI-determined category)
        exact_match_data = self.df[self.df['main_category'] == category]
        
        if not exact_match_data.empty:
            category_data = exact_match_data
        else:
            # Fallback: fuzzy matching
            category_data = self.df[
                self.df['main_category'].str.lower().str.contains(category.lower(), na=False)
            ]
        
        if category_data.empty:
            return 50
        
        # Calculate risk based on funding patterns and status
        if len(category_data) == 0:
            return 50
            
        funding_median = category_data['funding_total_usd'].median()
        high_funding_success = category_data[
            (category_data['funding_total_usd'] > funding_median) &
            (category_data['is_success'] == True)
        ]
        
        total_high_funding = category_data[
            category_data['funding_total_usd'] > funding_median
        ]
        
        if len(total_high_funding) > 0:
            success_rate = len(high_funding_success) / len(total_high_funding)
            risk_percentage = (1 - success_rate) * 100
            return max(0, min(100, risk_percentage))
        
        return 50
    
    def _get_category_funding_size(self, category: str) -> float:
        """Calculate market size based on category funding patterns"""
        if self.df.empty:
            logger.warning("_get_category_funding_size: Dataset is empty")
            return 50
        
        logger.info(f"_get_category_funding_size: Looking for category '{category}'")
        
        # Try exact match first (AI-determined category)
        exact_match_data = self.df[self.df['main_category'] == category]
        logger.info(f"Exact match found: {len(exact_match_data)} records")
        
        if not exact_match_data.empty:
            category_data = exact_match_data
        else:
            # Better fuzzy matching: split on pipes and check individual words
            category_words = set([word.strip().lower() for word in category.replace('|', ' ').split()])
            
            # Function to check if category matches
            def category_matches(row_category):
                if pd.isna(row_category):
                    return False
                row_words = set([word.strip().lower() for word in str(row_category).replace('|', ' ').split()])
                # Require at least 2 word matches or 1 exact match for broader categories
                common_words = category_words.intersection(row_words)
                return len(common_words) >= min(2, len(category_words))
            
            # Apply fuzzy matching
            mask = self.df['main_category'].apply(category_matches)
            category_data = self.df[mask]
            logger.info(f"Improved fuzzy match found: {len(category_data)} records")
        
        if category_data.empty:
            logger.warning(f"No data found for category '{category}'")
            return 50
        
        # Calculate funding statistics
        total_funding = category_data['funding_total_usd'].sum()
        logger.info(f"Total funding for category '{category}': ${total_funding:,.2f}")
        
        # Calculate percentile ranking compared to all categories
        all_categories = self.df.groupby('main_category')['funding_total_usd'].agg(['sum'])
        
        if len(all_categories) == 0:
            logger.warning("No categories found in dataset")
            return 50
        
        # Rank this category's funding
        category_rank = (all_categories['sum'] < total_funding).sum() / len(all_categories)
        percentile_score = max(0, min(100, category_rank * 100))
        
        logger.info(f"Category '{category}' rank: {category_rank:.3f}, percentile score: {percentile_score}%")
        
        # Convert to percentage (0-100)
        return percentile_score
    
    def _get_category_investment_trend(self, category: str) -> float:
        """Calculate investment trend for category"""
        if self.df.empty:
            logger.warning("_get_category_investment_trend: Dataset is empty")
            return 50
        
        logger.info(f"_get_category_investment_trend: Looking for category '{category}'")
        
        # Try exact match first (AI-determined category)
        exact_match_data = self.df[
            (self.df['main_category'] == category) &
            (self.df['first_funding_at'].notna())
        ]
        logger.info(f"Exact match with funding dates: {len(exact_match_data)} records")
        
        if not exact_match_data.empty:
            category_data = exact_match_data
        else:
            # Better fuzzy matching: split on pipes and check individual words
            category_words = set([word.strip().lower() for word in category.replace('|', ' ').split()])
            
            # Function to check if category matches
            def category_matches(row_category):
                if pd.isna(row_category):
                    return False
                row_words = set([word.strip().lower() for word in str(row_category).replace('|', ' ').split()])
                # Require at least 2 word matches or 1 exact match for broader categories
                common_words = category_words.intersection(row_words)
                return len(common_words) >= min(2, len(category_words))
            
            # Apply fuzzy matching with funding date filter
            mask = (
                self.df['main_category'].apply(category_matches) & 
                self.df['first_funding_at'].notna()
            )
            category_data = self.df[mask]
            logger.info(f"Improved fuzzy match with funding dates: {len(category_data)} records")
        
        if category_data.empty:
            logger.warning(f"No funding data found for category '{category}', returning 30%")
            return 30  # Lower trend for categories with no recent activity
        
        # Calculate trend based on recent funding activity
        # Try different recent thresholds to find meaningful data
        recent_thresholds = ['2020-01-01', '2018-01-01', '2015-01-01', '2010-01-01']
        trend_score = 30  # Default
        
        for threshold in recent_thresholds:
            recent_data = category_data[
                category_data['first_funding_at'] >= threshold
            ]
            
            logger.info(f"Recent data ({threshold}+): {len(recent_data)} out of {len(category_data)} total records")
            
            if len(recent_data) > 0:
                # Higher recent activity = higher trend score
                recent_ratio = len(recent_data) / len(category_data)
                trend_score = max(0, min(100, recent_ratio * 100))
                logger.info(f"Using threshold {threshold}: recent ratio: {recent_ratio:.3f}, trend score: {trend_score}%")
                break
        
        if trend_score == 30:
            logger.info("No recent funding activity found in any threshold, returning 30%")
        
        return trend_score
    
    def _get_category_uniqueness(self, category: str) -> float:
        """Calculate category uniqueness based on frequency"""
        if self.df.empty:
            return 50
        
        # Get category frequency
        category_counts = self.df['main_category'].value_counts()
        total_companies = len(self.df)
        
        # Try exact match first (AI-determined category)
        if category in category_counts:
            category_count = category_counts[category]
        else:
            # Fallback: find similar category
            category_count = 0
            for cat, count in category_counts.items():
                if category.lower() in cat.lower() or cat.lower() in category.lower():
                    category_count = count
                    break
        
        if category_count == 0:
            return 95  # Very unique if not found in dataset
        
        # Calculate uniqueness (inverse of frequency)
        frequency_percentage = (category_count / total_companies) * 100
        uniqueness = max(0, min(100, 100 - frequency_percentage * 2))  # Scale uniqueness
        
        return uniqueness
    
    def _find_similar_projects_by_category(self, category: str) -> List[str]:
        """Find similar projects based on category"""
        if self.df.empty:
            return ["No similar projects found"]
        
        # Try exact match first (AI-determined category)
        exact_match_data = self.df[self.df['main_category'] == category].head(3)
        
        if not exact_match_data.empty:
            category_data = exact_match_data
        else:
            # Fallback: fuzzy matching
            category_data = self.df[
                self.df['main_category'].str.lower().str.contains(category.lower(), na=False)
            ].head(3)
        
        similar = []
        for _, project in category_data.iterrows():
            name = project.get('name', 'Unknown Company')
            status = project.get('status', 'Unknown')
            similar.append(f"{name} - {status}")
        
        return similar or ["No similar projects found in this category"]
    
    def _get_fallback_risk(self) -> Dict[str, Any]:
        """Fallback risk analysis"""
        return {
            'percentage': 60,
            'factors': ["Limited historical data"],
            'recommendations': ["Conduct thorough market research"],
            'categories': {'technical': 30, 'market': 40, 'financial': 25, 'team': 20, 'timeline': 35},
            'confidence_score': 50
        }
    
    def _get_fallback_market(self) -> Dict[str, Any]:
        """Fallback market analysis"""
        return {
            'percentage': 55,
            'factors': ["Limited market data"],
            'recommendations': ["Validate market assumptions"],
            'growth_rate': 10,
            'confidence_score': 50
        }
    
    def _get_fallback_originality(self) -> Dict[str, Any]:
        """Fallback originality analysis"""
        return {
            'percentage': 60,
            'factors': ["Limited comparison data"],
            'recommendations': ["Research competitive landscape"],
            'similar_projects': ["Limited data available"],
            'confidence_score': 50
        }
    
    def get_available_categories(self) -> List[str]:
        """Get list of available categories for frontend validation"""
        if self.df.empty:
            return [
                "Technology", "Healthcare", "Finance", "E-commerce", "Education",
                "Entertainment", "Food & Beverage", "Transportation", "Real Estate",
                "Energy", "Manufacturing", "Agriculture", "Marketing", "Security"
            ]
        
        # Get unique categories from dataset
        categories = self.df['main_category'].dropna().unique().tolist()
        
        # Clean and sort categories
        categories = [cat.strip() for cat in categories if cat.strip()]
        categories.sort()
        
        return categories

    def get_all_categories_for_matching(self) -> List[str]:
        """Get all available categories from dataset for AI category matching"""
        if self.df.empty:
            return [
                "Technology", "Healthcare", "Finance", "E-commerce", "Education",
                "Entertainment", "Food & Beverage", "Transportation", "Real Estate",
                "Energy", "Manufacturing", "Agriculture", "Marketing", "Security",
                "Software", "Internet", "Mobile", "Biotechnology", "Clean Technology",
                "Financial Services", "Media", "Games", "Social Media", "Artificial Intelligence"
            ]
        
        # Get unique categories from dataset with more comprehensive coverage
        categories = self.df['main_category'].dropna().unique().tolist()
        
        # Also get from category_list for more comprehensive categories
        if 'category_list' in self.df.columns:
            all_category_lists = self.df['category_list'].dropna().tolist()
            for category_list in all_category_lists:
                if category_list and isinstance(category_list, str):
                    individual_cats = [cat.strip() for cat in category_list.split(',')]
                    categories.extend(individual_cats)
        
        # Clean, deduplicate and sort categories
        categories = list(set([cat.strip() for cat in categories if cat.strip()]))
        categories.sort()
        
        logger.info(f"Total available categories for matching: {len(categories)}")
        return categories

# Global instance
startup_analyzer = StartupDataAnalyzer() 