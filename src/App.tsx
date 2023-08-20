import * as TE from '@fp/TaskEither'
import { useQuery } from '@tanstack/react-query'
import { getTransactions } from './repository/transactions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'
import { useEurRates } from './hooks/useEurRates'
import { TransactionTable } from './components/TransactionsTable'
import { AggregatedTransactionTable } from './components/AggregatedTransactionsTable'

const queryClient = new QueryClient()

const Content: React.FC = () => {
  const allTransactions = useQuery(['all-transactions'], () =>
    TE.unsafeUnwrap(getTransactions),
  )
  const eurRates = useEurRates()

  return match([allTransactions, eurRates])
    .with([{ status: 'error' }, P._], () => (
      <div>Error fetching all transactions</div>
    ))
    .with([P._, { status: 'error' }], () => <div>Error fetching EUR rates</div>)
    .with(
      [{ status: 'success' }, { status: 'success' }],
      ([transactions, rates]) => (
        <>
          <TransactionTable
            transactions={transactions.data}
            eurRates={rates.data}
          />
          <AggregatedTransactionTable
            transactions={transactions.data}
            eurRates={rates.data}
          />
        </>
      ),
    )
    .otherwise(() => (
      <div>Fetching latest rates and transactions. This may take a while.</div>
    ))
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Content />
    </QueryClientProvider>
  )
}

export default App
