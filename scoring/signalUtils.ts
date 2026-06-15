import { signalLabel } from '@/lib/constants';
import type {
  CategoryKey,
  SignalResult,
  SignalValue,
} from '@/types/score';

export interface SignalSpec {
  id: string;
  name: string;
  category: CategoryKey;
  description: string;
}

export interface SignalInput {
  value: SignalValue;
  detail: string;
  rawValue?: string;
  isStale: boolean;
  available: boolean;
}

/** Build a fully-typed SignalResult from a spec and evaluated input. */
export function makeSignal(spec: SignalSpec, input: SignalInput): SignalResult {
  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    description: spec.description,
    value: input.value,
    label: signalLabel(input.value),
    detail: input.detail,
    rawValue: input.rawValue,
    isStale: input.isStale,
    available: input.available,
  };
}

/** Build a "data unavailable" signal that is excluded from the score. */
export function unavailableSignal(
  spec: SignalSpec,
  reason: string,
): SignalResult {
  return makeSignal(spec, {
    value: 0,
    detail: `Data unavailable — ${reason}`,
    rawValue: 'N/A',
    isStale: true,
    available: false,
  });
}
