interface AIAnalysisRequest {
  cryptoName: string;
  symbol: string;
}
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertCircle, Search, Globe, TrendingUp as ChartIcon, DollarSign, Wifi, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getAIAnalysis } from '../services/aiAnalysis';

interface AIAnalysisProps {
  currentPrice: number;
  priceChangePercent24h: number;
  cryptoName: string;
  symbol: string;
  marketCap: number;
  volume24h: number;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({
  currentPrice,
  priceChangePercent24h,
  cryptoName,
  symbol,
  marketCap,
  volume24h
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [sources, setSources] = useState<Array<{title: string; url: string; source: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!currentPrice || !cryptoName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAIAnalysis({
        cryptoName,
        symbol,
        currentPrice,
        priceChangePercent24h,
        marketCap,
        volume24h
      });
      setAnalysis(result.analysis);
      setSources(result.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const isPositive = priceChangePercent24h > 0;
  const direction = isPositive ? 'rising' : 'falling';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Brain className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Market Analysis</h2>
            <p className="text-sm text-gray-600">Get real-time insights on {cryptoName}'s price movements</p>
          </div>
        </div>
      </div>

      {!analysis && !loading && !error && (
        <div className="p-6 pt-0">
          <button
            onClick={fetchAnalysis}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <Search className="w-5 h-5" />
            Get AI Analysis: Why is {symbol} {direction} today?
          </button>
        </div>
      )}

      {loading && (
        <div className="p-6 pt-0">
          {/* Fixed height button */}
          <button
            disabled
            className="w-full bg-gray-50 text-gray-600 font-medium py-4 px-6 rounded-lg flex items-center justify-center gap-3 mb-4"
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
            Analyzing Market Conditions...
          </button>
          
          {/* Loading steps outside the button */}
          <div className="space-y-3">
            <div className="flex items-center text-orange-600">
              <Search className="w-5 h-5 mr-3" />
              <span className="text-sm">Searching market data...</span>
            </div>
            
            <div className="flex items-center text-orange-600">
              <Globe className="w-5 h-5 mr-3" />
              <span className="text-sm">Analyzing news and sentiment...</span>
            </div>
            
            <div className="flex items-center text-orange-600">
              <ChartIcon className="w-5 h-5 mr-3" />
              <span className="text-sm">Processing technical indicators...</span>
            </div>
            
            <div className="flex items-center text-orange-600">
              <DollarSign className="w-5 h-5 mr-3" />
              <span className="text-sm">Evaluating institutional flows...</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 pt-0">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Analysis Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAnalysis}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <Brain className="w-5 h-5" />
            Try Again: Why is {symbol} {direction} today?
          </button>
        </div>
      )}

      {analysis && !loading && !error && (
        <div className="p-6 pt-0">
          {/* Live AI Analysis Badge */}
          <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Wifi className="w-4 h-4 text-green-600" />
            <div>
              <span className="text-sm font-medium text-green-800">Live AI Analysis</span>
              <p className="text-xs text-green-600">Based on real-time market data and web search</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
            <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-bold text-gray-900 mb-2 mt-4 first:mt-0">{children}</h2>,
                  h3: ({children}) => <h3 className="text-base font-bold text-gray-900 mb-2 mt-3 first:mt-0">{children}</h3>,
                  p: ({children}) => <p className="mb-3 text-gray-700">{children}</p>,
                  strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                  ul: ({children}) => <div className="mb-3 space-y-1">{children}</div>,
                  ol: ({children}) => <div className="mb-3 space-y-1">{children}</div>,
                  li: ({children}) => <div className="text-gray-700">{children}</div>,
                  code: ({children}) => (
                    <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ),
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-orange-300 pl-4 italic text-gray-600 my-3">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </div>
          
          {/* Sources Section */}
          {sources.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sources ({sources.length})
              </h4>
              <div className="space-y-2">
                {sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded transition-colors group"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{source.title}</div>
                      <div className="text-xs text-blue-600 truncate">{source.source}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={fetchAnalysis}
            className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 cursor-pointer"
            disabled={loading}
          >
            <Brain className="w-4 h-4" />
            {loading ? 'Generating...' : 'Get New Analysis'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;