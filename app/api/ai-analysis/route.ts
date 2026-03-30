import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  
  if (!API_KEY) return NextResponse.json({ error: "Key Missing" }, { status: 500 });

  try {
    // 1. 直连行情源获取当前价
    const hqUrl = symbol === "SSE" ? "https://hq.sinajs.cn/list=sh000001" : 
                  symbol === "XAUUSD" ? "https://hq.sinajs.cn/list=hf_XAU" : "https://hq.sinajs.cn/list=hf_XAG";
    
    const hqRes = await fetch(hqUrl, { headers: { "Referer": "https://finance.sina.com.cn/" } });
    const hqText = await hqRes.text();
    const hqData = (hqText.match(/"([^"]+)"/)?.[1] || "").split(',');
    const price = symbol === "SSE" ? hqData[3] : hqData[0];

    // 2. 请求 DeepSeek
    const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个金融专家，请根据提供的价格做简短分析。必须返回JSON: {\"aiAnalysis\":\"...\", \"keyPoints\":[\"...\"], \"confidence\":85}" },
          { role: "user", content: `品种:${symbol}, 当前价格:${price}。请分析。` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const json = await aiRes.json();
    return NextResponse.json(JSON.parse(json.choices[0].message.content));
  } catch (e) {
    return NextResponse.json({ error: "AI Error" }, { status: 500 });
  }
}
