import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const price = searchParams.get('price'); // 💡 从前端直接获取价格

  const API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!API_KEY) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

  try {
    const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个专业的金融分析师。请基于用户提供的品种和价格，给出100字以内的简短市场分析。必须返回 JSON 格式，包含字段：aiAnalysis (string), keyPoints (string数组), confidence (number)" },
          { role: "user", content: `品种: ${symbol}, 当前价格: ${price}。请分析走势。` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await aiRes.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch (e) {
    return NextResponse.json({ error: "AI 接口繁忙" }, { status: 500 });
  }
}
