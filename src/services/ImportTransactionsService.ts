import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

import getTransactionsFromCSVFile from '../helpers/getTransactionsFromCSVFile';

class ImportTransactionsService {
  async execute(csvPath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (!csvPath) {
      throw new AppError('CSV file does not exists');
    }

    const transactionsFromCSVFormatted = await getTransactionsFromCSVFile(
      csvPath,
    );

    const categoriesFromCSVFile = transactionsFromCSVFormatted
      .map(transaction => transaction.category)
      .filter((category, index, self) => self.indexOf(category) === index);

    const foundCategories = await categoriesRepository.find();
    const foundCategoriesTitle = foundCategories.map(
      category => category.title,
    );

    const categoriesToAdd = categoriesFromCSVFile
      .filter(category => !foundCategoriesTitle.includes(category))
      .map(category => categoriesRepository.create({ title: category }));

    await categoriesRepository.save(categoriesToAdd);

    const transactions = transactionsFromCSVFormatted.map(transactionInfo => {
      const { title, type, value, category } = transactionInfo;

      const categoryInfo = categoriesToAdd.find(
        categoryToAdd => categoryToAdd.title === category,
      );

      let categoryId;

      if (categoryInfo) {
        categoryId = categoryInfo.id;
      }

      const transaction = transactionsRepository.create({
        title,
        type,
        value,
        category_id: categoryId,
      });

      return transaction;
    });

    await transactionsRepository.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;