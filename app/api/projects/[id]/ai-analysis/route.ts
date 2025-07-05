import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface AIAnalysisInput {
  startup_name: string
  category: string
  description: string
}

interface AIAnalysisResponse {
  percentage: number
  confidence_score: number
  factors: string[]
  recommendations: string[]
  analysis_date: string
}

interface RiskAnalysisResponse extends AIAnalysisResponse {
  risk_level: string
  risk_categories: Record<string, number>
}

interface MarketSizeResponse extends AIAnalysisResponse {
  market_potential: string
  growth_rate: number
}

interface OriginalityResponse extends AIAnalysisResponse {
  originality_level: string
  similar_projects: string[]
}

// AI API base URL - Update this to match your AI service URL
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || 'http://localhost:8000'

async function callAIEndpoint(endpoint: string, data: AIAnalysisInput): Promise<any> {
  try {
    const response = await fetch(`${AI_API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error calling AI endpoint ${endpoint}:`, error)
    throw error
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const projectId = parseInt(resolvedParams.id)

    // Get project data from database
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        projeAdi: true,
        projeKonusu: true,
        projeOzeti: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Proje bulunamadı!' },
        { status: 404 }
      )
    }

    // Prepare AI analysis input
    const aiInput: AIAnalysisInput = {
      startup_name: project.projeAdi,
      category: project.projeKonusu,
      description: project.projeOzeti
    }

    // Call all AI endpoints in parallel
    const [riskResponse, marketResponse, originalityResponse] = await Promise.allSettled([
      callAIEndpoint('/riskcalc', aiInput),
      callAIEndpoint('/marketsize', aiInput),
      callAIEndpoint('/originality', aiInput)
    ])

    // Handle results and prepare response
    const results = {
      risk: {
        percentage: 65, // Default fallback
        success: false,
        error: null as string | null
      },
      marketSize: {
        percentage: 55, // Default fallback
        success: false,
        error: null as string | null
      },
      originality: {
        percentage: 75, // Default fallback
        success: false,
        error: null as string | null
      }
    }

    // Process risk analysis result
    if (riskResponse.status === 'fulfilled') {
      results.risk.percentage = riskResponse.value.percentage
      results.risk.success = true
    } else {
      results.risk.error = riskResponse.reason?.message || 'Risk analysis failed'
      console.error('Risk analysis failed:', riskResponse.reason)
    }

    // Process market size result
    if (marketResponse.status === 'fulfilled') {
      results.marketSize.percentage = marketResponse.value.percentage
      results.marketSize.success = true
    } else {
      results.marketSize.error = marketResponse.reason?.message || 'Market size analysis failed'
      console.error('Market size analysis failed:', marketResponse.reason)
    }

    // Process originality result
    if (originalityResponse.status === 'fulfilled') {
      results.originality.percentage = originalityResponse.value.percentage
      results.originality.success = true
    } else {
      results.originality.error = originalityResponse.reason?.message || 'Originality analysis failed'
      console.error('Originality analysis failed:', originalityResponse.reason)
    }

    // Return combined results
    return NextResponse.json({
      success: true,
      data: {
        risk: results.risk.percentage,
        marketSize: results.marketSize.percentage,
        originality: results.originality.percentage,
        // Competition can be calculated as inverse of originality or separate metric
        competition: Math.max(0, 100 - results.originality.percentage)
      },
      details: {
        risk: results.risk,
        marketSize: results.marketSize,
        originality: results.originality
      }
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { 
        error: 'AI analizi sırasında hata oluştu!',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 