import { NextResponse } from 'next/server';

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 交易品种配置（新增黄金、白银、原油、上证指数）
const TRADING_ASSETS = [
  { symbol: 'US30', name: '道琼斯指数' },
  { symbol: 'USDJPY', name: '美元/日元' },
  { symbol: 'EURUSD', name: '欧元/美元' },
  { symbol: 'XAUUSD', name: '黄金/美元' },
  { symbol: 'XAGUSD', name: '白银/美元' },
  { symbol: 'USOIL', name: '美原油' },
  { symbol: 'SSE', name: '上证指数' }
];

// 调用 DeepSeek API 生成中文分析
const getAIAnalysis = async (asset: { symbol: string; name: string }) => {
  const prompt = `
你是专业的全球宏观交易分析师，针对${asset.name}（${asset.symbol}）生成一份专业的交易分析，要求：
1.  分析内容不超过150字，专业、简洁，符合机构交易风格
2.  给出3条关键驱动要点，每条不超过30字
3.  给出趋势判断（Bullish/Bearish/Neutral）、置信度（60-85之间的整数）、涨跌幅（模拟合理值）
4.  严格按照JSON格式返回，不要额外内容，格式如下：
{
  "symbol": "${asset.symbol}",
  "price": "模拟当前价格",
  "change": "涨跌幅，如+0.16%/-0.27%",
  "direction": "Bullish/Bearish/Neutral",
  "confidence": 置信度数字,
  "aiAnalysis": "分析文本（简体中文）",
  "keyPoints": ["要点1（简体中文）", "要点2（简体中文）", "要点3（简体中文）"]
}
`;

  if (!DEEPSEEK_API_KEY) {
    throw new Error('未配置 DeepSeek API 密钥');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 错误: ${response.status}`);
  }
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

export async function GET() {
  try {
    // 并行请求所有品种的AI分析
    const analysisResults = await Promise.all(
      TRADING_ASSETS.map(asset => getAIAnalysis(asset))
    );

    // 补充最后更新时间
    const resultWithTime = analysisResults.map(item => ({
      ...item,
      lastUpdate: '刚刚'
    }));

    return NextResponse.json(resultWithTime, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    console.error('AI分析生成失败:', err);
    // 失败时返回全中文兜底数据（含新增品种）
    return NextResponse.json([
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
    ]);
  }
}
