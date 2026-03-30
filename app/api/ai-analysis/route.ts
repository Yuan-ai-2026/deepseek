import { NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const assets = [
  { symbol: "US30", name: "道琼斯指数" },
  { symbol: "USDJPY", name: "美元/日元" },
  { symbol: "EURUSD", name: "欧元/美元" },
  { symbol: "XAUUSD", name: "黄金" },
  { symbol: "XAGUSD", name: "白银" },
  { symbol: "USOIL", name: "原油" },
  { symbol: "SSE", name: "上证指数" },
];

const systemPrompt = `
你是专业交易分析师。
请用简体中文输出 JSON，不要任何多余解释。
输出格式如下：
{
  "price": "价格",
  "change": "涨跌幅",
  "direction": "Bullish/Bearish/Neutral",
  "confidence": 60-85,
  "aiAnalysis": "分析",
  "keyPoints": ["要点1","要点2","要点3"]
}
`;

export async function GET() {
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "未配置 API Key" }, { status: 500 });
  }

  try {
    const results = [];

    for (const asset of assets) {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `分析 ${asset.name} (${asset.symbol})` }
          ],
          temperature: 0.7,
          stream: false
        })
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error("API 返回空");

      const parsed = JSON.parse(content);

      results.push({
        symbol: asset.symbol,
        price: parsed.price,
        change: parsed.change,
        direction: parsed.direction,
        confidence: parsed.confidence,
        aiAnalysis: parsed.aiAnalysis,
        keyPoints: parsed.keyPoints,
        lastUpdate: "刚刚"
      });
    }

    return NextResponse.json(results);
  } catch (e) {
    console.error("API 调用失败", e);

    return NextResponse.json([
      {
        symbol: "US30",
        price: "39124.50",
        change: "-0.09%",
        direction: "Neutral",
        confidence: 60,
        lastUpdate: "刚刚",
        aiAnalysis: "API 调用失败，显示默认数据",
        keyPoints: ["请检查 DeepSeek 密钥", "检查网络", "检查余额"]
      }
    ]);
  }
}
