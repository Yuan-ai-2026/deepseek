import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `
你是专业的全球宏观交易分析师，必须严格基于用户提供的真实行情数据生成分析。
要求：
1. 分析内容不超过150字，专业、简洁，符合机构交易风格
2. 给出3条关键驱动要点，每条不超过30字
3. 严格按照JSON格式返回，不要额外内容，格式如下：
{
  "aiAnalysis": "分析文本（简体中文）",
  "keyPoints": ["要点1（简体中文）", "要点2（简体中文）", "要点3（简体中文）"]
}
`;

export async function GET(request: Request) {
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "DeepSeek API Key未配置" }, { status: 500 });
  }

  // 💡 1. 从 URL 中获取前端传过来的品种代码，比如 ?symbol=SSE
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json({ error: "请提供 symbol 参数，例如 ?symbol=SSE" }, { status: 400 });
  }

  try {
    // 💡 2. 内部直接调用我们刚刚写好的 quotes 接口拿最新行情，省代码！
    const quotesRes = await fetch(`${new URL(request.url).origin}/api/quotes`, { cache: 'no-store' });
    const quotes = await quotesRes.json();
    
    // 找到对应 symbol 的那一条行情
    const currentQuote = quotes.find((q: any) => q.symbol === symbol);
    if (!currentQuote) {
      return NextResponse.json({ error: "未找到该品种的行情" }, { status: 404 });
    }

    // 💡 3. 只把这一个品种喂给 DeepSeek，省下 2/3 的钱！
    const prompt = `
品种：${currentQuote.name}(${currentQuote.symbol})
真实行情：当前价格${currentQuote.price}，涨跌幅${currentQuote.change}，趋势${currentQuote.direction === "Bullish" ? "上涨" : "下跌"}
请基于上述真实行情数据，生成专业交易分析。
`;

    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      cache: 'no-store',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) throw new Error(`DeepSeek API错误: ${res.status}`);
    const data = await res.json();
    const ai = JSON.parse(data.choices[0].message.content);

    // 返回单条 AI 分析结果
    return NextResponse.json({
      symbol: currentQuote.symbol,
      price: currentQuote.price,
      change: currentQuote.change,
      direction: currentQuote.direction,
      confidence: Math.floor(Math.random() * 20 + 65), // 保持你的随机置信度
      aiAnalysis: ai.aiAnalysis,
      keyPoints: ai.keyPoints
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });

  } catch (err) {
    console.error("AI分析接口错误:", err);
    return NextResponse.json({ error: "AI生成失败" }, { status: 500 });
  }
}
