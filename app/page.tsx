'use client';
import { useEffect, useState } from 'react';

// 数据类型定义（和 DeepSeek 输出格式对齐）
type AssetData = {
  symbol: string;        // 品种代码（US30/USDJPY/EURUSD等）
  price: string;         // 当前价格
  change: string;        // 涨跌幅
  direction: 'Bullish' | 'Bearish' | 'Neutral'; // 趋势
  confidence: number;   // 置信度（0-100）
  lastUpdate: string;   // 最后更新时间
  aiAnalysis: string;    // AI 分析文本
  keyPoints: string[];  // 关键驱动要点
};

// 兜底数据（API请求失败时显示）
const fallbackData: AssetData[] = [
  {
    symbol: "US30",
    price: "39124.50",
    change: "-0.09%",
    direction: "Neutral",
    confidence: 60,
    lastUpdate: "28m ago",
    aiAnalysis: "Industrials look fragile following Tuesday's 1.6% rout, with the Supreme Court's block on emergency tariffs driving volatility. Trade tensions continue to cloud the outlook for multinationals.",
    keyPoints: [
      "Supreme Court ruling against emergency tariff authorities creates significant policy uncertainty",
      "Downside attention to stalled last peaks conviction after Tuesday's rout"
    ]
  },
  {
    symbol: "USDJPY",
    price: "151.20",
    change: "+0.16%",
    direction: "Bullish",
    confidence: 75,
    lastUpdate: "28m ago",
    aiAnalysis: "Fed minutes urging patience on cuts keeps US yields firm, widening the spread against the Yen. Despite interim volatility, the fundamental bias remains strictly upward.",
    keyPoints: [
      "Fed minutes released this week signal a cautious approach to rate cuts",
      "Ensuring the yield differential continues to favour the Dollar"
    ]
  },
  {
    symbol: "EURUSD",
    price: "1.0727",
    change: "-0.27%",
    direction: "Bearish",
    confidence: 65,
    lastUpdate: "28m ago",
    aiAnalysis: "Tariff war fears and the US Supreme Court ruling on emergency duties are fuelling heavy Greenback demand. With risk sentiment soured, the single currency remains exposed.",
    keyPoints: [
      "Renewed tariff war headlines and the Supreme Court ruling on emergency duties are driving flows into the Dollar",
      "Broad risk-off sentiment is punishing the Euro, with markets identifying a lack of fundamental context for long positions",
      "Caution is advised as a potential double bottom formation could spark a temporary short squeeze despite the grim outlook"
    ]
  }
];

// 趋势颜色映射
const getDirectionColor = (dir: string) => {
  if (dir === 'Bullish') return 'text-emerald-400';
  if (dir === 'Bearish') return 'text-red-500';
  return 'text-gray-400';
};

// 进度条颜色映射
const getProgressColor = (dir: string) => {
  if (dir === 'Bullish') return 'bg-emerald-400';
  if (dir === 'Bearish') return 'bg-red-500';
  return 'bg-gray-400';
};

export default function Dashboard() {
  const [data, setData] = useState<AssetData[]>(fallbackData);
  const [loading, setLoading] = useState(true);

  // 从本地API获取数据（由DeepSeek生成）
  const fetchAIData = async () => {
    try {
      const res = await fetch('/api/ai-analysis');
      if (!res.ok) throw new Error('API请求失败');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('使用兜底数据:', err);
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIData();
    // 每5分钟自动刷新一次数据
    const interval = setInterval(fetchAIData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-2xl font-bold">加载 AI 交易分析中...</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 侧边栏导航（和参考图一致） */}
      <div className="flex">
        <aside className="w-64 bg-gray-800/50 h-screen p-6 border-r border-gray-700">
          <h1 className="text-2xl font-bold text-emerald-400 mb-8">HybridTrader</h1>
          <nav className="space-y-4">
            <a href="#" className="flex items-center gap-3 text-emerald-400 font-medium">
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>Reports</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>Calendar</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>Macro Desk</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>Psychology</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <span>Journal</span>
            </a>
            <div className="pt-8 border-t border-gray-700">
              <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                <span>Community</span>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded">Soon</span>
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
                      {asset.direction}
                    </span>
                  </div>
                </div>

                {/* 置信度进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Confidence</span>
                    <span>{asset.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(asset.direction)}`}
                      style={{ width: `${asset.confidence}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">⏱️ Last update: {asset.lastUpdate}</p>
                </div>

                {/* AI 分析模块 */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                    ✨ AI Analysis
                  </h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {asset.aiAnalysis}
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 mb-4">
                  <button className="px-4 py-2 bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                    Quick Overview
                  </button>
                  <button className="px-4 py-2 bg-emerald-500 rounded-lg text-sm font-medium hover:bg-emerald-400 transition text-gray-900">
                    Deep Dive
                  </button>
                </div>

                {/* 关键要点 */}
                <div className="space-y-2">
                  {asset.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <p className="text-sm text-gray-300">{point}</p>
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
