/** Binance spot + futures data (public endpoints, no key required). */
import {
  BINANCE_BASE_URL,
  BINANCE_FUTURES_BASE_URL,
  SYMBOL,
} from '@/lib/constants';
import { fetchJson, errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ok, fail } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type {
  Candle,
  PriceSnapshot,
  OpenInterestData,
  FundingRateData,
} from '@/types/market';

const REVALIDATE = 3600;

type RawKline = [
  number, // openTime
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  number, // closeTime
  ...unknown[],
];

export async function getKlines(limit = 300): Promise<ServiceResult<Candle[]>> {
  const url = `${BINANCE_BASE_URL}/api/v3/klines?symbol=${SYMBOL}&interval=1d&limit=${limit}`;
  try {
    const raw = await fetchJson<RawKline[]>(url, { revalidate: REVALIDATE });
    const candles: Candle[] = raw.map((k) => ({
      openTime: k[0],
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
      closeTime: k[6],
    }));
    return ok(candles);
  } catch (err) {
    logger.error('binance.getKlines failed', { err: errorMessage(err) });
    return fail<Candle[]>(errorMessage(err));
  }
}

interface RawTicker {
  lastPrice: string;
  openPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
}

export async function getPriceSnapshot(): Promise<ServiceResult<PriceSnapshot>> {
  const url = `${BINANCE_BASE_URL}/api/v3/ticker/24hr?symbol=${SYMBOL}`;
  try {
    const t = await fetchJson<RawTicker>(url, { revalidate: 300 });
    return ok({
      price: Number(t.lastPrice),
      openPrice: Number(t.openPrice),
      priceChangePercent: Number(t.priceChangePercent),
      high24h: Number(t.highPrice),
      low24h: Number(t.lowPrice),
      volume24h: Number(t.volume),
    });
  } catch (err) {
    logger.error('binance.getPriceSnapshot failed', { err: errorMessage(err) });
    return fail<PriceSnapshot>(errorMessage(err));
  }
}

interface RawOiHist {
  sumOpenInterest: string;
  sumOpenInterestValue: string;
  timestamp: number;
}

export async function getOpenInterest(): Promise<ServiceResult<OpenInterestData>> {
  const url = `${BINANCE_FUTURES_BASE_URL}/futures/data/openInterestHist?symbol=${SYMBOL}&period=1d&limit=2`;
  try {
    const rows = await fetchJson<RawOiHist[]>(url, { revalidate: REVALIDATE });
    if (rows.length < 2) throw new Error('insufficient open interest history');
    const previous = Number(rows[0].sumOpenInterest);
    const latest = rows[rows.length - 1];
    return ok({
      current: Number(latest.sumOpenInterest),
      previous,
      notionalUsd: Number(latest.sumOpenInterestValue),
    });
  } catch (err) {
    logger.error('binance.getOpenInterest failed', { err: errorMessage(err) });
    return fail<OpenInterestData>(errorMessage(err));
  }
}

interface RawFunding {
  fundingRate: string;
  fundingTime: number;
}

export async function getFundingRate(): Promise<ServiceResult<FundingRateData>> {
  const url = `${BINANCE_FUTURES_BASE_URL}/fapi/v1/fundingRate?symbol=${SYMBOL}&limit=1`;
  try {
    const rows = await fetchJson<RawFunding[]>(url, { revalidate: REVALIDATE });
    if (!rows.length) throw new Error('no funding rate data');
    const rate8h = Number(rows[rows.length - 1].fundingRate);
    return ok({ rate8h, rateDaily: rate8h * 3 });
  } catch (err) {
    logger.error('binance.getFundingRate failed', { err: errorMessage(err) });
    return fail<FundingRateData>(errorMessage(err));
  }
}
