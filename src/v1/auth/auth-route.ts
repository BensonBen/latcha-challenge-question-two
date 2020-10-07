import 'reflect-metadata';

import {Router} from 'express';
import {AuthController} from './auth.controller';
import {container} from 'tsyringe';

const authRouter: Router = Router();
const authController: AuthController = container.resolve(AuthController);

authRouter.post('/authenticate', authController.authenticate);

export {authRouter};
