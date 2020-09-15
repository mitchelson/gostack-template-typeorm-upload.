import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce(
      (incomeTotal, { value, type }) =>
        type === 'income' ? incomeTotal + Number(value) : incomeTotal,
      0,
    );

    const outcome = transactions.reduce(
      (incomeTotal, { value, type }) =>
        type === 'outcome' ? incomeTotal + Number(value) : incomeTotal,
      0,
    );

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;