import { expect, test } from 'vitest'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import {
  TransactionsCumulatedData,
  aggregateTransactionsByCurrency,
} from 'src/components/AggregatedTransactionsTable'
import { Transaction } from 'src/codecs'

test('Given two completed USD deposits to have the correct totalBalance', () => {
  const someTransactions: RNEA.ReadonlyNonEmptyArray<Transaction> = [
    {
      id: '12cc7884-803a-436a-ab4e-506cf7cc9e50',
      timestamp: new Date(),
      type: 'deposit',
      status: 'completed',
      currency: 'USD',
      amount: 0.01,
    },
    {
      id: 'fc937bc7-c7e8-4d95-9943-ad85783c63cf',
      timestamp: new Date(),
      type: 'deposit',
      status: 'completed',
      currency: 'USD',
      amount: 100,
    },
  ]

  const expectations: Readonly<Record<'USD', TransactionsCumulatedData>> = {
    USD: {
      totalCompletedWithdrawals: 0,
      totalCompletedDeposits: 2,
      totalPendingWithdrawals: 0,
      totalPendingDeposits: 0,
      totalBalance: 100.01,
    },
  }
  const aggregate = aggregateTransactionsByCurrency(someTransactions)
  expect(aggregate).toMatchObject(expectations)
})

test('Given a completed deposit and multiple pending deposits, the total balance should equal the completed deposit amount', () => {
  const someTransactions: RNEA.ReadonlyNonEmptyArray<Transaction> = [
    {
      id: '12cc7884-803a-436a-ab4e-506cf7cc9e50',
      timestamp: new Date(),
      type: 'deposit',
      status: 'completed',
      currency: 'BTC',
      amount: 100,
    },
    {
      id: 'fc937bc7-c7e8-4d95-9943-ad85783c63cf',
      timestamp: new Date(),
      type: 'deposit',
      status: 'pending',
      currency: 'BTC',
      amount: 5555,
    },
    {
      id: 'fc937bc7-c7e8-4d95-9943-ad85783c63cf',
      timestamp: new Date(),
      type: 'deposit',
      status: 'pending',
      currency: 'BTC',
      amount: 33333,
    },
  ]

  const expectations: Readonly<Record<'BTC', TransactionsCumulatedData>> = {
    BTC: {
      totalCompletedWithdrawals: 0,
      totalCompletedDeposits: 1,
      totalPendingWithdrawals: 0,
      totalPendingDeposits: 2,
      totalBalance: 100,
    },
  }
  const aggregate = aggregateTransactionsByCurrency(someTransactions)
  expect(aggregate).toMatchObject(expectations)
})

test('Given one completed USD withdrawal and one completed USD deposit to have a negative balance if the withdrawal is somehow bigger than the deposit', () => {
  const someTransactions: RNEA.ReadonlyNonEmptyArray<Transaction> = [
    {
      id: '12cc7884-803a-436a-ab4e-506cf7cc9e50',
      timestamp: new Date(),
      type: 'deposit',
      status: 'completed',
      currency: 'USD',
      amount: 0.94,
    },
    {
      id: 'fc937bc7-c7e8-4d95-9943-ad85783c63cf',
      timestamp: new Date(),
      type: 'withdrawal',
      status: 'completed',
      currency: 'USD',
      amount: 200,
    },
  ]

  const expectations: Readonly<Record<'USD', TransactionsCumulatedData>> = {
    USD: {
      totalCompletedWithdrawals: 1,
      totalCompletedDeposits: 1,
      totalPendingWithdrawals: 0,
      totalPendingDeposits: 0,
      totalBalance: -199.06,
    },
  }
  const aggregate = aggregateTransactionsByCurrency(someTransactions)
  expect(aggregate).toMatchObject(expectations)
})

test('Given multiple completed withdrawal the balance should be negative', () => {
  const someTransactions: RNEA.ReadonlyNonEmptyArray<Transaction> = [
    {
      id: '12cc7884-803a-436a-ab4e-506cf7cc9e50',
      timestamp: new Date(),
      type: 'withdrawal',
      status: 'completed',
      currency: 'CHF',
      amount: 500,
    },
    {
      id: 'fc937bc7-c7e8-4d95-9943-ad85783c63cf',
      timestamp: new Date(),
      type: 'withdrawal',
      status: 'completed',
      currency: 'CHF',
      amount: 500,
    },
  ]

  const expectations: Readonly<Record<'CHF', TransactionsCumulatedData>> = {
    CHF: {
      totalCompletedWithdrawals: 2,
      totalCompletedDeposits: 0,
      totalPendingWithdrawals: 0,
      totalPendingDeposits: 0,
      totalBalance: -1000,
    },
  }
  const aggregate = aggregateTransactionsByCurrency(someTransactions)
  expect(aggregate).toMatchObject(expectations)
})

test('Given multiple completed and pending withdrawals the balance should be negative and the pending amount should not have any effect on the total balance', () => {
  const someTransactions: RNEA.ReadonlyNonEmptyArray<Transaction> = [
    {
      id: '12cc7884-803a-436a-ab4e-506cf7cc9e50',
      timestamp: new Date(),
      type: 'withdrawal',
      status: 'completed',
      currency: 'CHF',
      amount: 500,
    },
    {
      id: 'fc937bc7-c7e8-4d95-9943-ad85783c63cf',
      timestamp: new Date(),
      type: 'withdrawal',
      status: 'completed',
      currency: 'CHF',
      amount: 500,
    },
    {
      id: 'adz937bc7-c7e8-4d95-9943-ad85783c63cf',
      timestamp: new Date(),
      type: 'withdrawal',
      status: 'pending',
      currency: 'CHF',
      amount: 500,
    },
    {
      id: 'bb937bc7-c7e8-4d95-9943-ad85783c63cf',
      timestamp: new Date(),
      type: 'withdrawal',
      status: 'pending',
      currency: 'CHF',
      amount: 500,
    },
  ]

  const expectations: Readonly<Record<'CHF', TransactionsCumulatedData>> = {
    CHF: {
      totalCompletedWithdrawals: 2,
      totalCompletedDeposits: 0,
      totalPendingWithdrawals: 2,
      totalPendingDeposits: 0,
      totalBalance: -1000,
    },
  }
  const aggregate = aggregateTransactionsByCurrency(someTransactions)
  expect(aggregate).toMatchObject(expectations)
})
