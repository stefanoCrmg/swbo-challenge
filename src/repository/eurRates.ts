import { flow, pipe } from 'fp-ts/function'
import * as TE from '@fp/TaskEither'
import * as E from 'fp-ts/Either'
import * as Codecs from '../codecs'
import {
  FetchError,
  fromFetch,
  getJson,
  NotJson,
  JsonParseError,
  DecodingFailure,
} from '../fetch'

export const getEurRates: TE.TaskEither<
  FetchError | NotJson | JsonParseError | DecodingFailure,
  Codecs.EurRatesResponse
> = pipe(
  fromFetch('http://localhost:8080/api/eur-rates', {
    method: 'GET',
  }),
  TE.flatMap(getJson),
  TE.flatMapEither(
    flow(
      Codecs.EurRatesResponseC.decode,
      E.mapLeft(() => new DecodingFailure()),
    ),
  ),
)
