import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import * as Date from 'fp-ts/Date'
import * as Ord from 'fp-ts/Ord'
import { Transaction } from 'src/codecs'
import { EurRates } from 'src/hooks/useEurRates'
import { pipe } from 'fp-ts/lib/function'
import { eurFormatter } from 'src/utils/formatter'
import { safeMul } from 'src/utils/numbersUtils'

type TransactionsTableProps = {
  readonly transactions: RNEA.ReadonlyNonEmptyArray<Transaction>
  readonly eurRates: EurRates
}

const byTimestamp: Ord.Ord<Transaction> = pipe(
  Date.Ord,
  Ord.contramap((transaction) => transaction.timestamp),
)

export const TransactionTable: React.FC<TransactionsTableProps> = ({
  transactions,
  eurRates,
}) => {
  const ordereredTransactions = RNEA.sortBy([byTimestamp])(transactions)
  return (
    <table className="table-auto">
      <thead className="bg-green-300">
        <tr>
          <th className="border-2 border-slate-800">Timestamp</th>
          <th className="border-2 border-slate-800">Currency</th>
          <th className="border-2 border-slate-800">Amount</th>
          <th className="border-2 border-slate-800">EUR Equivalent</th>
          <th className="border-2 border-slate-800">Type</th>
          <th className="border-2 border-slate-800">Status</th>
        </tr>
      </thead>
      <tbody>
        {ordereredTransactions.map((data, index) => (
          <tr key={`unsafe-transaction-table-key-${index}`}>
            <td>{data.timestamp.toDateString()}</td>
            <td>{data.currency}</td>
            <td>{data.amount}</td>
            <td>
              {eurFormatter(safeMul(data.amount, eurRates[data.currency]))}
            </td>
            <td>{data.type}</td>
            <td>{data.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
