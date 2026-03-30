import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ASSETS = [
  { symbol: "SSE", name: "上证指数", url: "https://hq.sinajs.cn/list=sh000001" },
  { symbol: "XAUUSD", name: "黄金", url: "https://hq.sinajs.cn/list=hf_XAU" },
  { symbol: "XAGUSD", name: "白银", url: "https://hq.sinajs.cn/list=hf_XAG" }
];

export async function GET() {
  try {
    const results = [];
    for (const asset of ASSETS) {
      const res = await fetch(`${asset.url}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          "Referer": "https://finance.sina.com.cn/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const text = await res.text();
      const content = text.match(/"([^"]+)"/)?.[1];
      
      if (!content) {
        results.push({ symbol: asset.symbol, name: asset.name, price: "接口维护", change: "0.00%", direction: "Neutral" });
        continue;
      }

      const d = content.split(',');
      if (asset.symbol === "SSE") {
        const cur = parseFloat(d[3]);
        const pre = parseFloat(d[2]);
        results.push({
          symbol: asset.symbol,
          name: asset.name,
          price: cur.toFixed(2),
          change: `${(((cur - pre) / pre) * 100).toFixed(2)}%`,
          direction: cur >= pre ? "Bullish" : "Bearish"
        });
      } else {
        const cur = parseFloat(d[0]);
        const chg = parseFloat(d[1]);
        results.push({
          symbol: asset.symbol,
          name: asset.name,
          price: cur.toFixed(2),
          change: `${chg.toFixed(2)}%`,
          direction: chg >= 0 ? "Bullish" : "Bearish"
        });
      }
    }
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
