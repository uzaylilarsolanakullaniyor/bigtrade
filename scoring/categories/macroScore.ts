import { buildCategoryScore } from '../normalizer';
import { dxySignal } from '../signals/dxySignal';
import { nasdaqSignal } from '../signals/nasdaqSignal';
import { sp500Signal } from '../signals/sp500Signal';
import { oilSignal } from '../signals/oilSignal';
import { cpiSignal } from '../signals/cpiSignal';
import { fedSignal } from '../signals/fedSignal';
import type { ServiceResult } from '@/types/api';
import type { CpiData, FedOutlookData, SeriesChange } from '@/types/macro';
import type { CategoryScore } from '@/types/score';

export interface MacroInputs {
  dxy: ServiceResult<SeriesChange>;
  nasdaq: ServiceResult<SeriesChange>;
  sp500: ServiceResult<SeriesChange>;
  wti: ServiceResult<SeriesChange>;
  cpi: ServiceResult<CpiData>;
  fed: ServiceResult<FedOutlookData>;
}

export function macroScore(inputs: MacroInputs): CategoryScore {
  const signals = [
    dxySignal(inputs.dxy),
    nasdaqSignal(inputs.nasdaq),
    sp500Signal(inputs.sp500),
    oilSignal(inputs.wti),
    cpiSignal(inputs.cpi),
    fedSignal(inputs.fed),
  ];
  return buildCategoryScore('macro', signals);
}
