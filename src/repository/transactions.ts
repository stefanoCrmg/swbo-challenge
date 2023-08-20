import { flow, pipe } from 'fp-ts/function'
import * as TE from '@fp/TaskEither'
import * as E from 'fp-ts/Either'
import * as t from 'io-ts'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { Transaction, TransactionC } from '../codecs'
import {
  FetchError,
  fromFetch,
  getJson,
  NotJson,
  JsonParseError,
  DecodingFailure,
} from '../fetch'

const TransactionsResponseC = t.readonly(
  t.type({
    transactions: t.readonlyArray(TransactionC),
  }),
)
export interface TransactionsResponse
  extends t.TypeOf<typeof TransactionsResponseC> {}

class MissingTransactions {
  readonly _tag = 'MissingTransactions'
}

export const getTransactions: TE.TaskEither<
  FetchError | NotJson | JsonParseError | DecodingFailure | MissingTransactions,
  RNEA.ReadonlyNonEmptyArray<Transaction>
> = pipe(
  fromFetch('http://localhost:8080/api/transactions', {
    method: 'GET',
  }),
  TE.flatMap(getJson),
  TE.flatMapEither(
    flow(
      TransactionsResponseC.decode,
      E.mapLeft(() => new DecodingFailure()),
    ),
  ),
  TE.flatMapOption(
    ({ transactions }) => RNEA.fromReadonlyArray(transactions),
    () => new MissingTransactions(),
  ),
)
