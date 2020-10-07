import 'reflect-metadata';

import {green, red} from 'chalk';
import {Request, Response} from 'express';
import {injectable} from 'tsyringe';
import {SqlLiteDataBase} from '../../config/sql-lite-database';
import {isEmpty as _isEmpty, isNil as _isNil} from 'lodash';
import {BAD_REQUEST, GONE, INTERNAL_SERVER_ERROR, OK} from 'http-status';
import {number, object, string, ValidationError} from 'joi';
import {Product} from '../../model/product';
import {Database} from 'sqlite3';
import {Transaction} from '../../model/transaction';

@injectable()
export class ProductController {
  private static database: Database;

  private static readonly baseTransaction: Transaction<Product> = {
    success: false,
    data: {} as Product,
  };

  private static readonly productIdValidator = object().keys({
    productId: number().required().min(0),
  });

  private static readonly updateProductValidator = object().keys({
    id: number().required(),
    color: string().optional(),
    cost: number().optional(),
    name: string().optional(),
    retired: number().optional(),
    size: string().optional(),
  });

  private static readonly createProductValidator = object().keys({
    color: string().required(),
    cost: number().required(),
    name: string().required(),
    retired: number().required(),
    size: string().required(),
  });

  constructor(private sqlLiteDataBase: SqlLiteDataBase) {
    ProductController.database = sqlLiteDataBase.database;
  }

  public async findOne({params}: Request, response: Response): Promise<any> {
    try {
      const {error} = ProductController.productIdValidator.validate(params);
      if (!_isEmpty(error)) {
        ProductController.badRequest(response, error);
      } else {
        ProductController.database.serialize(() => {
          const query = SqlLiteDataBase.productFindOnPrimaryKey.replace(
            '?',
            params.productId
          );

          console.log(green(`[Server] executing query: ${query}`));

          ProductController.database.get(query, (error: Error | null, row) => {
            ProductController.gone(row, response);

            console.log(green(`[Server] found product ${JSON.stringify(row)}`));

            response.status(OK).send({
              success: true,
              data: {
                color: row?.color,
                cost: row?.cost,
                id: row?.id,
                name: row?.name,
                retired: row?.retired,
                size: row?.size,
              } as Product,
            });

            // we only care about the first result in this case, so i'm returning early.
            return;
          });
        });
      }
    } catch (err) {
      ProductController.internalServerError(response, err);
    }
  }

  public async update({body}: Request, response: Response): Promise<any> {
    try {
      const {error} = ProductController.updateProductValidator.validate(body);

      if (!_isEmpty(error)) {
        ProductController.badRequest(response, error);
      } else {
        ProductController.database.serialize(() => {
          const query = SqlLiteDataBase.productFindOnPrimaryKey.replace(
            '?',
            body.id
          );

          console.log(green(`[Server] executing query: ${query}`));

          ProductController.database.get(query, (error: Error | null, row) => {
            ProductController.gone(row, response);

            console.log(green(`[Server] found product ${JSON.stringify(row)}`));

            const {id, color, cost, name, retired, size} = body as Product;
            const updatedProduct = {
              ...row,
              ...{id, color, cost, name, retired, size},
            } as Product;

            const stmt = ProductController.database.prepare(
              SqlLiteDataBase.productUpdateStatement
            );

            stmt.run(
              updatedProduct?.color,
              updatedProduct?.name,
              updatedProduct?.retired,
              updatedProduct?.size,
              updatedProduct?.cost,
              updatedProduct?.id
            );
            stmt.finalize();

            response.status(OK).send({
              success: true,
              data: {
                color: updatedProduct?.color,
                cost: updatedProduct?.cost,
                id: updatedProduct?.id,
                name: updatedProduct?.name,
                retired: updatedProduct?.retired,
                size: updatedProduct?.size,
              } as Product,
            });

            // we only care about the first result in this case, so i'm returning early.
            return;
          });
        });
      }
    } catch (error) {
      ProductController.internalServerError(response, error);
    }
  }

  public async remove({params}: Request, response: Response): Promise<any> {
    try {
      const {error} = await ProductController.productIdValidator.validateAsync(
        params
      );

      if (!_isEmpty(error)) {
        ProductController.badRequest(response, error);
      } else {
        ProductController.database.serialize(() => {
          // begin preparing to remove on primary key.
          const stmt = ProductController.database.prepare(
            SqlLiteDataBase.productDeleteOnPrimaryKey
          );

          console.log(
            green(
              `[Server] executing query: ${SqlLiteDataBase.productDeleteOnPrimaryKey}`
            )
          );

          stmt.run(params.productId);
          stmt.finalize();

          const queryForRemovedData = SqlLiteDataBase.productFindOnPrimaryKey.replace(
            '?',
            params.productId
          );

          console.log(
            green(`[Server] executing query: ${queryForRemovedData}`)
          );

          ProductController.database.get(
            queryForRemovedData,
            (error: Error | null, row) => {
              console.log(
                green(`[Server] product was not found. ${JSON.stringify(row)}`)
              );

              response
                .status(OK)
                .send({success: true, data: {id: params.productId}});

              // we only care about the first result in this case, so i'm returning early.
              return;
            }
          );
        });
      }
    } catch (error) {
      console.log(red(`[Server] ${error})`));
      response
        .status(INTERNAL_SERVER_ERROR)
        .send({message: 'Internal Server Error'});
    }
  }

  public async create({body}: Request, response: Response): Promise<any> {
    try {
      const {error} = ProductController.createProductValidator.validate(body);

      if (!_isEmpty(error)) {
        ProductController.badRequest(response, error);
      } else {
        ProductController.database.serialize(() => {
          // begin creating an insert statement.
          console.log(
            green(
              `[Server] executing query: ${SqlLiteDataBase.productInsertStatement}`
            )
          );
          const stmt = ProductController.database.prepare(
            SqlLiteDataBase.productInsertStatement
          );
          stmt.run(body.color, body.name, body.retired, body.size, body.cost);
          stmt.finalize();
          // begin going to find the newly inserted value from the database.
          console.log(
            green(
              `[Server] executing query: ${SqlLiteDataBase.productFindOnMaxPrimaryKey}`
            )
          );

          ProductController.database.get(
            SqlLiteDataBase.productFindOnMaxPrimaryKey,
            (error: Error | null, row) => {
              console.log(
                green(`[Server] found product: ${JSON.stringify(row)}`)
              );

              response.status(OK).send({
                success: true,
                data: {
                  color: row?.color,
                  cost: row?.cost,
                  id: row?.id,
                  name: row?.name,
                  retired: row?.retired,
                  size: row?.size,
                } as Product,
              });

              // we only care about the first result in this case, so i'm returning early.
              return;
            }
          );
        });
      }
    } catch (error) {
      await ProductController.internalServerError(response, error);
    }
  }

  private static async gone(row: any, response: Response): Promise<void> {
    if (_isNil(row)) {
      console.log(
        red(`[Server] Resource was not found and was ${JSON.stringify(row)}`)
      );

      response.status(GONE).send({
        ...ProductController.baseTransaction,
        message: 'Resource is gone',
      } as Transaction<Product>);
    }
  }

  private static async badRequest(
    response: Response,
    error: ValidationError | undefined
  ): Promise<void> {
    console.log(
      red(
        `[Server] Invalid data format was sent to the server ${JSON.stringify(
          error?.details
        )}`
      )
    );

    response.status(BAD_REQUEST).send({
      ...ProductController.baseTransaction,
      message: 'Bad Request',
    } as Transaction<Product>);
  }

  private static async internalServerError(
    response: Response,
    error: Error
  ): Promise<void> {
    console.log(red(`[Server] Internal server error was: ${error}`));
    response.status(INTERNAL_SERVER_ERROR).send({
      ...ProductController.baseTransaction,
      message: 'Internal Server Error',
    } as Transaction<Product>);
  }
}
