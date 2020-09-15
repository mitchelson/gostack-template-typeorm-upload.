import csvParse from 'csv-parse';
import fs from 'fs';

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

async function getTransactionsFromCSVFile(
  csvFilePath: string,
): Promise<CSVTransaction[]> {
  const readCSVStream = fs.createReadStream(csvFilePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: CSVTransaction[] = [];

  parseCSV.on('data', ([title, type, value, category]) => {
    if (title && type && value) {
      lines.push({
        title,
        type,
        value,
        category,
      });
    }
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

export default getTransactionsFromCSVFile;