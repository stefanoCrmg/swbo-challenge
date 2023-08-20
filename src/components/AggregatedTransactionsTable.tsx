import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import * as RR from 'fp-ts/ReadonlyRecord'
import { pipe } from 'fp-ts/lib/function'
import { Transaction } from 'src/codecs'
import { EurRates } from 'src/hooks/useEurRates'
import { eurFormatter } from 'src/utils/formatter'
import { safeAdd, safeMinus, safeMul } from 'src/utils/numbersUtils'
import { match } from 'ts-pattern'

type TransactionsCumulatedData = {
  readonly totalCompletedWithdrawals: number
  readonly totalCompletedDeposits: number
  readonly totalPendingWithdrawals: number
  readonly totalPendingDeposits: number
  readonly totalBalance: number
}

const initAggregatedTransactions: TransactionsCumulatedData = {
  totalCompletedWithdrawals: 0,
  totalCompletedDeposits: 0,
  totalPendingWithdrawals: 0,
  totalPendingDeposits: 0,
  totalBalance: 0,
}

const reduceTransactionData = (
  cumulatedData: TransactionsCumulatedData,
  nextTransaction: Transaction,
) =>
  match(nextTransaction)
    .with({ status: 'pending', type: 'deposit' }, () => ({
      ...cumulatedData,
      totalPendingDeposits: cumulatedData.totalPendingDeposits + 1,
    }))
    .with({ status: 'pending', type: 'withdrawal' }, () => ({
      ...cumulatedData,
      totalPendingWithdrawals: cumulatedData.totalPendingWithdrawals + 1,
    }))
    .with({ status: 'completed', type: 'deposit' }, ({ amount }) => ({
      ...cumulatedData,
      totalBalance: safeAdd(cumulatedData.totalBalance, amount),
      totalCompletedDeposits: cumulatedData.totalCompletedDeposits + 1,
    }))
    .with({ status: 'completed', type: 'withdrawal' }, ({ amount }) => ({
      ...cumulatedData,
      totalBalance: safeMinus(cumulatedData.totalBalance, amount),
      totalCompletedWithdrawals: cumulatedData.totalCompletedWithdrawals + 1,
    }))
    .exhaustive()

const aggregateTransactionsByCurrency = (
  transactionsArray: RNEA.ReadonlyNonEmptyArray<Transaction>,
): RR.ReadonlyRecord<Transaction['currency'], TransactionsCumulatedData> =>
  pipe(
    transactionsArray,
    RNEA.groupBy(({ currency }) => currency),
    RR.map(RNEA.reduce(initAggregatedTransactions, reduceTransactionData)),
  )

type TransactionsTableProps = {
  readonly transactions: RNEA.ReadonlyNonEmptyArray<Transaction>
  readonly eurRates: EurRates
}

export const AggregatedTransactionTable: React.FC<TransactionsTableProps> = ({
  transactions,
  eurRates,
}) => {
  const aggregatedTransactions = pipe(
    aggregateTransactionsByCurrency(transactions),
    RR.toReadonlyArray,
  )
  return (
    <table className="table-auto mt-4">
      <thead className="bg-amber-300">
        <tr>
          <th className="border-2 border-slate-800">Currency</th>
          <th className="border-2 border-slate-800">
            Total Completed Withdrawals
          </th>
          <th className="border-2 border-slate-800">
            Total Completed Deposits
          </th>
          <th className="border-2 border-slate-800">
            Total Pending Withdrawals
          </th>
          <th className="border-2 border-slate-800">Total Pending Deposits</th>
          <th className="border-2 border-slate-800">
            Total Balance (completed deposits - completed withdrawals)
          </th>
          <th className="border-2 border-slate-800">
            Total Balance [EUR equivalent]
          </th>
        </tr>
      </thead>
      <tbody>
        {aggregatedTransactions.map(([currency, data], index) => (
          <tr key={`unsafe-aggregated-transaction-table-key-${index}`}>
            <td>{currency}</td>
            <td>{data.totalCompletedWithdrawals}</td>
            <td>{data.totalCompletedDeposits}</td>
            <td>{data.totalPendingWithdrawals}</td>
            <td>{data.totalPendingDeposits}</td>
            <td>{data.totalBalance}</td>
            <td>
              {eurFormatter(safeMul(data.totalBalance, eurRates[currency]))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
