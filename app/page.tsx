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

// 趋势中文映射
const directionMap: Record<string, string> = {
  'Bullish': '看涨',
  'Bearish': '看跌',
  'Neutral': '中性'
};

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

// 全中文兜底数据（含新增品种）
const fallbackData: AssetData[] = [
  {
    symbol: "US30",
    price: "39124.50",
    change: "-0.09%",
    direction: "Neutral",
    confidence: 60,
    lastUpdate: "28分钟前",
    aiAnalysis: "工业股在周二1.6%的暴跌后走势疲软，最高法院叫停紧急关税政策加剧了市场波动，贸易紧张局势持续给跨国企业前景蒙上阴影。",
    keyPoints: [
      "最高法院裁决叫停紧急关税权限，引发政策不确定性",
      "周二暴跌后，市场对前期高点的追高信心不足"
    ]
  },
  {
    symbol: "USDJPY",
    price: "151.20",
    change: "+0.16%",
    direction: "Bullish",
    confidence: 75,
    lastUpdate: "28分钟前",
    aiAnalysis: "美联储会议纪要释放降息谨慎信号，美债收益率维持坚挺，美日利差持续扩大，日元基本面承压，美元日元上行趋势明确。",
    keyPoints: [
      "美联储本周会议纪要释放谨慎降息信号",
      "美日利差持续扩大，利好美元、利空日元"
    ]
  },
  {
    symbol: "EURUSD",
    price: "1.0727",
    change: "-0.27%",
    direction: "Bearish",
    confidence: 65,
    lastUpdate: "28分钟前",
    aiAnalysis: "关税战担忧与美国最高法院关税裁决，推动美元大幅走强。风险情绪恶化，欧元面临持续下行压力。",
    keyPoints: [
      "关税战新闻与最高法院裁决推动美元走强",
      "市场风险偏好降温，欧元多头缺乏基本面支撑",
      "警惕双底形态可能引发短期空头回补，操作需谨慎"
    ]
  },
  {
    symbol: "XAUUSD",
    price: "2345.80",
    change: "+0.42%",
    direction: "Bullish",
    confidence: 78,
    lastUpdate: "28分钟前",
    aiAnalysis: "地缘政治风险升温叠加美联储降息预期，黄金避险需求凸显，美元走弱进一步提振金价，短期维持偏强震荡格局。",
    keyPoints: [
      "地缘政治风险升级，黄金避险买盘增加",
      "美联储降息预期升温，实际利率下行利好金价",
      "美元指数走弱，为黄金提供额外支撑"
    ]
  },
  {
    symbol: "XAGUSD",
    price: "27.85",
    change: "+0.68%",
    direction: "Bullish",
    confidence: 72,
    lastUpdate: "28分钟前",
    aiAnalysis: "白银跟随黄金走强，工业需求回暖叠加避险情绪双重驱动，银价弹性高于黄金，短期上行空间打开，关注关键阻力位。",
    keyPoints: [
      "黄金走强带动白银跟涨，避险属性凸显",
      "工业需求回暖，白银基本面边际改善",
      "银价弹性更大，短期上行空间优于黄金"
    ]
  },
  {
    symbol: "USOIL",
    price: "78.45",
    change: "-0.35%",
    direction: "Bearish",
    confidence: 68,
    lastUpdate: "28分钟前",
    aiAnalysis: "OPEC+增产预期叠加美国原油库存增加，油价承压下行。全球经济增速放缓压制需求，短期维持偏弱震荡格局。",
    keyPoints: [
      "OPEC+增产预期升温，供应端压力加大",
      "美国原油库存超预期增加，利空油价",
      "全球经济放缓，原油需求端增长乏力"
    ]
  },
  {
    symbol: "SSE",
    price: "3128.50",
    change: "+0.21%",
    direction: "Neutral",
    confidence: 62,
    lastUpdate: "28分钟前",
    aiAnalysis: "A股维持震荡格局，政策面托底预期较强，但市场情绪偏谨慎，成交量不足制约上行空间，板块分化明显，关注政策落地节奏。",
    keyPoints: [
      "政策托底预期较强，市场下行空间有限",
      "成交量持续低迷，制约指数上行空间",
      "板块分化明显，结构性机会为主"
    ]
  }
];

export default function Dashboard() {
  const [data, setData] = useState<AssetData[]>(fallbackData);
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(fetchAIData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-2xl font-bold">AI 交易分析加载中...</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 侧边栏导航（全中文） */}
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

        {/* 主内容区（自适应多品种布局） */}
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

                {/* 置信度进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>置信度</span>
                    <span>{asset.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(asset.direction)}`}
                      style={{ width: `${asset.confidence}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">⏱️ 最后更新：{asset.lastUpdate}</p>
                </div>

                {/* AI 分析模块 */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                    ✨ AI 分析
                  </h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {asset.aiAnalysis}
                  </p>
                </div>

                {/* 操作按钮 */}
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
