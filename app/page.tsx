'use client';
import { useEffect, useState } from 'react';

type AssetData = {
  symbol: string;
  price: string;
  change: string;
  direction: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  lastUpdate: string;
  aiAnalysis: string;
  keyPoints: string[];
};

const directionMap = {
  Bullish: '看涨',
  Bearish: '看跌',
  Neutral: '中性',
};

export default function Dashboard() {
  const [data, setData] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取数据
  const fetchData = async () => {
    try {
      const res = await fetch('/api/ai-analysis', { cache: 'no-store' });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 30000); // 每30秒自动刷新
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">加载 AI 分析数据...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI 实时交易分析</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((asset) => (
          <div
            key={asset.symbol}
            className="bg-gray-800 rounded-xl p-5 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">{asset.symbol}</h2>
              <span className="px-2 py-1 rounded text-xs bg-gray-700">
                {directionMap[asset.direction]}
              </span>
            </div>
            <div className="text-lg font-mono mb-2">{asset.price}</div>
            <div className="text-sm mb-3">{asset.change}</div>
            <div className="text-sm text-gray-300 mb-3">{asset.aiAnalysis}</div>
            <div className="text-xs text-gray-400">
              置信度 {asset.confidence}% • {asset.lastUpdate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
