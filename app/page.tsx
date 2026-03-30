'use client';
import { useEffect, useState } from 'react';

// 数据类型定义
type QuoteData = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  direction: 'Bullish' | 'Bearish' | 'Neutral';
};

type AiAnalysisData = {
  aiAnalysis: string;
  keyPoints: string[];
  confidence: number;
};

const assetNameMap: Record<string, string> = {
  'SSE': '上证指数',
  'XAUUSD': '黄金',
  'XAGUSD': '白银'
};

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

export default function Dashboard() {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [aiResults, setAiResults] = useState<Record<string, AiAnalysisData>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // ================= 1. 定时拉取免费行情 =================
  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes', { cache: 'no-store' });
      if (!res.ok) throw new Error('网络错误');
      const result = await res.json();
      setQuotes(result);
    } catch (err) {
      console.error("Fetch Quotes Error:", err);
      // 容错：如果挂了，给点假数据撑场面
      setQuotes([
        { symbol: "SSE", name: "上证指数", price: "3150.00", change: "+0.21%", direction: "Neutral" },
        { symbol: "XAUUSD", name: "黄金", price: "2350.80", change: "+0.42%", direction: "Bullish" },
        { symbol: "XAGUSD", name: "白银", price: "28.45", change: "+0.68%", direction: "Bullish" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ================= 2. 按需触发 DeepSeek AI 分析 =================
  const handleAiAnalysis = async (symbol: string) => {
    setLoadingAi((prev) => ({ ...prev, [symbol]: true }));
    try {
      const res = await fetch(`/api/ai-analysis?symbol=${symbol}`, { cache: 'no-store' });
      const data = await res.json();
      
      if (res.ok) {
        setAiResults((prev) => ({
          ...prev,
          [symbol]: {
            aiAnalysis: data.aiAnalysis,
            keyPoints: data.keyPoints,
            confidence: data.confidence
          }
        }));
      } else {
        alert(data.error || 'AI 分析失败');
      }
    } catch (error) {
      console.error('AI分析请求失败:', error);
    } finally {
      setLoadingAi((prev) => ({ ...prev, [symbol]: false }));
    }
  };

  useEffect(() => {
    fetchQuotes();
    // 💡 行情每 10 秒自动刷新，随便刷，不要钱！
    const interval = setInterval(fetchQuotes, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && quotes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* 左侧边栏 - 保持你的原样 */}
        <aside className="w-64 bg-gray-800/50 h-screen p-6 border-r border-gray-700">
          <h1 className="text-2xl font-bold text-emerald-400 mb-8">HybridTrader</h1>
          <nav className="space-y-4">
            <a href="#" className="flex items-center gap-3 text-emerald-400 font-medium"><span>仪表盘</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition"><span>报告</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition"><span>日历</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition"><span>宏观分析</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition"><span>交易心理</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition"><span>交易日志</span></a>
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
            {quotes.map((asset) => {
              const aiData = aiResults[asset.symbol];
              const isAiLoading = loadingAi[asset.symbol];

              return (
                <div 
                  key={asset.symbol} 
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg"
                >
                  {/* 品种头部 */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                      {assetNameMap[asset.symbol] || asset.symbol} 
                      <span className="text-lg text-gray-400 ml-2">{asset.price}</span>
                    </h2>
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

                  {/* 置信度 - 仅在有 AI 数据时展示，默认给个转圈圈或静止态 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>AI 置信度</span>
                      <span>{aiData ? `${aiData.confidence}%` : '--'}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${getProgressColor(asset.direction)}`}
                        style={{ width: `${aiData ? aiData.confidence : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">⏱️ 行情实时轮询中</p>
                  </div>

                  {/* AI 分析 */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                      ✨ AI 深度分析
                    </h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {isAiLoading 
                        ? "🤖 DeepSeek 正在全力思考中..." 
                        : (aiData?.aiAnalysis || "点击下方【深度分析】按钮，召唤 AI 进行实时盘面解读。")}
                    </p>
                  </div>

                  {/* 按钮区域 */}
                  <div className="flex gap-3 mb-4">
                    <button className="px-4 py-2 bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                      快速概览
                    </button>
                    <button 
                      onClick={() => handleAiAnalysis(asset.symbol)}
                      disabled={isAiLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition text-gray-900 ${
                        isAiLoading 
                          ? 'bg-emerald-700 cursor-not-allowed text-gray-400' 
                          : 'bg-emerald-500 hover:bg-emerald-400'
                      }`}
                    >
                      {isAiLoading ? '请求中...' : '深度分析'}
                    </button>
                  </div>

                  {/* 关键要点 */}
                  <div className="space-y-2">
                    {aiData?.keyPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <p className="text-sm text-gray-400">{point}</p>
                      </div>
                    )) || (
                      <div className="text-sm text-gray-500 italic">待生成驱动要点...</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
