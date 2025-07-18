import React from 'react';
import { Bitcoin } from 'lucide-react';

interface HeaderProps {
  selectedCrypto: string;
  onCryptoChange: (crypto: string) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedCrypto, onCryptoChange }) => {
  const cryptos = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' }
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bitcoin className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bitcoin.com</h1>
                <p className="text-xs text-gray-500">Crypto Analysis</p>
              </div>
            </div>
            
            <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {cryptos.map((crypto) => (
                <button
                  key={crypto.id}
                  onClick={() => onCryptoChange(crypto.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedCrypto === crypto.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {crypto.symbol}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;