import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types'

const TransactionTypeC = t.keyof({
  withdrawal: null,
  deposit: null,
})
export type TransactionType = t.TypeOf<typeof TransactionTypeC>

const TransactionStatusC = t.keyof({
  pending: null,
  completed: null,
})
export type TransactionStatus = t.TypeOf<typeof TransactionStatusC>

const SupportedCurrenciesC = t.keyof({
  USD: null,
  BTC: null,
  CHF: null,
})
export type SupportedCurrencies = t.TypeOf<typeof SupportedCurrenciesC>

export const TransactionC = t.readonly(
  t.type({
    id: t.string,
    timestamp: DateFromISOString,
    type: TransactionTypeC,
    status: TransactionStatusC,
    currency: SupportedCurrenciesC,
    amount: t.number,
  }),
)
export interface Transaction extends t.TypeOf<typeof TransactionC> {}
