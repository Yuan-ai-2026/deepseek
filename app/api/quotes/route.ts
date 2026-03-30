import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ASSETS = [
  {
    symbol: "SSE",
    name: "上证指数",
    quoteApi: "https://hq.sinajs.cn/list=sh000001",
    parser: (raw: string) => {
      const data = raw.split('=')[1].replace(/"/g, '').split(',');
      const current = Number(data[3]); // A股第4个值是当前点数
      const prevClose = Number(data[2]); // A股第3个值是昨收
      return {
        price: current.toFixed(2),
        change: `${((current - prevClose) / prevClose * 100).toFixed(2)}%`,
        direction: current >= prevClose ? "Bullish" : "Bearish"
      };
    }
  },
  {
    symbol: "XAUUSD",
    name: "黄金/盎司",
    quoteApi: "https://hq.sinajs.cn/list=hf_XAU",
    parser: (raw: string) => {
      const data = raw.split('=')[1].replace(/"/g, '').split(',');
      const current = Number(data[0]); // 国际期货第1个值是当前价
      const changeStr = data[1]; // 国际期货第2个值直接就是涨跌幅字符串
      return {
        price: current.toFixed(2),
        change: `${Number(changeStr).toFixed(2)}%`,
        direction: Number(changeStr) >= 0 ? "Bullish" : "Bearish"
      };
    }
  },
  {
    symbol: "XAGUSD",
    name: "白银/盎司",
    quoteApi: "https://hq.sinajs.cn/list=hf_XAG",
    parser: (raw: string) => {
      const data = raw.split('=')[1].replace(/"/g, '').split(',');
      const current = Number(data[0]);
      const changeStr = data[1];
      return {
        price: current.toFixed(2),
        change: `${Number(changeStr).toFixed(2)}%`,
        direction: Number(changeStr) >= 0 ? "Bullish" : "Bearish"
      };
    }
  }
];

export async function GET() {
  try {
    const results = [];
    for (const asset of ASSETS) {
      const url = `${asset.quoteApi}&_t=${Date.now()}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { "Referer": "https://finance.sina.com.cn/" }
      });
      const raw = await res.text();
      const quote = asset.parser(raw);

      results.push({
        symbol: asset.symbol,
        name: asset.name,
        ...quote
      });
    }

    return NextResponse.json(results, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  } catch (err) {
    console.error("行情接口错误:", err);
    return NextResponse.json({ error: "行情拉取失败" }, { status: 500 });
  }
}
