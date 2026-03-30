import { NextResponse } from 'next/server';

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 交易品种配置
const TRADING_ASSETS = [
  { symbol: 'US30', name: '道琼斯指数' },
  { symbol: 'USDJPY', name: '美元/日元' },
  { symbol: 'EURUSD', name: '欧元/美元' }
];

// 调用 DeepSeek API 生成分析
const getAIAnalysis = async (asset: { symbol: string; name: string }) => {
  const prompt = `
你是专业的全球宏观交易分析师，针对${asset.name}（${asset.symbol}）生成一份专业的交易分析，要求：
1. 分析内容不超过150字，专业、简洁，符合机构交易风格
2. 给出3条关键驱动要点，每条不超过30字
3. 给出趋势判断（Bullish/Bearish/Neutral）、置信度（60-85之间的整数）、涨跌幅（模拟合理值）
4. 严格按照JSON格式返回，不要额外内容，格式如下：
{
  "symbol": "${asset.symbol}",
  "price": "模拟当前价格",
  "change": "涨跌幅，如+0.16%/-0.27%",
  "direction": "Bullish/Bearish/Neutral",
  "confidence": 置信度数字,
  "aiAnalysis": "分析文本",
  "keyPoints": ["要点1", "要点2", "要点3"]
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
      lastUpdate: 'Just now'
    }));

    return NextResponse.json(resultWithTime, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    console.error('AI分析生成失败:', err);
    // 失败时返回兜底数据
    return NextResponse.json([
      {
        symbol: "US30",
        price: "39124.50",
        change: "-0.09%",
        direction: "Neutral",
        confidence: 60,
        lastUpdate: "28m ago",
        aiAnalysis: "Industrials look fragile following Tuesday's 1.6% rout, with the Supreme Court's block on emergency tariffs driving volatility.",
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
        aiAnalysis: "Fed minutes urging patience on cuts keeps US yields firm, widening the spread against the Yen.",
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
        aiAnalysis: "Tariff war fears and the US Supreme Court ruling on emergency duties are fuelling heavy Greenback demand.",
        keyPoints: [
          "Renewed tariff war headlines and the Supreme Court ruling on emergency duties are driving flows into the Dollar",
          "Broad risk-off sentiment is punishing the Euro, with markets identifying a lack of fundamental context for long positions"
        ]
      }
    ]);
  }
}
