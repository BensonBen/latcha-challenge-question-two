import {green, red} from 'chalk';
import {Request, Response} from 'express';
import {singleton} from 'tsyringe';
import {SqlLiteDataBase} from '../../config/sql-lite-database';
import {isEmpty as _isEmpty} from 'lodash';
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, OK} from 'http-status';
import {number, object, string} from 'joi';
import {Product} from '../../model/product';
import {Database} from 'sqlite3';

@singleton()
export class ProductController {
  private static database: Database;

  constructor(private sqlLiteDataBase: SqlLiteDataBase) {
    ProductController.database = sqlLiteDataBase.database;
  }

  public async findOne({params}: Request, response: Response): Promise<any> {
    const result: any = {
      success: false,
      data: null,
    };

    try {
      const {error: validationObject} = object()
        .keys({
          productId: string().required(),
        })
        .validate(params);

      if (!_isEmpty(validationObject)) {
        console.log(
          red(
            `[Server] Invalid data format was sent to the server ${JSON.stringify(
              validationObject?.details
            )}`
          )
        );
        response.status(BAD_REQUEST).send({...result, message: 'Bad Request'});
      } else {
        ProductController.database.serialize(() => {
          const query = SqlLiteDataBase.productFindOnPrimaryKey.replace(
            '?',
            params.productId
          );

          console.log(green(`[Server] executing query: ${query}`));

          ProductController.database.get(query, (error: Error | null, row) => {
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
      console.log(red(err));
      response.status(INTERNAL_SERVER_ERROR).send(result);
    }
  }

  public async update({body}: Request, response: Response): Promise<any> {
    const result: any = {
      success: false,
      data: null,
    };

    try {
      const {error: validationObject} = object()
        .keys({
          id: number().required(),
          color: string().optional(),
          cost: number().optional(),
          name: string().optional(),
          retired: number().optional(),
          size: string().optional(),
        })
        .validate(body);

      if (!_isEmpty(validationObject)) {
        console.log(
          red(
            `[Server] Invalid data format was sent to the server. Received ${JSON.stringify(
              body
            )} Rejected: ${JSON.stringify(validationObject?.details)}`
          )
        );
        response.status(BAD_REQUEST).send({...result, message: 'Bad Request'});
      } else {
        ProductController.database.serialize(() => {
          const query = SqlLiteDataBase.productFindOnPrimaryKey.replace(
            '?',
            body.id
          );

          console.log(green(`[Server] executing query: ${query}`));

          ProductController.database.get(query, (error: Error | null, row) => {
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
    } catch (err) {
      console.log(red(err));
      response.status(INTERNAL_SERVER_ERROR).send(result);
    }
  }

  public async remove({params}: Request, response: Response): Promise<any> {
    const result: any = {
      success: false,
      data: null,
    };

    try {
      const {error: validationObject} = object()
        .keys({
          productId: string().required(),
        })
        .validate(params);

      if (!_isEmpty(validationObject)) {
        console.log(
          red(
            `[Server] Invalid data format was sent to the server. Received ${JSON.stringify(
              params
            )} Rejected: ${JSON.stringify(validationObject?.details)}`
          )
        );
        response.status(BAD_REQUEST).send({...result, message: 'Bad Request'});
      } else {
        ProductController.database.serialize(() => {
          const stmt = ProductController.database.prepare(
            SqlLiteDataBase.productDeleteOnPrimaryKey
          );

          stmt.run(params.productId);
          stmt.finalize();

          const queryForRemovedData = SqlLiteDataBase.productFindOnMaxPrimaryKey.replace(
            '?',
            params.productId
          );

          console.log(
            green(
              `[Server] executing query: ${SqlLiteDataBase.productDeleteOnPrimaryKey}`
            )
          );

          ProductController.database.each(
            queryForRemovedData,
            (error: Error | null, row) => {
              console.log(green(`[Server] product was not found. ${row}`));

              response
                .status(OK)
                .send({success: true, data: {id: params.productId}});

              // we only care about the first result in this case, so i'm returning early.
              return;
            }
          );
        });
      }
    } catch (err) {
      console.log(red(err));
      response.status(INTERNAL_SERVER_ERROR).send(result);
    }
  }

  public async create({body}: Request, response: Response): Promise<any> {
    const result: any = {
      success: false,
      data: null,
    };

    try {
      const {error: validationObject} = object()
        .keys({
          color: string().required(),
          cost: number().required(),
          name: string().required(),
          retired: number().required(),
          size: string().required(),
        })
        .validate(body);

      if (!_isEmpty(validationObject)) {
        console.log(
          red(
            `[Server] Invalid data format was sent to the server. Received ${JSON.stringify(
              body
            )} Rejected: ${JSON.stringify(validationObject?.details)}`
          )
        );
        response.status(BAD_REQUEST).send({...result, message: 'Bad Request'});
      } else {
        ProductController.database.serialize(() => {
          const stmt = ProductController.database.prepare(
            SqlLiteDataBase.productInsertStatement
          );
          stmt.run(body.color, body.name, body.retired, body.size, body.cost);
          stmt.finalize();

          console.log(
            green(
              `[Server] executing query: ${SqlLiteDataBase.productFindOnMaxPrimaryKey}`
            )
          );

          ProductController.database.each(
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
    } catch (err) {
      console.log(red(err));
      response.status(INTERNAL_SERVER_ERROR).send(result);
    }
  }
}
