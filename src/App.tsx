import React, { useState } from 'react';
import Header from './components/Header';
import PriceChart from './components/PriceChart';
import AIAnalysis from './components/AIAnalysis';
import MarketStats from './components/MarketStats';
import LoadingSpinner from './components/LoadingSpinner';
import { useCryptoPrice } from './hooks/useCryptoPrice';

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  
  const {
    price,
    priceChange24h,
    priceChangePercent24h,
    marketCap,
    volume24h,
    dominance,
    circulatingSupply,
    loading,
    error,
    name,
    symbol
  } = useCryptoPrice(selectedCrypto);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        selectedCrypto={selectedCrypto}
        onCryptoChange={setSelectedCrypto}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-8">
          {/* Market Stats */}
          <MarketStats 
            marketCap={marketCap}
            volume24h={volume24h}
            dominance={dominance}
            circulatingSupply={circulatingSupply}
            cryptoName={name}
            symbol={symbol}
          />
          
          {/* Price Chart */}
          <PriceChart 
            currentPrice={price}
            priceChange24h={priceChange24h}
            priceChangePercent24h={priceChangePercent24h}
            cryptoName={name}
            symbol={symbol}
          />
          
          {/* AI Analysis */}
          <AIAnalysis 
            currentPrice={price}
            priceChangePercent24h={priceChangePercent24h}
            cryptoName={name}
            symbol={symbol}
            marketCap={marketCap}
            volume24h={volume24h}
          />
        </div>
      </main>
      
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Real-time cryptocurrency data • AI Analysis powered by OpenRouter API
            </p>
            <p className="text-xs mt-2">
              © 2025 Bitcoin.com. Not financial advice. Always do your own research.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;