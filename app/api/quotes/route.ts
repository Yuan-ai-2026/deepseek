import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ASSETS = [
  {
    symbol: "SSE",
    name: "上证指数",
    quoteApi: "https://hq.sinajs.cn/list=sh000001",
    parser: (raw: string) => {
      // 1. 使用正则精准提取引号内的字符串，防止变量名干扰
      const match = raw.match(/"([^"]+)"/);
      if (!match) return null;
      
      const data = match[1].split(',');
      // A股格式：Index 3 是当前点数, Index 2 是昨收点数
      const current = parseFloat(data[3]);
      const prevClose = parseFloat(data[2]);
      
      if (isNaN(current) || isNaN(prevClose) || prevClose === 0) return null;

      return {
        price: current.toFixed(2),
        change: `${(((current - prevClose) / prevClose) * 100).toFixed(2)}%`,
        direction: current >= prevClose ? "Bullish" : "Bearish"
      };
    }
  },
  {
    symbol: "XAUUSD",
    name: "黄金",
    // 新浪伦敦金接口
    quoteApi: "https://hq.sinajs.cn/list=hf_XAU",
    parser: (raw: string) => {
      const match = raw.match(/"([^"]+)"/);
      if (!match) return null;
      
      const data = match[1].split(',');
      // 国际现货格式：Index 0 是当前价, Index 1 是涨跌幅百分比, Index 7 是昨收
      const current = parseFloat(data[0]);
      const changePercent = parseFloat(data[1]);

      if (isNaN(current)) return null;

      return {
        price: current.toFixed(2),
        change: `${changePercent.toFixed(2)}%`,
        direction: changePercent >= 0 ? "Bullish" : "Bearish"
      };
    }
  },
  {
    symbol: "XAGUSD",
    name: "白银",
    // 新浪伦敦银接口
    quoteApi: "https://hq.sinajs.cn/list=hf_XAG",
    parser: (raw: string) => {
      const match = raw.match(/"([^"]+)"/);
      if (!match) return null;
      
      const data = match[1].split(',');
      const current = parseFloat(data[0]);
      const changePercent = parseFloat(data[1]);

      if (isNaN(current)) return null;

      return {
        price: current.toFixed(2),
        change: `${changePercent.toFixed(2)}%`,
        direction: changePercent >= 0 ? "Bullish" : "Bearish"
      };
    }
  }
];

export async function GET() {
  try {
    const results = [];
    
    for (const asset of ASSETS) {
      // 添加时间戳 _t 彻底粉碎缓存
      const url = `${asset.quoteApi}&_t=${Date.now()}`;
      
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 
          "Referer": "https://finance.sina.com.cn/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });

      const raw = await res.text();
      const quote = asset.parser(raw);

      if (quote) {
        results.push({
          symbol: asset.symbol,
          name: asset.name,
          ...quote
        });
      } else {
        // 容错处理：解析失败时返回占位符而非 NaN
        results.push({
          symbol: asset.symbol,
          name: asset.name,
          price: "---",
          change: "0.00%",
          direction: "Neutral"
        });
      }
    }

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache"
      }
    });
  } catch (err) {
    console.error("行情接口严重错误:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
