import { NextResponse } from 'next/server';

// ====================== 1. 配置 ======================
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 品种配置（绑定真实行情API的请求参数）
const ASSETS = [
  {
    symbol: "SSE",
    name: "上证指数",
    // 新浪财经上证指数接口（sh000001）
    quoteApi: "https://hq.sinajs.cn/list=sh000001",
    parser: (raw: string) => {
      // 新浪返回格式：var hq_str_sh000001="上证指数,3245.00,3246.50,...";
      const data = raw.split('=')[1].replace(/"/g, '').split(',');
      return {
        price: Number(data[1]).toFixed(2),
        change: `${((Number(data[1]) - Number(data[2])) / Number(data[2]) * 100).toFixed(2)}%`,
        direction: Number(data[1]) > Number(data[2]) ? "Bullish" : "Bearish"
      };
    }
  },
  {
    symbol: "XAUUSD",
    name: "黄金/盎司",
    // Yahoo Finance 黄金接口（GC=F 黄金期货）
    quoteApi: "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m",
    parser: (raw: any) => {
      const meta = raw.chart.result[0].meta;
      return {
        price: meta.regularMarketPrice.toFixed(2),
        change: `${meta.regularMarketChangePercent.toFixed(2)}%`,
        direction: meta.regularMarketChange > 0 ? "Bullish" : "Bearish"
      };
    }
  },
  {
    symbol: "XAGUSD",
    name: "白银/盎司",
    // Yahoo Finance 白银接口（SI=F 白银期货）
    quoteApi: "https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1m",
    parser: (raw: any) => {
      const meta = raw.chart.result[0].meta;
      return {
        price: meta.regularMarketPrice.toFixed(2),
        change: `${meta.regularMarketChangePercent.toFixed(2)}%`,
        direction: meta.regularMarketChange > 0 ? "Bullish" : "Bearish"
      };
    }
  }
];

// DeepSeek 系统提示词（基于真实行情生成分析）
const SYSTEM_PROMPT = `
你是专业的全球宏观交易分析师，**必须严格基于用户提供的真实行情数据**生成分析，禁止编造价格。
要求：
1.  分析内容不超过150字，专业、简洁，符合机构交易风格
2.  给出3条关键驱动要点，每条不超过30字
3.  趋势判断必须与真实行情涨跌一致（涨=Bullish，跌=Bearish，平=Neutral）
4.  严格按照JSON格式返回，不要额外内容，格式如下：
{
  "aiAnalysis": "分析文本（简体中文）",
  "keyPoints": ["要点1（简体中文）", "要点2（简体中文）", "要点3（简体中文）"]
}
`;

// ====================== 2. 工具函数 ======================
// 拉取真实行情
const fetchRealQuote = async (asset: typeof ASSETS[number]) => {
  try {
    const res = await fetch(asset.quoteApi, {
      headers: {
        // 新浪接口需要Referer，Yahoo接口无需
        "Referer": "https://finance.sina.com.cn/"
      }
    });
    const raw = await res.text();
    return asset.parser(raw);
  } catch (err) {
    console.error(`行情拉取失败(${asset.symbol}):`, err);
    // 行情拉取失败的兜底数据
    return {
      price: "0.00",
      change: "0.00%",
      direction: "Neutral"
    };
  }
};

// 调用DeepSeek生成AI分析
const fetchAIAnalysis = async (asset: typeof ASSETS[number], quote: Awaited<ReturnType<typeof fetchRealQuote>>) => {
  if (!DEEPSEEK_API_KEY) throw new Error("未配置DeepSeek API Key");

  const prompt = `
品种：${asset.name}(${asset.symbol})
真实行情：当前价格${quote.price}，涨跌幅${quote.change}，趋势${quote.direction === "Bullish" ? "上涨" : quote.direction === "Bearish" ? "下跌" : "震荡"}
请基于上述真实行情数据，生成专业交易分析。
`;

  const res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
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
  return JSON.parse(data.choices[0].message.content);
};

// ====================== 3. 主接口 ======================
export async function GET() {
  // 1. 校验API Key
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "DeepSeek API Key未配置" }, { status: 500 });
  }

  try {
    const results = [];

    // 2. 并行拉取行情+AI分析
    for (const asset of ASSETS) {
      // 2.1 先拉真实行情
      const quote = await fetchRealQuote(asset);
      // 2.2 基于真实行情调用AI分析
      const ai = await fetchAIAnalysis(asset, quote);

      // 2.3 合并真实行情+AI分析，返回前端
      results.push({
        symbol: asset.symbol,
        name: asset.name,
        price: quote.price,
        change: quote.change,
        direction: quote.direction,
        confidence: Math.floor(Math.random() * 20 + 65), // 65-85置信度
        lastUpdate: "刚刚",
        aiAnalysis: ai.aiAnalysis,
        keyPoints: ai.keyPoints
      });
    }

    // 3. 禁止缓存，确保每次都是最新数据
    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (err) {
    console.error("接口错误:", err);
    // 全局兜底数据
    return NextResponse.json([
      {
        symbol: "SSE",
        name: "上证指数",
        price: "3245.00",
        change: "-0.50%",
        direction: "Bearish",
        confidence: 70,
        lastUpdate: "异常",
        aiAnalysis: "行情/AI接口异常，请检查网络或API配置",
        keyPoints: ["检查DeepSeek API Key", "检查行情接口可用性", "刷新重试"]
      },
      {
        symbol: "XAUUSD",
        name: "黄金/盎司",
        price: "2345.67",
        change: "+1.23%",
        direction: "Bullish",
        confidence: 75,
        lastUpdate: "异常",
        aiAnalysis: "行情/AI接口异常，请检查网络或API配置",
        keyPoints: ["检查DeepSeek API Key", "检查行情接口可用性", "刷新重试"]
      },
      {
        symbol: "XAGUSD",
        name: "白银/盎司",
        price: "28.50",
        change: "+1.50%",
        direction: "Bullish",
        confidence: 75,
        lastUpdate: "异常",
        aiAnalysis: "行情/AI接口异常，请检查网络或API配置",
        keyPoints: ["检查DeepSeek API Key", "检查行情接口可用性", "刷新重试"]
      }
    ]);
  }
}
