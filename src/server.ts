import {json, urlencoded} from 'body-parser';
import * as cors from 'cors';
import * as expressServer from 'express';
import {Application} from 'express';
import * as helmet from 'helmet';
// eslint-disable-next-line node/no-unpublished-import
import * as morgan from 'morgan';
import {versionOneRouter} from './v1/version-one-router';
import {ErrorHandler} from './util/error-handler';
import {singleton} from 'tsyringe';
import {green} from 'chalk';

@singleton()
export class ServerFactory {
  public readonly logger = console.log;

  constructor(private errorHandler: ErrorHandler) {}
  public generate(): Application {
    const express = expressServer();

    // Setup middleware.
    this.logger(green('[Server] creating server middleware.'));
    express.use(cors());
    express.use(morgan('dev'));
    express.use(json());
    express.use(urlencoded({extended: false}));
    express.use(helmet());

    // Setup routing.
    express.use('/v1', versionOneRouter);
    this.logger(green('[Server] creating server routing pathways.'));

    // Setup additional v2 routing.
    // TODO: just leaving this hear to show where extra routing would go.

    // setup generic error handling.
    express.use(this.errorHandler.notFound);
    express.use(this.errorHandler.internalServerError);
    this.logger(green('[Server] creating server generic error handling.'));

    return express;
  }
}
