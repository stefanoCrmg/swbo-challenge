import * as t from 'io-ts'
import { optionFromNullable } from 'io-ts-types'

export const EurRatesResponseC = t.readonly(
  t.type({
    BTC: optionFromNullable(t.number),
    CHF: optionFromNullable(t.number),
    USD: optionFromNullable(t.number),
  }),
)
export interface EurRatesResponse extends t.TypeOf<typeof EurRatesResponseC> {}
