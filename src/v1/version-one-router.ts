import {Router} from 'express';
import {productRouter} from './users/product-route';

const versionOneRouter: Router = Router();

versionOneRouter.use('/products', productRouter);

export {versionOneRouter};
