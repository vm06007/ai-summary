import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface MarketStatsProps {
  marketCap: number;
  volume24h: number;
  dominance: number;
  circulatingSupply: number;
  cryptoName: string;
  symbol: string;
}

const MarketStats: React.FC<MarketStatsProps> = ({
  marketCap,
  volume24h,
  dominance,
  circulatingSupply,
  cryptoName,
  symbol
}) => {
  const formatNumber = (num: number, suffix: string) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}${suffix}`;
  };

  const formatSupply = (supply: number) => {
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
    return supply.toFixed(2);
  };

  const stats = [
    {
      label: 'Market Cap',
      value: formatNumber(marketCap, ''),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: '24h Volume',
      value: formatNumber(volume24h, ''),
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: dominance > 0 ? 'Market Dominance' : 'Market Rank',
      value: dominance > 0 ? `${dominance.toFixed(1)}%` : 'Top 10',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Circulating Supply',
      value: `${formatSupply(circulatingSupply)} ${symbol}`,
      icon: TrendingDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketStats;