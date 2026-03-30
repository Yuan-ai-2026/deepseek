import { NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 只保留 3 个品种
const assets = [
  { symbol: "SSE", name: "上证指数" },
  { symbol: "XAUUSD", name: "黄金/盎司" },
  { symbol: "XAGUSD", name: "白银/盎司" },
];

const systemPrompt = `
你是专业交易分析师。
请生成**简体中文**内容。
输出必须是严格的 JSON 格式，无多余文字。
JSON 包含:
price, change (带%), direction, confidence (60-85), aiAnalysis, keyPoints (3条中文).
`;

export async function GET() {
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });
  }

  try {
    const results = [];

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
            { role: "user", content: `分析 ${asset.name} (${asset.symbol}) 的走势` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        results.push({
          symbol: asset.symbol,
          price: "0.00",
          change: "0.00%",
          direction: "Neutral",
          confidence: 50,
          lastUpdate: "异常",
          aiAnalysis: `API 请求失败 (${response.status})，请检查密钥或网络。`,
          keyPoints: ["检查 API Key", "检查账号余额", "稍后重试"]
        });
        continue;
      }

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          parsed = {
            price: "0.00",
            change: "0.00%",
            direction: "Neutral",
            confidence: 50,
            aiAnalysis: "AI 返回格式异常",
            keyPoints: ["请稍后重试"]
          };
        }
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        results.push({ symbol: asset.symbol, price: "0.00", change: "0.00%", direction: "Neutral", confidence: 50, aiAnalysis: "API 返回空", keyPoints: ["稍后重试"] });
        continue;
      }

      const parsed = JSON.parse(content);
      results.push({ ...parsed, symbol: asset.symbol, lastUpdate: "刚刚" });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
