import { NextResponse } from 'next/server';

// 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 只保留需要的3个品种
const assets = [
  { symbol: "SSE", name: "上证指数" },
  { symbol: "XAUUSD", name: "黄金/盎司" },
  { symbol: "XAGUSD", name: "白银/盎司" },
];

// 系统提示词：强制中文输出
const systemPrompt = `
你是专业的国内交易分析师。
请针对指定品种生成简体中文分析。
输出格式为 JSON，不要有任何多余解释。
JSON 结构必须包含：
- price: 价格数字 (string)
- change: 涨跌幅 (string, 如 +0.32%)
- direction: Bullish, Bearish 或 Neutral
- confidence: 60-85 的整数
- aiAnalysis: 100字左右的中文分析
- keyPoints: 包含3条中文要点的数组
`;

export async function GET() {
  // 1. 检查是否有 API Key
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "未配置 API Key" }, { status: 500 });
  }

  try {
    const results = [];

    // 循环请求每个品种
    for (const asset of assets) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `分析 ${asset.name} (${asset.symbol}) 的最新走势` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      // 2. 检查 API 状态码
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 请求 ${asset.symbol} 失败:`, response.status, errorText);
        // 不抛出异常，继续收集其他数据，或直接返回带有错误信息的格式
        results.push({
          symbol: asset.symbol,
          price: "0.00",
          change: "0.00%",
          direction: "Neutral",
          confidence: 50,
          lastUpdate: "异常",
          aiAnalysis: `API 请求失败 (${response.status})。请检查密钥余额或网络状态。`,
          keyPoints: ["检查 API Key", "检查账号余额", "稍后重试"]
        });
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        results.push({
          symbol: asset.symbol,
          price: "0.00",
          change: "0.00%",
          direction: "Neutral",
          confidence: 50,
          lastUpdate: "异常",
          aiAnalysis: "API 返回内容为空",
          keyPoints: ["检查 API 输出格式", "稍后重试"]
        });
        continue;
      }

      const parsed = JSON.parse(content);
      
      results.push({
        ...parsed,
        symbol: asset.symbol,
        lastUpdate: "刚刚"
      });
    }

    return NextResponse.json(results);
    
  } catch (error) {
    console.error("服务器内部错误:", error);
    // 捕获所有异常，返回友好的错误数据，避免前端崩溃
    return NextResponse.json({ 
      error: "服务器内部错误", 
      details: String(error) 
    }, { status: 500 });
  }
}
