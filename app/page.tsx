'use client';
import { useEffect, useState } from 'react';

// 数据类型定义
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

// 中文映射配置
const directionMap: Record<string, string> = {
  'Bullish': '看涨',
  'Bearish': '看跌',
  'Neutral': '中性'
};

const getDirectionColor = (dir: string) => {
  if (dir === 'Bullish') return 'text-emerald-400';
  if (dir === 'Bearish') return 'text-red-500';
  return 'text-gray-400';
};

const getProgressColor = (dir: string) => {
  if (dir === 'Bullish') return 'bg-emerald-400';
  if (dir === 'Bearish') return 'bg-red-500';
  return 'bg-gray-400';
};

// 定义我们要展示的3个品种
const targetAssets = [
  { symbol: 'SSE', name: '上证指数' },
  { symbol: 'XAUUSD', name: '黄金' },
  { symbol: 'XAGUSD', name: '白银' }
];

export default function Dashboard() {
  const [data, setData] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setApiError(false);
    try {
      const res = await fetch('/api/ai-analysis');
      if (!res.ok) throw new Error('网络请求失败');
      
      const result = await res.json();
      if (result.error) {
        setApiError(true);
        console.error("API Error:", result.error);
        // 使用兜底数据
        setData(getFallbackData());
      } else {
        setData(result);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setApiError(true);
      setData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // 兜底数据（API 失败时显示）
  const getFallbackData = (): AssetData[] => [
    {
      symbol: "SSE",
      price: "3150.00",
      change: "+0.21%",
      direction: "Neutral",
      confidence: 70,
      lastUpdate: "刚刚",
      aiAnalysis: "API 配置异常或网络连接失败。请检查 API 密钥是否正确，或网络连接状态。",
      keyPoints: ["1. 检查 Vercel 环境变量 DEEPSEEK_API_KEY", "2. 检查 DeepSeek 账号余额", "3. 刷新页面重试"]
    },
    {
      symbol: "XAUUSD",
      price: "2350.80",
      change: "+0.42%",
      direction: "Bullish",
      confidence: 78,
      lastUpdate: "刚刚",
      aiAnalysis: "API 配置异常或网络连接失败。请检查 API 密钥是否正确，或网络连接状态。",
      keyPoints: ["1. 检查 Vercel 环境变量 DEEPSEEK_API_KEY", "2. 检查 DeepSeek 账号余额", "3. 刷新页面重试"]
    },
    {
      symbol: "XAGUSD",
      price: "28.45",
      change: "+0.68%",
      direction: "Bullish",
      confidence: 75,
      lastUpdate: "刚刚",
      aiAnalysis: "API 配置异常或网络连接失败。请检查 API 密钥是否正确，或网络连接状态。",
      keyPoints: ["1. 检查 Vercel 环境变量 DEEPSEEK_API_KEY", "2. 检查 DeepSeek 账号余额", "3. 刷新页面重试"]
    }
  ];

  useEffect(() => {
    fetchData();
    // 每30秒自动刷新一次
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8 text-emerald-400">AI 实时交易分析</h1>
        <div className="text-xl">加载 AI 数据分析中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 头部标题 */}
      <header className="text-center py-10">
        <h1 className="text-4xl font-bold text-emerald-400 mb-2">AI 实时交易分析</h1>
        <p className="text-gray-400">深度解析市场趋势，智能预判投资机会</p>
      </header>

      {/* 品种卡片网格 */}
      <main className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((asset) => (
            <div 
              key={asset.symbol} 
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl hover:shadow-emerald-900/20 transition-all duration-300"
            >
              {/* 品种标题与涨幅 */}
              <div className="flex justify-between items-start mb-5">
                <h2 className="text-2xl font-bold">{asset.symbol}</h2>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-semibold ${getDirectionColor(asset.direction)}`}>
                    {asset.change}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full mt-1 ${
                    asset.direction === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                    asset.direction === 'Bearish' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {directionMap[asset.direction]}
                  </span>
                </div>
              </div>

              {/* AI 分析内容 */}
              <div className="mb-6">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {asset.aiAnalysis}
                </p>
              </div>

              {/* 关键要点 */}
              <div className="space-y-3 mb-6">
                {asset.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <p className="text-sm text-gray-400">{point}</p>
                  </div>
                ))}
              </div>

              {/* 底部置信度信息 */}
              <div className="border-t border-gray-700 pt-4 flex justify-between items-center text-sm text-gray-500">
                <span>置信度</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getProgressColor(asset.direction)}`}
                      style={{ width: `${asset.confidence}%` }}
                    ></div>
                  </div>
                  <span>{asset.confidence}%</span>
                </div>
                <span>{asset.lastUpdate}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
