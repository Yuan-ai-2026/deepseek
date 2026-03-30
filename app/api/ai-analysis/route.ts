import { NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const ASSETS = [
  { symbol: "US30", name: "道琼斯指数" },
  { symbol: "USDJPY", name: "美元/日元" },
  { symbol: "EURUSD", name: "欧元/美元" },
  { symbol: "XAUUSD", name: "黄金" },
  { symbol: "XAGUSD", name: "白银" },
  { symbol: "USOIL", name: "原油" },
  { symbol: "SSE", name: "上证指数" },
];

const SYSTEM_PROMPT = `
你是专业全球宏观交易分析师。
只用简体中文回答。
严格返回JSON，不要任何多余文字。
返回格式如下：
{
  "price": "字符串价格",
  "change": "涨跌幅，如+0.32%",
  "direction": "Bullish / Bearish / Neutral",
  "confidence": 60-85之间数字,
  "aiAnalysis": "一段专业分析",
  "keyPoints": ["要点1","要点2","要点3"]
}
`;

export async function GET() {
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json(getFallbackData(), { status: 200 });
  }

  try {
    const results = [];

    // 串行调用，避免并发被封
    for (const asset of ASSETS) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `分析 ${asset.name} (${asset.symbol})` }
          ],
          temperature: 0.6,
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error('Empty content');

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
  } catch (err) {
    console.error("API 调用失败", err);
    return NextResponse.json(getFallbackData(), { status: 200 });
  }
}

// 永远不会报错的兜底数据
function getFallbackData() {
  return [
    {
      symbol: "US30",
      price: "39142.8",
      change: "-0.12%",
      direction: "Neutral",
      confidence: 60,
      lastUpdate: "刚刚",
      aiAnalysis: "API 调用失败，当前显示默认数据",
      keyPoints: ["请检查 API Key", "检查账户余额", "检查网络"]
    },
    {
      symbol: "USDJPY",
      price: "151.32",
      change: "+0.21%",
      direction: "Bullish",
      confidence: 75,
      lastUpdate: "刚刚",
      aiAnalysis: "API 调用失败，当前显示默认数据",
      keyPoints: ["请检查 API Key", "检查账户余额", "检查网络"]
    },
    {
      symbol: "EURUSD",
      price: "1.0731",
      change: "-0.22%",
      direction: "Bearish",
      confidence: 65,
      lastUpdate: "刚刚",
      aiAnalysis: "API 调用失败，当前显示默认数据",
      keyPoints: ["请检查 API Key", "检查账户余额", "检查网络"]
    },
    {
      symbol: "XAUUSD",
      price: "2348.5",
      change: "+0.38%",
      direction: "Bullish",
      confidence: 78,
      lastUpdate: "刚刚",
      aiAnalysis: "API 调用失败，当前显示默认数据",
      keyPoints: ["请检查 API Key", "检查账户余额", "检查网络"]
    },
    {
      symbol: "XAGUSD",
      price: "27.92",
      change: "+0.71%",
      direction: "Bullish",
      confidence: 72,
      lastUpdate: "刚刚",
      aiAnalysis: "API 调用失败，当前显示默认数据",
      keyPoints: ["请检查 API Key", "检查账户余额", "检查网络"]
    },
    {
      symbol: "USOIL",
      price: "78.52",
      change: "-0.31%",
      direction: "Bearish",
      confidence: 68,
      lastUpdate: "刚刚",
      aiAnalysis: "API 调用失败，当前显示默认数据",
      keyPoints: ["请检查 API Key", "检查账户余额", "检查网络"]
    },
    {
      symbol: "SSE",
      price: "3130.2",
      change: "+0.25%",
      direction: "Neutral",
      confidence: 62,
      lastUpdate: "刚刚",
      aiAnalysis: "API 调用失败，当前显示默认数据",
      keyPoints: ["请检查 API Key", "检查账户余额", "检查网络"]
    }
  ];
}
