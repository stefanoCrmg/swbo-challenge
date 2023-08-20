import * as TE from '@fp/TaskEither'
import { useQuery } from '@tanstack/react-query'
import { sequenceS } from 'fp-ts/Apply'
import * as O from 'fp-ts/Option'
import * as Monoid from 'fp-ts/lib/Monoid'
import { flow } from 'fp-ts/lib/function'
import { useState } from 'react'
import { FetchOrDecodingErrors } from 'src/fetch'
import { match } from 'ts-pattern'
import { EurRatesResponse } from '../codecs'
import { getEurRates } from '../repository/eurRates'

export type EurRates = {
  readonly BTC: number
  readonly CHF: number
  readonly USD: number
}

const REFETCH_INTERVAL_MILLSECONDS = 1000 as const

const groupRates: (rates: EurRatesResponse) => O.Option<EurRates> = sequenceS(
  O.Apply,
)
const checkIfEveryRateHasBeenFound: (rates: EurRatesResponse) => boolean = flow(
  groupRates,
  O.isSome,
)

const getLatestGoodEurRate = Monoid.struct<EurRatesResponse>({
  BTC: O.getLastMonoid(),
  CHF: O.getLastMonoid(),
  USD: O.getLastMonoid(),
})

type EurRatesQueryResults =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; error: FetchOrDecodingErrors }
  | { readonly status: 'success'; data: EurRates }
export const useEurRates = (): EurRatesQueryResults => {
  const [eurRatesCache, setEurRatesCache] = useState<EurRatesResponse>({
    BTC: O.none,
    CHF: O.none,
    USD: O.none,
  })

  const eurRates = useQuery<
    EurRatesResponse,
    FetchOrDecodingErrors,
    EurRatesResponse,
    string[]
  >(['eurRates'], () => TE.unsafeUnwrap(getEurRates), {
    refetchInterval: (data) => {
      if (!data) return false
      return checkIfEveryRateHasBeenFound(eurRatesCache)
        ? false
        : REFETCH_INTERVAL_MILLSECONDS
    },
    onSuccess: (data) => {
      const latestRates = Monoid.concatAll(getLatestGoodEurRate)([
        eurRatesCache,
        data,
      ])
      setEurRatesCache(latestRates)
    },
  })

  return match(eurRates)
    .with({ status: 'error' }, ({ error }) => ({
      status: 'error' as const,
      error,
    }))
    .with({ status: 'loading' }, () => ({ status: 'loading' as const }))
    .with({ status: 'success' }, () => {
      const groupedRates = groupRates(eurRatesCache)
      const everyRateCached = O.isSome(groupedRates)

      return everyRateCached
        ? {
            status: 'success' as const,
            data: groupedRates.value,
          }
        : { status: 'loading' as const }
    })
    .exhaustive()
}
