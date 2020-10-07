import 'reflect-metadata';

import {Router} from 'express';
import {container} from 'tsyringe';
import {ProductController} from './product.controller';

const productRouter: Router = Router();
const productController: ProductController = container.resolve(
  ProductController
);

productRouter.post('/', productController.create);
productRouter.patch('/', productController.update);
productRouter.get('/:productId', productController.findOne);
productRouter.delete('/:productId', productController.remove);

export {productRouter};
