/**
 * Cloudflare Worker - 台股收盤價 API Proxy
 * 部署後會有一個網址，填入 index.html 的 WORKER_URL
 */

const TWSE_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL';
const OTC_URL  = 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 處理 OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 路由
    if (url.pathname === '/api/twse') {
      return proxyFetch(TWSE_URL);
    }
    if (url.pathname === '/api/otc') {
      return proxyFetch(OTC_URL);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: CORS_HEADERS,
    });
  },
};

async function proxyFetch(targetUrl) {
  try {
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });

    if (!resp.ok) {
      throw new Error(`Upstream HTTP ${resp.status}`);
    }

    const data = await resp.text();

    return new Response(data, { headers: CORS_HEADERS });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
