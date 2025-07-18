import { useState, useEffect } from 'react';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

// Cache for last successful prices (used as fallback)
const lastSuccessfulPrices = new Map<string, any>();

interface CryptoData {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  volume24h: number;
  dominance: number;
  circulatingSupply: number;
  loading: boolean;
  error: string | null;
  name: string;
  symbol: string;
}

export const useCryptoPrice = (cryptoId: string): CryptoData => {
  const [data, setData] = useState<CryptoData>({
    price: 0,
    priceChange24h: 0,
    priceChangePercent24h: 0,
    marketCap: 0,
    volume24h: 0,
    dominance: 0,
    circulatingSupply: 0,
    loading: true,
    error: null,
    name: '',
    symbol: ''
  });

  const fetchCryptoData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Check cache first
      const cacheKey = `crypto-${cryptoId}`;
      const cached = cache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setData({
          ...cached.data,
          loading: false,
          error: null
        });
        return;
      }
      
      // Use CoinGecko API with proper headers and error handling
      const apiUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const cryptoData = await response.json();
      
      // Fetch global market data for dominance
      const globalResponse = await fetch('https://api.coingecko.com/api/v3/global', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      let dominance = 0;
      if (globalResponse.ok) {
        const globalData = await globalResponse.json();
        if (cryptoId === 'bitcoin') {
          dominance = globalData.data.market_cap_percentage.btc || 50;
        } else if (cryptoId === 'ethereum') {
          dominance = globalData.data.market_cap_percentage.eth || 20;
        } else {
          dominance = 0; // Solana and others don't have dominance in the global API
        }
      }
      
      const newData = {
        price: cryptoData.market_data.current_price.usd,
        priceChange24h: cryptoData.market_data.price_change_24h,
        priceChangePercent24h: cryptoData.market_data.price_change_percentage_24h,
        marketCap: cryptoData.market_data.market_cap.usd,
        volume24h: cryptoData.market_data.total_volume.usd,
        dominance,
        circulatingSupply: cryptoData.market_data.circulating_supply,
        name: cryptoData.name,
        symbol: cryptoData.symbol.toUpperCase()
      };
      
      // Cache the successful response
      cache.set(cacheKey, {
        data: newData,
        timestamp: now
      });
      
      // Store as last successful price for fallback
      lastSuccessfulPrices.set(cryptoId, newData);
      
      setData({
        ...newData,
        loading: false,
        error: null
      });
    } catch (error) {
      console.warn(`API unavailable for ${cryptoId}, using fallback data:`, error);
      
      // Try to use last successful price data first
      const lastSuccessful = lastSuccessfulPrices.get(cryptoId);
      
      if (lastSuccessful) {
        setData({
          ...lastSuccessful,
          loading: false,
          error: 'Using cached data - API temporarily unavailable'
        });
        return;
      }
      
      // Final fallback to basic mock data only if no cached data exists
      const basicFallback = {
        bitcoin: {
          price: 120000, // Current realistic range around $120K
          priceChange24h: 1200,
          priceChangePercent24h: 1.01,
          marketCap: 2400000000000, // ~$2.4T market cap at $120K
          volume24h: 28000000000,
          dominance: 52.0,
          circulatingSupply: 19.8,
          name: 'Bitcoin',
          symbol: 'BTC'
        },
        ethereum: {
          price: 4200, // ETH typically follows BTC trends
          priceChange24h: 45,
          priceChangePercent24h: 1.08,
          marketCap: 505000000000,
          volume24h: 15000000000,
          dominance: 19.5,
          circulatingSupply: 120.4,
          name: 'Ethereum',
          symbol: 'ETH'
        },
        solana: {
          price: 280.00, // SOL has seen significant growth
          priceChange24h: 8.50,
          priceChangePercent24h: 3.13,
          marketCap: 135000000000,
          volume24h: 4500000000,
          dominance: 0,
          circulatingSupply: 482.5,
          name: 'Solana',
          symbol: 'SOL'
        }
      };
      
      const fallbackData = basicFallback[cryptoId as keyof typeof basicFallback] || basicFallback.bitcoin;
      
      setData({
        ...fallbackData,
        loading: false,
        error: 'Using demo data - API unavailable and no cached data'
      });
    }
  };

  useEffect(() => {
    fetchCryptoData();
    
    // Update every 2 minutes to reduce API calls
    const interval = setInterval(fetchCryptoData, 120000);
    
    return () => clearInterval(interval);
  }, [cryptoId]);

  return data;
};