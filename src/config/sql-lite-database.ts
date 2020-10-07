import {Database} from 'sqlite3';
import {isNil as _isNil} from 'lodash';
import {red, green} from 'chalk';
import {singleton} from 'tsyringe';
import {Product} from '../model/product';

@singleton()
export class SqlLiteDataBase {
  private static readonly databaseMode: string | ':memory:' = ':memory:';
  private readonly logger = console.log;

  private static readonly productTableName: string = 'Products';
  private static readonly primaryColumn: keyof Product = 'id';
  private static readonly colorColumn: keyof Product = 'color';
  private static readonly costColumn: keyof Product = 'cost';
  private static readonly nameColumn: keyof Product = 'name';
  private static readonly retiredColumn: keyof Product = 'retired';
  private static readonly sizeColumn: keyof Product = 'size';

  private readonly createProductSchema: string = `
  CREATE TABLE IF NOT EXISTS ${SqlLiteDataBase.productTableName} (
    ${SqlLiteDataBase.primaryColumn} ${'INTEGER'} PRIMARY KEY AUTOINCREMENT,
    ${SqlLiteDataBase.colorColumn} ${'TEXT'} NOT NULL,
    ${SqlLiteDataBase.nameColumn} ${'TEXT'} NOT NULL,
    ${SqlLiteDataBase.retiredColumn} ${'INTEGER'} DEFAULT 0,
    ${SqlLiteDataBase.sizeColumn} ${'INTEGER'} DEFAULT 0,
    ${SqlLiteDataBase.costColumn} ${'INTEGER'} DEFAULT 0
  );`;

  public static readonly productFindOnMaxPrimaryKey: string = `SELECT * FROM ${SqlLiteDataBase.productTableName} WHERE ${SqlLiteDataBase.primaryColumn}=(SELECT MAX(${SqlLiteDataBase.primaryColumn}) FROM ${SqlLiteDataBase.productTableName});`;
  public static readonly productInsertStatement: string = `INSERT INTO ${SqlLiteDataBase.productTableName} (${SqlLiteDataBase.colorColumn}, ${SqlLiteDataBase.nameColumn}, ${SqlLiteDataBase.retiredColumn}, ${SqlLiteDataBase.sizeColumn}, ${SqlLiteDataBase.costColumn}) VALUES(?, ?, ?, ?, ?);`;
  public static readonly productUpdateStatement: string = `UPDATE ${SqlLiteDataBase.productTableName} SET ${SqlLiteDataBase.colorColumn}=?, ${SqlLiteDataBase.nameColumn}=?, ${SqlLiteDataBase.retiredColumn}=?, ${SqlLiteDataBase.sizeColumn}=?, ${SqlLiteDataBase.costColumn}=? WHERE ${SqlLiteDataBase.primaryColumn} = ?;`;
  public static readonly productDeleteOnPrimaryKey: string = `DELETE FROM ${SqlLiteDataBase.productTableName} WHERE ${SqlLiteDataBase.primaryColumn} =?;`;
  public static readonly productFindOnPrimaryKey: string = `SELECT * FROM ${SqlLiteDataBase.productTableName} WHERE ${SqlLiteDataBase.primaryColumn} =?;`;
  public database: Database;

  private readonly dummyData: Array<Omit<Product, 'id'>> = [
    {
      color: 'blue',
      cost: 1,
      name: 'whoa',
      retired: 1,
      size: 'small',
    },
    {
      color: 'blue',
      cost: 1,
      name: 'whoa',
      retired: 1,
      size: 'large',
    },
  ];

  constructor() {
    this.database = new Database(
      SqlLiteDataBase.databaseMode,
      (error: Error | null) => {
        if (_isNil(error)) {
          this.logger(
            green('[Server] Successfully connected to the database.')
          );
        } else {
          this.logger(
            red(
              `[Server] Something went wrong creating the databse: ${
                (error || {stack: null}).stack ?? 'message stack was nullish.'
              }`
            )
          );
        }
      }
    );

    this.populate();
  }

  private populate(): void {
    this.database.serialize(() => {
      this.database.run(this.createProductSchema);
      const stmt = this.database.prepare(
        SqlLiteDataBase.productInsertStatement
      );
      this.dummyData.forEach(product => {
        stmt.run(
          product.color,
          product.name,
          product.retired,
          product.size,
          product.cost
        );
      });
      stmt.finalize();
    });
  }
}
