interface AIAnalysisRequest {
  cryptoName: string;
  symbol: string;
  currentPrice: number;
  priceChangePercent24h: number;
  marketCap: number;
  volume24h: number;
}

interface AIAnalysisResponse {
  analysis: string;
  isRealAnalysis: boolean;
  sources?: Array<{
    title: string;
    url: string;
    source: string;
  }>;
  error?: string;
}

// Cache for AI responses to avoid repeated API calls for same data
const analysisCache = new Map<string, { data: AIAnalysisResponse; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes cache

// Cache for latest successful AI responses (used as fallback)
const latestSuccessfulAnalysis = new Map<string, { analysis: string; timestamp: number; cryptoData: AIAnalysisRequest }>();
const FALLBACK_CACHE_DURATION = 3600000; // 1 hour for fallback cache

export const getAIAnalysis = async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  // Create cache key that changes every 5 minutes to allow fresh analysis
  const timestamp = Math.floor(Date.now() / 300000); // Change every 5 minutes
  const cacheKey = `${request.symbol}-${request.currentPrice.toFixed(2)}-${request.priceChangePercent24h.toFixed(2)}-${timestamp}`;
  const cached = analysisCache.get(cacheKey);
  const now = Date.now();
  
  // Return cached result if available and fresh
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  console.log('Starting AI analysis with web search for:', request.cryptoName);
  console.log('OpenAI API Key available:', !!import.meta.env.VITE_OPENAI_API_KEY);

  try {
    // Use OpenAI Web Search API
    const webSearchResult = await tryOpenAIWebSearchAPI(request);
    if (webSearchResult.analysis) {
      // Store successful analysis for fallback
      latestSuccessfulAnalysis.set(request.symbol, {
        analysis: webSearchResult.analysis,
        timestamp: now,
        cryptoData: request
      });
      analysisCache.set(cacheKey, { data: webSearchResult, timestamp: now });
      return webSearchResult;
    }
  } catch (error) {
    console.error('OpenAI Web Search API failed:', error);
  }

  // If web search API fails, return a proper error
  console.error('OpenAI Web Search API failed, no analysis available');
  throw new Error('AI analysis service is currently unavailable. Please check your OpenAI API configuration and try again.');
};

const tryOpenAIWebSearchAPI = async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key not configured');
    throw new Error('OpenAI API key not configured');
  }

  console.log('Attempting OpenAI Web Search API call for', request.cryptoName);
  const prompt = createWebSearchPrompt(request);
  
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      input: prompt,
      tools: [{"type": "web_search"}]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    console.error('OpenAI API error response:', errorData);
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  // Add debugging to see the actual response structure
  console.log('Full OpenAI response:', JSON.stringify(data, null, 2));

  // Find the message object in the output array (web search responses have multiple output items)
  const messageOutput = data.output?.find((item: any) => item.type === 'message');
  
  if (!messageOutput || !messageOutput.content || !Array.isArray(messageOutput.content)) {
    console.error('Invalid OpenAI response structure:', data);
    throw new Error('Invalid response from OpenAI Web Search API');
  }

  // Extract analysis text from content array
  let analysisText = '';
  let annotations: any[] = [];
  
  for (const contentItem of messageOutput.content) {
    if (contentItem.type === 'output_text' && contentItem.text) {
      analysisText += contentItem.text;
      // Get annotations from this content item
      if (contentItem.annotations && Array.isArray(contentItem.annotations)) {
        annotations = contentItem.annotations;
      }
    }
  }

  if (!analysisText.trim()) {
    console.error('No analysis text found in response:', data);
    throw new Error('No analysis text found in OpenAI response');
  }

  // Extract sources from annotations
  const sources: Array<{title: string; url: string; source: string}> = [];
  
  annotations.forEach((annotation: any) => {
    if (annotation.type === 'url_citation' && annotation.url_citation) {
      sources.push({
        title: annotation.url_citation.title || 'Source',
        url: annotation.url_citation.url,
        source: new URL(annotation.url_citation.url).hostname
      });
    }
  });

  console.log('Web Search analysis successful with', sources.length, 'sources');
  return {
    analysis: analysisText,
    isRealAnalysis: true,
    sources: sources
  };
};

const createWebSearchPrompt = (request: AIAnalysisRequest): string => {
  const direction = request.priceChangePercent24h >= 0 ? 'rising' : 'falling';
  const magnitude = Math.abs(request.priceChangePercent24h);
  const intensity = magnitude > 5 ? 'significantly' : magnitude > 2 ? 'notably' : 'slightly';
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `
Search the web for the latest news and information about ${request.cryptoName} (${request.symbol}) and provide a comprehensive market analysis.

Current Market Data (${currentDate}):
- Price: $${request.currentPrice.toLocaleString()}
- 24h Change: ${request.priceChangePercent24h.toFixed(2)}%
- Market Cap: $${request.marketCap.toLocaleString()}
- 24h Volume: $${request.volume24h.toLocaleString()}

${request.cryptoName} is ${intensity} ${direction} today by ${request.priceChangePercent24h.toFixed(2)}%.

Please search for and analyze:
1. Latest breaking news about ${request.cryptoName}
2. Recent regulatory developments affecting ${request.symbol}
3. Institutional activity and ETF flows
4. Technical analysis and market sentiment
5. Major partnerships or protocol updates
6. Macroeconomic factors impacting crypto markets

Structure your response as follows:

## ${request.cryptoName} Market Analysis: ${currentDate}

**Current Price Action**: Brief overview of today's movement

### 📰 Breaking News & Recent Developments
Search for and summarize the most recent news affecting ${request.cryptoName}

### 🏛️ Institutional & Regulatory Updates  
Find information about institutional activity, ETF flows, and regulatory news

### 📈 Technical Analysis & Market Sentiment
Analyze current technical indicators and market sentiment

### 🔮 Market Outlook & Key Levels
Provide outlook based on current information and key levels to watch

**IMPORTANT**: 
- Use your web search results to find current, factual information
- Include inline citations naturally within your analysis
- Focus on recent developments (last 24-48 hours)
- Provide specific, actionable insights
- Use **bold text** for key points and section headers
- Include relevant emojis for visual appeal

Make sure to search for the most recent news and developments before writing your analysis.
  `;
};