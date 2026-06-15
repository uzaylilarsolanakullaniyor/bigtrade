# Bitcoin Market Score

A daily-updated **Bitcoin Market Score (0–100)** that measures the overall health, strength, sentiment and macro environment of the Bitcoin market. It is **not** a price predictor — it aggregates technical indicators, crypto-native metrics, derivatives data, sentiment and macroeconomic data into a single composite score.

Built with **Next.js 15 (App Router)**, **TypeScript (strict)**, **Tailwind CSS v3**, **Recharts**, **Framer Motion**, **SWR**, and **Vercel KV**.

---

## How the score works

The composite is a weighted blend of three category scores, each normalized to 0–100:

| Category | Weight | Signals |
| --- | --- | --- |
| **Crypto Market Data** | 50% | ETF Flows, Open Interest, Funding Rate, Fear & Greed, Stablecoin Supply, Exchange Reserves |
| **Technical Analysis** | 20% | RSI, MACD, EMA 50, EMA 200, ADX, Bollinger Bands |
| **Macroeconomic Data** | 30% | DXY, NASDAQ, S&P 500, WTI Oil, CPI, Fed Outlook |

Each signal evaluates to a value in `-2 … +2`. A category's raw score is the sum of its **available** signals, normalized via:

```
normalized = round( (raw - min) / (max - min) * 100 )      // min = -2·n, max = +2·n
composite  = round( crypto·0.5 + technical·0.2 + macro·0.3 )
```

Status bands: `0–20 Extreme Bearish`, `20–40 Bearish`, `40–60 Neutral`, `60–80 Bullish`, `80–100 Strong Bullish`.

If a data source is unavailable, its signal is **excluded** and the score is computed from the remaining signals (the UI shows `Score based on X/18 signals`).

---

## Architecture

```
services/      → fetch raw data, each returns ServiceResult<T> (never throws)
indicators/    → pure TA functions (RSI, MACD, EMA, ADX, Bollinger)
scoring/
  signals/     → one module per signal: raw data → SignalResult (-2…+2)
  categories/  → group signals into CategoryScore
  normalizer   → normalization + status bands
  engine       → orchestrates all fetches (Promise.all) → MarketScore
app/api/       → Route Handlers (score, history, events, cron)
hooks/         → SWR hooks for client data fetching
components/    → dashboard, charts, ui, layout
lib/           → kv, cache, rate limiting, formatters, constants, logger
```

**Fallback strategy:** every service tries a live call; on failure it returns a neutral baseline flagged `isStale: true`. Free/public sources (Binance, Alternative.me, CoinGecko) work with **no API key**. Keyed/scraped sources (FRED, Alpha Vantage, ETF flows, exchange reserves, FedWatch) fall back to neutral baselines with a **⚠ Stale Data** badge until a key/feed is configured.

---

## Getting started (local)

```bash
npm install
cp .env.local.example .env.local   # fill in any keys you have (all optional)
npm run dev                        # http://localhost:3000
```

Without any keys the app runs on live Binance / Fear & Greed / CoinGecko data; the macro signals show neutral/stale until you add FRED + Alpha Vantage keys. Vercel KV is optional locally — the app falls back to an in-memory store.

Other scripts:

```bash
npm run build   # production build (must pass with zero TS errors)
npm run lint    # eslint
npm run test    # jest unit tests (indicators + scoring)
```

---

## Environment variables

See [`.env.local.example`](.env.local.example). Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_BINANCE_BASE_URL` | no (default set) | Binance spot API |
| `NEXT_PUBLIC_BINANCE_FUTURES_BASE_URL` | no (default set) | Binance futures API |
| `NEXT_PUBLIC_FEAR_GREED_URL` | no (default set) | Alternative.me Fear & Greed |
| `COINGECKO_BASE_URL` | no (default set) | CoinGecko free tier |
| `FRED_API_KEY` | optional | DXY, WTI, CPI (FRED) |
| `ALPHA_VANTAGE_API_KEY` | optional | NASDAQ (QQQ), S&P 500 (SPY) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` (+ read-only) | optional | Vercel KV (history + cache) |
| `CRON_SECRET` | recommended on Vercel | Authorizes the daily cron |

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. (Optional) Add a **Vercel KV** store — env vars are injected automatically. Add `FRED_API_KEY`, `ALPHA_VANTAGE_API_KEY` and `CRON_SECRET` in Project → Settings → Environment Variables.
4. Deploy. [`vercel.json`](vercel.json) registers the daily cron (`0 1 * * *` → `/api/cron`) and sets cache headers.

The cron fetches all sources, runs the scoring engine, stores `score:latest` in KV and appends a point to the 30-day `score:history` list.

---

## API

| Route | Method | Description |
| --- | --- | --- |
| `/api/score` | GET | Latest `MarketScore` (from KV, or computed live on first run). |
| `/api/history` | GET | Up to 30 days of `{ date, score, status }` points. |
| `/api/events` | GET | Next 8 upcoming macro events. |
| `/api/cron` | GET/POST | Daily recompute + persist. Requires `Authorization: Bearer $CRON_SECRET` when the secret is set. |

All `/api/*` routes are rate-limited to 60 requests/minute per IP (returns `429` with `Retry-After`).

---

## Keyboard shortcuts

`R` refresh · `H` toggle history chart · `?` shortcuts help · `Esc` close dialog.

---

## Disclaimer

For informational and educational purposes only. **Not financial advice.**
