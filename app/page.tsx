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

// 中文配置
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

// 我们要展示的3个品种（保留原参考样式的布局）
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
      if (!res.ok) throw new Error('网络错误');
      const result = await res.json();
      
      // 如果 API 返回错误信息，触发容错
      if (result.error) {
        setApiError(true);
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

  // 兜底数据（API 失败时）
  const getFallbackData = (): AssetData[] => [
    {
      symbol: "SSE",
      price: "3150.00",
      change: "+0.21%",
      direction: "Neutral",
      confidence: 70,
      lastUpdate: "28分钟前",
      aiAnalysis: "API 连接失败，请检查 API 密钥或网络状态。",
      keyPoints: ["1. 确认 Vercel 环境变量 DEPSEEK_API_KEY", "2. 检查 DeepSeek 账号余额", "3. 刷新页面重试"]
    },
    {
      symbol: "XAUUSD",
      price: "2350.80",
      change: "+0.42%",
      direction: "Bullish",
      confidence: 78,
      lastUpdate: "28分钟前",
      aiAnalysis: "API 连接失败，请检查 API 密钥或网络状态。",
      keyPoints: ["1. 确认 Vercel 环境变量 DEPSEEK_API_KEY", "2. 检查 DeepSeek 账号余额", "3. 刷新页面重试"]
    },
    {
      symbol: "XAGUSD",
      price: "28.45",
      change: "+0.68%",
      direction: "Bullish",
      confidence: 75,
      lastUpdate: "28分钟前",
      aiAnalysis: "API 连接失败，请检查 API 密钥或网络状态。",
      keyPoints: ["1. 确认 Vercel 环境变量 DEPSEEK_API_KEY", "2. 检查 DeepSeek 账号余额", "3. 刷新页面重试"]
    }
  ];

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5分钟刷新
    return () => clearInterval(interval);
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 左侧边栏 */}
      <div className="flex">
        <aside className="w-64 bg-gray-800/50 h-screen p-6 border-r border-gray-700">
          <h1 className="text-2xl font-bold text-emerald-400 mb-8">HybridTrader</h1>
           <nav className="space-y-4">
            <a href="#" className="flex items-center gap-3 text-emerald-400 font-medium">
              <span>仪表盘</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>报告</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>日历</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>宏观分析</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>交易心理</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>交易日志</span>
            </a>
            <div className="pt-8 border-t border-gray-700">
              <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                <span>社区</span>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded">即将上线</span>
              </a>
            </div>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((asset) => (
              <div 
                key={asset.symbol} 
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg"
              >
                {/* 品种头部 */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{asset.symbol}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getDirectionColor(asset.direction)}`}>
                      {asset.change}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      asset.direction === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                      asset.direction === 'Bearish' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {directionMap[asset.direction]}
                    </span>
                  </div>
                </div>

                {/* 置信度 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>置信度</span>
                    <span>{asset.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${getProgressColor(asset.direction)}`}
                      style={{ width: `${asset.confidence}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">⏱️ 最后更新：{asset.lastUpdate}</p>
                </div>

                {/* AI 分析 */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                    ✨ AI 分析
                  </h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {asset.aiAnalysis}
                  </p>
                </div>

                {/* 按钮 */}
                <div className="flex gap-3 mb-4">
                  <button className="px-4 py-2 bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                    快速概览
                  </button>
                  <button className="px-4 py-2 bg-emerald-500 rounded-lg text-sm font-medium hover:bg-emerald-400 transition text-gray-900">
                    深度分析
                  </button>
                </div>

                {/* 关键要点 */}
                <div className="space-y-2">
                  {asset.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <p className="text-sm text-gray-400">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
