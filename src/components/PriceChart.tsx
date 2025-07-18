import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PriceData {
  time: string;
  price: number;
  formattedTime: string;
}

interface PriceChartProps {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  cryptoName: string;
  symbol: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  currentPrice, 
  priceChange24h, 
  priceChangePercent24h,
  cryptoName,
  symbol
}) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);

  useEffect(() => {
    // Generate mock price history data
    const generatePriceHistory = () => {
      const data: PriceData[] = [];
      const now = new Date();
      const basePrice = currentPrice - priceChange24h;
      
      for (let i = 47; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 30 * 60 * 1000); // 30-minute intervals
        const progress = (47 - i) / 47;
        const randomVariation = (Math.random() - 0.5) * (currentPrice * 0.02); // 2% random variation
        const trendComponent = priceChange24h * progress;
        const price = Math.max(basePrice + trendComponent + randomVariation, currentPrice * 0.8);
        
        data.push({
          time: time.toISOString(),
          price: price,
          formattedTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
      
      return data;
    };

    setPriceHistory(generatePriceHistory());
  }, [currentPrice, priceChange24h]);

  const isPositive = priceChangePercent24h >= 0;
  const chartColor = isPositive ? "#10b981" : "#ef4444";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{data.formattedTime}</p>
          <p className="text-lg font-semibold text-gray-900">
            ${payload[0].value.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: currentPrice > 1000 ? 2 : 4 
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatXAxisTick = (tickItem: string, index: number) => {
    if (index % 8 === 0) {
      const date = new Date(tickItem);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{cryptoName} Price</h2>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">
              ${currentPrice.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: currentPrice > 1000 ? 2 : 4 
              })}
            </span>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              isPositive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isPositive ? '+' : ''}${Math.abs(priceChange24h).toFixed(2)} ({priceChangePercent24h.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id={`colorPrice-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="time"
              tickFormatter={formatXAxisTick}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              tickFormatter={formatYAxisTick}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#colorPrice-${symbol})`}
              dot={{ fill: chartColor, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: chartColor, strokeWidth: 2, fill: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-gray-500 block mb-1">24h High</span>
          <div className="font-semibold text-lg">
            ${Math.max(...priceHistory.map(d => d.price)).toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: currentPrice > 1000 ? 2 : 4 
            })}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-gray-500 block mb-1">24h Low</span>
          <div className="font-semibold text-lg">
            ${Math.min(...priceHistory.map(d => d.price)).toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: currentPrice > 1000 ? 2 : 4 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;