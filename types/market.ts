/** Bitcoin market data types (Binance + crypto-native sources). */

export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface PriceSnapshot {
  price: number;
  /** Price 24h ago (Binance 24h ticker openPrice). */
  openPrice: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface OpenInterestData {
  /** Most recent open interest (BTC). */
  current: number;
  /** Open interest one period (~24h) ago. */
  previous: number;
  /** Notional value in USD of the most recent reading. */
  notionalUsd: number;
}

export interface FundingRateData {
  /** Latest 8-hour funding rate as a decimal (e.g. 0.0001 = 0.01%). */
  rate8h: number;
  /** Daily-equivalent funding rate as a decimal (rate8h * 3). */
  rateDaily: number;
}

export interface FearGreedData {
  value: number;
  classification: string;
}

export interface StablecoinSupplyData {
  /** Combined USDT + USDC market cap now (USD). */
  current: number;
  /** Combined market cap 7 days ago (USD). */
  weekAgo: number;
  /** 7-day percentage change. */
  changePct: number;
}

export interface ExchangeReserveData {
  /** Net 7-day reserve change in BTC. Negative = outflow (bullish). */
  netChangeBtc: number;
}

export interface EtfFlowData {
  /** Net flow in USD for the latest trading day. Positive = inflow. */
  netFlowUsd: number;
  /** Label of the source date. */
  asOf: string;
}
